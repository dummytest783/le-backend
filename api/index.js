const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());

// Test URL to check if the server is running
app.get("/test", (req, res) => {
  res.status(200).send({ message: "Server is up and running!" });
});

app.get("/analyze-stocks", (req, res) => {
  console.log("Received request to analyze stocks", req.query);

  // Validate and sanitize the `tickers` query parameter
  const tickers = req.query.tickers;
  if (!tickers) {
    res.status(400).send({ error: "Tickers query parameter is required" });
    return;
  }
  
  // Sanitize the tickers input to prevent command injection
  const sanitizedTickers = tickers.replace(/[^a-zA-Z0-9,]/g, "");
  const args = `--tickers ${sanitizedTickers}`;

  // Use an absolute path for the Python script
  const scriptPath = path.resolve(__dirname, "../scripts/analyze_stock.py");

  // Execute the Python script
  exec(`python3 ${scriptPath} ${args}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      res.status(500).send({ error: "Error executing Python script" });
      return;
    }

    if (stderr) {
      console.error(`Python script error: ${stderr}`);
      res.status(500).send({ error: stderr });
      return;
    }

    try {
      // Parse and send the JSON response from the Python script
      const response = JSON.parse(stdout);
      res.json(response);
    } catch (parseError) {
      console.error(`Error parsing Python output: ${parseError.message}`);
      res.status(500).send({ error: "Error parsing Python output" });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
