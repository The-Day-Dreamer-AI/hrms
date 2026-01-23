import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL

export const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
});
