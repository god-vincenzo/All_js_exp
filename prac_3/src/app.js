const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const LOCK_TTL_MS = 60 * 1000;

const seats = {};
const NUM_SEATS = 10;
for (let i = 1; i <= NUM_SEATS; i++) {
  seats[String(i)] = { status: 'available' };
}

function releaseLock(seatId, reason = 'timeout') {
  const s = seats[seatId];
  if (!s) return;
  if (s.status === 'locked') {
    if (s._timer) {
      clearTimeout(s._timer);
      s._timer = undefined;
    }
    delete s.lockId;
    delete s.lockExpiresAt;
    s.status = 'available';
    console.log(`Lock released for seat ${seatId} (${reason})`);
  }
}

app.get('/seats', (req, res) => {
  const out = {};
  for (const [id, s] of Object.entries(seats)) {
    out[id] = {
      status: s.status,
      ...(s.status === 'locked' ? { lockExpiresAt: s.lockExpiresAt } : {}),
    };
  }
  return res.json(out);
});

app.post('/lock/:seatId', (req, res) => {
  const seatId = req.params.seatId;
  const s = seats[seatId];
  if (!s) return res.status(404).json({ message: `Seat ${seatId} does not exist` });

  if (s.status === 'available') {
    const lockId = uuidv4();
    s.status = 'locked';
    s.lockId = lockId;
    s.lockExpiresAt = Date.now() + LOCK_TTL_MS;

    if (s._timer) clearTimeout(s._timer);

    s._timer = setTimeout(() => {
      releaseLock(seatId, 'expired');
    }, LOCK_TTL_MS);

    return res.json({ message: `Seat ${seatId} locked successfully. Confirm within ${LOCK_TTL_MS / 1000} seconds.`, lockId });
  }

  if (s.status === 'locked') {
    return res.status(400).json({ message: `Seat ${seatId} is already locked` });
  }

  return res.status(400).json({ message: `Seat ${seatId} is already booked` });
});

app.post('/confirm/:seatId', (req, res) => {
  const seatId = req.params.seatId;
  const { lockId } = req.body || {};
  const s = seats[seatId];
  if (!s) return res.status(404).json({ message: `Seat ${seatId} does not exist` });

  if (s.status !== 'locked') {
    return res.status(400).json({ message: 'Seat is not locked and cannot be booked' });
  }

  if (!lockId || lockId !== s.lockId) {
    return res.status(400).json({ message: 'Invalid or missing lockId. Provide the lockId returned when the seat was locked.' });
  }

  if (s._timer) {
    clearTimeout(s._timer);
    s._timer = undefined;
  }
  delete s.lockExpiresAt;
  delete s.lockId;
  s.status = 'booked';

  return res.json({ message: `Seat ${seatId} booked successfully!` });
});

app.post('/unlock/:seatId', (req, res) => {
  const seatId = req.params.seatId;
  const s = seats[seatId];
  if (!s) return res.status(404).json({ message: `Seat ${seatId} does not exist` });
  releaseLock(seatId, 'manual');
  return res.json({ message: `Seat ${seatId} lock released (if any)` });
});

const server = app.listen(PORT, () => {
  console.log(`Ticket booking server running on http://localhost:${PORT}`);
});

if (process.env.RUN_TEST === '1') {
  (async () => {
    const axios = require('axios').create({ baseURL: `http://localhost:${PORT}`, timeout: 5000 });
    const concurrent = 6;
    const seatToTarget = '5';
    console.log('\n--- starting concurrent lock test ---');

    const promises = Array.from({ length: concurrent }, (_, i) =>
      axios.post(`/lock/${seatToTarget}`).then(r => ({ ok: true, data: r.data })).catch(e => ({ ok: false, data: e.response ? e.response.data : { message: e.message } }))
    );

    const results = await Promise.all(promises);
    results.forEach((r, i) => console.log(`Requester ${i + 1}:`, r));

    const success = results.find(r => r.ok && r.data && r.data.lockId);
    if (success) {
      console.log('\nAttempting confirm with correct lockId...');
      const confirmResp = await axios.post(`/confirm/${seatToTarget}`, { lockId: success.data.lockId }).then(r => r.data).catch(e => e.response ? e.response.data : { message: e.message });
      console.log('Confirm response:', confirmResp);
    }

    console.log('\nAttempting confirm with invalid lockId...');
    const badConfirm = await axios.post(`/confirm/${seatToTarget}`, { lockId: 'invalid-token' }).then(r => r.data).catch(e => e.response ? e.response.data : { message: e.message });
    console.log('Bad confirm response:', badConfirm);

    console.log('\nFinal seats state:');
    console.log((await axios.get('/seats')).data);

    server.close();
  })();
}