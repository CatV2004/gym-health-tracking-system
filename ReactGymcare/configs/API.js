import axios from "axios";

export const endpoint = {
  login: "/o/token/",
  register: "/member/",
  currentUser: "/user/current/",
  updateInfo: "/user/update/",
  changePassword: "/user/change-password/",
  
};
 
const api = axios.create({
  baseURL:"http://192.168.253.1:8000",
});

export default api;
