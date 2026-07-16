import axios from "axios";

export const API_BASE_URL = "http://padmavathi.pcstech.in/Bridal-Boutique-backend/api/";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

export default api;
