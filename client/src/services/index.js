import axios from 'axios'

export const axiosClient = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },

  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status == "401") {
        try{
            const refreshToken = localStorage.getItem("refreshToken");
            const response = axios.post("/refresh", {
              refreshToken,
            });
            localStorage.setItem("accessToken", response.data.accessToken);
        } catch(e){
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            window.location.href = '/auth';
        }
    }
  }
);
