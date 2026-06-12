import axios from "axios";

const BASE_URL = "https://ecommerce-app-otze.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
});

export default API;