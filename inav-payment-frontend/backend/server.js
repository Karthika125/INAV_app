// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_KEY must be set in your environment (.env)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('inav-payment-backend is running'));

// GET /customers
app.get('/customers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('customers').select('*').order('id', { ascending: true });
    if (error) {
      console.error('Supabase error (customers):', error);
      return res.status(500).json({ error: error.message || error });
    }
    res.json(data);
  } catch (err) {
    console.error('Server error (customers):', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /payments
app.post('/payments', async (req, res) => {
  try {
    const { account_number, payment_amount } = req.body;
    if (!account_number || payment_amount == null) {
      return res.status(400).json({ error: 'account_number and payment_amount required' });
    }

    // find customer
    const { data: customer, error: findErr } = await supabase
      .from('customers')
      .select('*')
      .eq('account_number', account_number)
      .limit(1)
      .maybeSingle();

    if (findErr) {
      console.error('Supabase find error:', findErr);
      return res.status(500).json({ error: findErr.message || findErr });
    }
    if (!customer) return res.status(404).json({ error: 'Account not found' });

    const toInsert = {
      customer_id: customer.id,
      account_number,
      payment_amount,
      payment_date: new Date().toISOString(),
      status: 'SUCCESS'
    };

    const { data: inserted, error: insertErr } = await supabase.from('payments').insert(toInsert).select();
    if (insertErr) {
      console.error('Supabase insert error:', insertErr);
      return res.status(500).json({ error: insertErr.message || insertErr });
    }
    res.status(201).json({ message: 'Payment recorded', payment: inserted[0] });
  } catch (err) {
    console.error('Server error (payments):', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /payments/:account_number
app.get('/payments/:account_number', async (req, res) => {
  try {
    const account = req.params.account_number;
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('account_number', account)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Supabase error (payments):', error);
      return res.status(500).json({ error: error.message || error });
    }
    res.json(data);
  } catch (err) {
    console.error('Server error (get payments):', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
