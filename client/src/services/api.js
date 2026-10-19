import axios from "axios";

const api = axios.create({
  // আপনার লাইভ Render লিংকটি এখানে বসানো আছে
  baseURL: "https://tuition-manager-0xwc.onrender.com/api", 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 👈 নতুন: রেসপন্স ইন্টারসেপ্টর (ব্লকড ইউজার হ্যান্ডেল)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // যদি ৪০৩ এরর আসে এবং মেসেজে blocked থাকে
    if (
      error.response && 
      error.response.status === 403 && 
      error.response.data.message && 
      error.response.data.message.includes("blocked")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Your account has been blocked by the Admin. You will be logged out.");
      window.location.href = "/login"; // লগইন পেজে রিডাইরেক্ট
    }
    return Promise.reject(error);
  }
);

export default api;