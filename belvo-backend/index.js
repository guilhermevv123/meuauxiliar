const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Configure para seu domínio em produção
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Belvo Configuration
const BELVO_SECRET_ID = process.env.BELVO_SECRET_ID;
const BELVO_SECRET_PASSWORD = process.env.BELVO_SECRET_PASSWORD;
const BELVO_API_URL = 'https://api.belvo.com';

// Validação de credenciais
if (!BELVO_SECRET_ID || !BELVO_SECRET_PASSWORD) {
  console.error('❌ ERRO: Configure BELVO_SECRET_ID e BELVO_SECRET_PASSWORD no .env');
  process.exit(1);
}

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Belvo Backend API - Meu Auxiliar',
    provider: 'Belvo Open Finance',
    endpoints: [
      'POST /api/belvo/widget-token - Get Belvo Widget Token',
      'POST /api/belvo/transactions - Get Transactions from Link',
    ]
  });
});

// Endpoint para gerar Widget Token
app.post('/api/belvo/widget-token', async (req, res) => {
  try {
    console.log('🔑 Requesting Belvo Widget Token...');

    // Step 1: Get Access Token
    const credentials = Buffer.from(`${BELVO_SECRET_ID}:${BELVO_SECRET_PASSWORD}`).toString('base64');
    
    const authResponse = await fetch(`${BELVO_API_URL}/api/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('❌ Belvo auth failed:', errorText);
      throw new Error(`Belvo authentication failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    console.log('✅ Belvo Access Token obtained');

    // Retornar apenas o access token (usado como Widget Token)
    res.json({
      access: authData.access,
      refresh: authData.refresh,
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

// Endpoint para buscar transações de um Link
app.post('/api/belvo/transactions', async (req, res) => {
  try {
    const { link_id, date_from, date_to } = req.body;

    if (!link_id) {
      return res.status(400).json({ error: 'link_id is required' });
    }

    console.log(`📊 Fetching transactions for link: ${link_id}`);

    // Get access token
    const credentials = Buffer.from(`${BELVO_SECRET_ID}:${BELVO_SECRET_PASSWORD}`).toString('base64');
    
    const authResponse = await fetch(`${BELVO_API_URL}/api/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!authResponse.ok) {
      throw new Error('Failed to authenticate');
    }

    const authData = await authResponse.json();

    // Fetch transactions
    let url = `${BELVO_API_URL}/api/transactions/?link=${link_id}`;
    if (date_from) url += `&date_from=${date_from}`;
    if (date_to) url += `&date_to=${date_to}`;

    const transactionsResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.access}`,
        'Content-Type': 'application/json',
      },
    });

    if (!transactionsResponse.ok) {
      const errorText = await transactionsResponse.text();
      throw new Error(`Failed to fetch transactions: ${errorText}`);
    }

    const transactionsData = await transactionsResponse.json();
    console.log(`✅ Found ${transactionsData.results?.length || 0} transactions`);

    res.json(transactionsData);

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Belvo Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 Endpoints:`);
  console.log(`   GET  / - Health check`);
  console.log(`   POST /api/belvo/widget-token - Get Widget Token`);
  console.log(`   POST /api/belvo/transactions - Get Transactions`);
  console.log(`✅ Backend ready!`);
});
