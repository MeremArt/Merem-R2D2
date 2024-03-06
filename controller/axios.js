const axios = require("axios");
require("dotenv").config();
const MY_TOKEN = process.env.MY_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;

const getAxiosInstance = () => {
  const instance = axios.create({
    baseURL: BASE_URL,
  });

  const get = async (method, params) => {
    try {
      const response = await instance.get(`/${method}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error in GET request:", error.message);
      throw error;
    }
  };

  const post = async (method, data) => {
    try {
      const response = await instance.post(`/${method}`, data);
      return response.data;
    } catch (error) {
      console.error("Error in POST request:", error.message);
      throw error;
    }
  };

  return {
    get,
    post,
  };
};

module.exports = { getAxiosInstance };
