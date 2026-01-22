// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Create Express app
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/bankdb")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, required: true, min: 0 }
});

// Create User Model
const User = mongoose.model("User", userSchema);

// ------------------ ROUTES ------------------

// 🧍 Create sample users
app.post("/create-users", async (req, res) => {
  try {
    const users = await User.insertMany([
      { name: "Alice", balance: 1000 },
      { name: "Bob", balance: 500 }
    ]);

    res.status(201).json({
      message: "Users created",
      users
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 💸 Transfer money between users
app.post("/transfer", async (req, res) => {
  try {
    const { fromUserId, toUserId, amount } = req.body;

    // Validate input
    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // Find both users
    const sender = await User.findById(fromUserId);
    const receiver = await User.findById(toUserId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check balance
    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Sequentially update balances
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.status(200).json({
      message: `Transferred $${amount} from ${sender.name} to ${receiver.name}`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --------------------------------------------

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
