const express = require("express");
const sql = require("mssql"); // Import mssql
const cors = require('cors'); // Import cors
const lookupsRoutes = require('./routes/lookups'); // Import your lookup routes

const app = express();
const port = process.env.PORT || 3000; // Corrected port assignment
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

// Mount the lookup routes under /lookup
app.use("/lookup", lookupsRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`); // Corrected template literal
});

// Database Configuration
const dbConfig = {
    user: process.env.DB_USER || "SA", // Corrected default value assignment
    password: process.env.DB_PASSWORD || "Data2025", // Corrected default value assignment and added '!'
    server: process.env.DB_SERVER || "172.17.0.3", // Recommended for Docker environment
    database: process.env.DB_NAME || "ClientDB",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

// Connect to SQL Server
sql.connect(dbConfig)
    .then(() => console.log("Connected to SQL Server"))
    .catch((err) => console.error("Database Connection Failed:", err));