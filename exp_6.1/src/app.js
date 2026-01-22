const express = require("express");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

console.log("🔄 Starting Express Server with Middleware...");

// =============================
// MIDDLEWARE 1: Request Logging Middleware
// =============================
const loggingMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 [${timestamp}] ${req.method} ${req.url}`);
  next(); // Continue to next middleware/route
};

// =============================
// MIDDLEWARE 2: Bearer Token Authentication Middleware
// =============================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Access denied",
      message: "Authorization header is required",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Access denied",
      message: "Invalid authorization format. Use: Bearer <token>",
    });
  }

  const token = authHeader.split(" ")[1];
  const validToken = "mysecrettoken";

  if (token !== validToken) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Invalid authentication token",
    });
  }

  console.log("✅ Authentication successful");
  next();
};

// =============================
// Apply Global Middleware
// =============================
app.use(loggingMiddleware);

// =============================
// ROUTES
// =============================

// PUBLIC ROUTE
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Welcome to the Public API!",
    status: "This is a public route - no authentication required",
    endpoints: {
      "GET /": "Public route (this page)",
      "GET /public": "Another public route",
      "GET /protected": "Protected route (requires Bearer token)",
      "POST /protected": "Protected route (requires Bearer token)",
    },
    authentication: {
      header: "Authorization: Bearer mysecrettoken",
      example:
        "curl -H 'Authorization: Bearer mysecrettoken' http://localhost:3000/protected",
    },
  });
});

// ANOTHER PUBLIC ROUTE
app.get("/public", (req, res) => {
  res.json({
    message: "📢 This is a public endpoint",
    access: "No authentication required",
    timestamp: new Date().toISOString(),
  });
});

// PROTECTED ROUTE - Requires Bearer Token
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "🔐 Welcome to the Protected Area!",
    status: "Access granted",
    user: "Authenticated user",
    secretData: {
      apiKey: "xyz-789-abc",
      premiumFeature: "enabled",
      accessLevel: "admin",
    },
    timestamp: new Date().toISOString(),
  });
});

// PROTECTED POST ROUTE
app.post("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "✅ POST request to protected route successful",
    status: "Data received and processed",
    receivedData: req.body,
    user: "Authenticated user",
    timestamp: new Date().toISOString(),
  });
});

// =============================
// Error Handling Middleware
// =============================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong on the server",
  });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.method} ${req.url} does not exist`,
  });
});

// =============================
// Start Server
// =============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Express Server started on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("\n📋 TESTING INSTRUCTIONS:");
  console.log(`   1. Public Route (no auth):`);
  console.log(`      curl http://localhost:${PORT}/`);
  console.log(`   2. Protected Route (with auth):`);
  console.log(
    `      curl -H "Authorization: Bearer mysecrettoken" http://localhost:${PORT}/protected`
  );
  console.log(`   3. Protected Route (wrong token):`);
  console.log(
    `      curl -H "Authorization: Bearer wrongtoken" http://localhost:${PORT}/protected`
  );
  console.log(`   4. Protected Route (no header):`);
  console.log(`      curl http://localhost:${PORT}/protected`);
});
