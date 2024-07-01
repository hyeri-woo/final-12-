import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_HOST,
});

instance.defaults.headers.post['Content-Type'] = 'application/json';
instance.defaults.headers.put['Content-Type'] = 'application/json';

instance.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem('recoil-persist')).userToken;
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    } else {
      delete config.headers['Authorization'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default instance;
