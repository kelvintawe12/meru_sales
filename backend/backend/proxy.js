// proxy.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfkRjEVwsIHKlxHJRRO9zCkUirFD6Msrg7cEHezZr6vXnrZ94rRkC7rsNVl4XtNavGJQ/exec';

// Helper to build the target URL, preserving query strings
const buildTargetUrl = (req) => {
  const path = req.url.replace(/^\/api/, '').split('?')[0];
  const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  return APPS_SCRIPT_URL + path + query;
};

// Proxy GET requests to /api/*
app.get('/api/*', async (req, res) => {
  const url = buildTargetUrl(req);
  console.log(`[GET] Proxying to: ${url}`);
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    const data = await response.text();

    console.log(`[GET] Apps Script responded with status: ${response.status} ${response.statusText}`);
    if (!response.ok) {
      console.error(`[GET] Error from Apps Script: ${response.status} ${response.statusText}\n${data}`);
      return res.status(response.status).send(data);
    }

    if (contentType && contentType.includes('application/json')) {
      res.type('json').send(data);
    } else {
      res.type('text').send(data);
    }
  } catch (err) {
    console.error(`[GET] Proxy error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Proxy POST requests to /api/*
app.post('/api/*', async (req, res) => {
  const url = buildTargetUrl(req);
  console.log(`[POST] Proxying to: ${url}`);
  console.log(`[POST] Body:`, req.body);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const contentType = response.headers.get('content-type');
    const data = await response.text();

    console.log(`[POST] Apps Script responded with status: ${response.status} ${response.statusText}`);
    if (!response.ok) {
      console.error(`[POST] Error from Apps Script: ${response.status} ${response.statusText}\n${data}`);
      return res.status(response.status).send(data);
    }

    if (contentType && contentType.includes('application/json')) {
      res.type('json').send(data);
    } else {
      res.type('text').send(data);
    }
  } catch (err) {
    console.error(`[POST] Proxy error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Proxy GET requests to /api (no trailing slash)
app.get('/api', async (req, res) => {
  const url = APPS_SCRIPT_URL + (req._parsedUrl.search || '');
  console.log(`[GET] Proxying to: ${url}`);
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    const data = await response.text();

    console.log(`[GET] Apps Script responded with status: ${response.status} ${response.statusText}`);
    if (!response.ok) {
      console.error(`[GET] Error from Apps Script: ${response.status} ${response.statusText}\n${data}`);
      return res.status(response.status).send(data);
    }

    if (contentType && contentType.includes('application/json')) {
      res.type('json').send(data);
    } else {
      res.type('text').send(data);
    }
  } catch (err) {
    console.error(`[GET] Proxy error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Proxy POST requests to /api (no trailing slash)
app.post('/api', async (req, res) => {
  const url = APPS_SCRIPT_URL;
  console.log(`[POST] Proxying to: ${url}`);
  console.log(`[POST] Body:`, req.body);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const contentType = response.headers.get('content-type');
    const data = await response.text();

    console.log(`[POST] Apps Script responded with status: ${response.status} ${response.statusText}`);
    if (!response.ok) {
      console.error(`[POST] Error from Apps Script: ${response.status} ${response.statusText}\n${data}`);
      return res.status(response.status).send(data);
    }

    if (contentType && contentType.includes('application/json')) {
      res.type('json').send(data);
    } else {
      res.type('text').send(data);
    }
  } catch (err) {
    console.error(`[POST] Proxy error:`, err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});