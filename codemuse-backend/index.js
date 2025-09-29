// jwt-test.js
import jwt from "jsonwebtoken";

// Your secret key
const SECRET = "v3ry$tr0ngS3cr3tK3y_For_CodeMuse_2025!";

// Example payload
const payload = {
  id: "68b9973a252b3f3ee2bc74b2",
  email: "houssam.eddine.elfarr2@ibm.com",
};

// Options: set expiration (1 week)
const options = {
  expiresIn: "7d", // or "1h" for 1 hour
};

try {
  // 1️⃣ Generate JWT
  const token = jwt.sign(payload, SECRET, options);
  console.log("Generated token:\n", token, "\n");

  // 2️⃣ Verify JWT immediately
  const decoded = jwt.verify(token, SECRET);
  console.log("✅ Token verified successfully!");
  console.log("Decoded payload:\n", decoded);
} catch (err) {
  console.error("❌ Error:", err.message);
}
