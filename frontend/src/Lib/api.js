"import axios from \"axios\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const generateCaptcha = async (type) => {
  const { data } = await api.post(`/captcha/generate`, { type });
  return data;
};

export const verifyCaptcha = async (captcha_id, answer) => {
  const { data } = await api.post(`/verify`, { captcha_id, answer });
  return data;
};

export const adminLogin = async (password) => {
  const { data } = await api.post(`/admin/login`, { password });
  return data;
};

export const fetchAdminStats = async (token) => {
  const { data } = await api.get(`/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const adminReset = async (token) => {
  const { data } = await api.post(
    `/admin/reset`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
"