const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'reports.json');

let reports = [];

// Load reports from file if exists
if (fs.existsSync(DATA_FILE)) {
  const data = fs.readFileSync(DATA_FILE);
  reports = JSON.parse(data);
}

// Save reports to file
function saveReports() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2));
}

// Generate unique crime number
function generateCrimeNumber() {
  return 'CR' + Date.now();
}

// Submit new report
app.post('/reports', (req, res) => {
  const { type, description, location, date } = req.body;
  if (!type || !description || !location || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const crimeNumber = generateCrimeNumber();
  const newReport = {
    crimeNumber,
    type,
    description,
    location,
    date,
    status: 'Pending',
    updates: []
  };
  reports.push(newReport);
  saveReports();
  res.json({ crimeNumber });
});

// Get report by crime number
app.get('/reports/:crimeNumber', (req, res) => {
  const crimeNumber = req.params.crimeNumber;
  const report = reports.find(r => r.crimeNumber === crimeNumber);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});

// Get all reports
app.get('/reports', (req, res) => {
  res.json(reports);
});

app.listen(PORT, () => {
  console.log("Crime Report System API running on port " + PORT);
});
