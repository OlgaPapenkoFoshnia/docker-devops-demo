const express = require("express");
const { Client } = require("pg");

const app = express();
let client;

async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      client = new Client({
        host: "db",
        user: "postgres",
        password: "postgres",
        database: "postgres",
        port: 5432
      });

      await client.connect();
      console.log("Connected to PostgreSQL");
      return;
    } catch (err) {
      console.log(`DB not ready yet... attempt ${i}/${retries}`);
      if (i === retries) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

app.get("/", async (req, res) => {
  try {
    const result = await client.query("SELECT NOW()");
    res.send(`Database time: ${result.rows[0].now}`);
  } catch (err) {
    res.status(500).send(`Database error: ${err.message}`);
  }
});

async function startServer() {
  try {
    await connectWithRetry();
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (err) {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  }
}

startServer();