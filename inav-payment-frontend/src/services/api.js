import axios from 'axios';

const API_BASE = 'https://inav-app.onrender.com';

export const fetchCustomers = async () => {
  const res = await axios.get(`${API_BASE}/customers`);
  return res.data;
};

export const createPayment = async (payload) => {
  const res = await axios.post(`${API_BASE}/payments`, payload);
  return res.data;
};

export const fetchPayments = async (account) => {
  const res = await axios.get(`${API_BASE}/payments/${account}`);
  return res.data;
};
