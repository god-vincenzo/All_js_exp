//exp 2
// Import required modules
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// -------------------- CONFIG --------------------
const SECRET_KEY = "mysecretkey123"; // secret key for signing JWT
let balance = 1000; // demo balance (in-memory only)

// Hardcoded user credentials
const user = {
  username: "user1",
  password: "password123",
};

// -------------------- ROUTES --------------------

// ✅ LOGIN — Generate JWT Token
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // simple check against hardcoded credentials
  if (username === user.username && password === user.password) {
    // generate a JWT token valid for 1 hour
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// -------------------- JWT MIDDLEWARE --------------------
function verifyToken(req, res, next) {
  // Expecting header format: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token missing" });
  }

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = userData; // attach user info from token
    next();
  });
}

// -------------------- PROTECTED ROUTES --------------------

// ✅ Get Balance
app.get("/balance", verifyToken, (req, res) => {
  res.status(200).json({ balance });
});

// ✅ Deposit Money
app.post("/deposit", verifyToken, (req, res) => {
  const { amount } = req.body;

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Invalid deposit amount" });
  }

  balance += amount;
  res.status(200).json({
    message: `Deposited $${amount}`,
    newBalance: balance,
  });
});

// ✅ Withdraw Money
app.post("/withdraw", verifyToken, (req, res) => {
  const { amount } = req.body;

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Invalid withdrawal amount" });
  }

  if (amount > balance) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  balance -= amount;
  res.status(200).json({
    message: `Withdrew $${amount}`,
    newBalance: balance,
  });
});

// -------------------- START SERVER --------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
