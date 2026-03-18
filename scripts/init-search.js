#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const MEILI_SEARCH_API_KEY = 'u8F9BL9hKO7WK9Xp741Ie1jxB0gXSZQX';

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: result });
        } catch (e) {
          resolve({ ok: false, status: res.statusCode, data: { error: 'Invalid JSON response', raw: data } });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function initializeSearch() {
  console.log('🔍 Initializing Meilisearch indexes...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/search/init`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MEILI_SEARCH_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ Search indexes initialized successfully');
      console.log('📊 Result:', response.data.message);
    } else {
      console.error('❌ Failed to initialize search indexes');
      console.error('Status:', response.status);
      console.error('Error:', response.data.error || response.data);
      if (response.data.details) {
        console.error('Details:', response.data.details);
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('💡 Make sure your Next.js server is running on', BASE_URL);
  }
}

initializeSearch();