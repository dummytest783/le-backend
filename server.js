const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());

app.get("/api/analyze-stocks", (req, res) => {
  console.log("Received request to analyze stocks", req.query);

   // Convert query parameters into a string of arguments
   const tickers = req.query.tickers || ""; // e.g., "AAPL,MSFT,GOOGL"
   const args = `--tickers ${tickers}`;

  exec(`python3 scripts/analyze_stock.py ${args}`, (error, stdout, stderr) => {
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
