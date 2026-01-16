// Minimal test server for Railway
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Simple health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running!' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Event Attendance API - Test Mode' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Test server running on port ${PORT}`);
});
