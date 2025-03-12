require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.AUTH_PORT || 4000;
const SECRET_KEY = process.env.SECRET_KEY || "mysecretkey";

app.use(bodyParser.json());
app.use(cors());

let users = []; 

app.get("/", (req, res) => {
    res.send("✅ Auth Service is running. Use /api/register or /api/login.");
});


app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "⚠ Username and password required" });
    }

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "⚠ User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    console.log(`✅ User registered: ${username}`);
    res.status(201).json({ message: "✅ User registered successfully" });
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);

    if (!user) return res.status(400).json({ message: "⚠ User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "⚠ Invalid credentials" });

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: "1h" });

    console.log(`✅ User logged in: ${username}`);
    res.json({ message: "✅ Login successful", token });
});

app.post("/api/verify-token", (req, res) => {
    const authHeader = req.headers["authorization"];
    console.log(`🔍 Auth Service received verification request with header: ${authHeader}`);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ No Authorization header found.");
        return res.status(403).json({ message: "⚠ Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; 
    console.log(`🔍 Auth Service verifying token: ${token}`);

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log(`❌ Token verification failed: ${err.name} - ${err.message}`);
            return res.status(401).json({ message: `⚠ Invalid or expired token: ${err.message}` });
        }

        console.log(`✅ Token verified for user: ${decoded.username}`);
        res.json({ valid: true, user: decoded });
    });
});

app.listen(PORT, () => console.log(`🚀 Auth Service running on port ${PORT}`));
