require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PRODUCT_PORT || 5000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4000/api/verify-token";

app.use(bodyParser.json());
app.use(cors());

const products = [
    { id: 1, name: "Laptop", price: 1000 },
    { id: 2, name: "Phone", price: 500 },
    { id: 3, name: "Tablet", price: 300 }
];

async function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    console.log(`🔍 Token received in product-service:`, authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ No valid Authorization header found.");
        return res.status(403).json({ message: "⚠ Access denied. No valid token provided." });
    }

    const token = authHeader.split(" ")[1];
    console.log(`🔍 Extracted Token: ${token}`);

    try {
        console.log(`🔍 Attempting to connect to auth service at: ${AUTH_SERVICE_URL}/api/verify-token`);
        const response = await axios.post(`${AUTH_SERVICE_URL}/api/verify-token`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
    
        console.log("✅ Token verification response:", response.data);
        req.user = response.data.user;
        next();
    } catch (error) {
        console.error("❌ Error verifying token:", error.message);
        
        if (error.code) {
            console.error(`❌ Error code: ${error.code}`);
        }
        
        if (error.response) {
            console.error(`❌ Response status: ${error.response.status}`);
            console.error(`❌ Response data:`, error.response.data);
        }
        
        res.status(401).json({ message: "⚠ Invalid or expired token" });
    }
}

app.get("/", (req, res) => {
    res.send("✅ Product Service is running. Use /api/products.");
});

//get all prods
app.get("/api/products", verifyToken, (req, res) => {
    console.log(`✅ Products accessed by: ${req.user.username}`);
    res.json({ message: "✅ Authorized access", products });
});

app.listen(PORT, () => console.log(`🚀 Product Service running on port ${PORT}`));
