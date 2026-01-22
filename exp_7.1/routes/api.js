import express from "express";
const router = express.Router();

// Sample product data
const products = [
  { id: 1, name: "Laptop", price: 1200 },
  { id: 2, name: "Mouse", price: 25 },
  { id: 3, name: "Keyboard", price: 45 },
];

// Route: GET /api/products
router.get("/products", (req, res) => {
  res.json(products);
});

export default router;
