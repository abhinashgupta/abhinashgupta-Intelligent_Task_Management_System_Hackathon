import axios from "axios";

const api = axios.create({
  baseURL: "https://inteliigent-task-management-hackathon-bbo2.onrender.com/api", // Ensure this matches your server's base URL
});

export default api;
