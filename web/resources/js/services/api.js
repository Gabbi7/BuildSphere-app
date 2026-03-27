import axios from 'axios';

// Configure axios defaults for Laravel session/CSRF handling
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Axios automatically reads the XSRF-TOKEN cookie and sends it as X-XSRF-TOKEN header
const api = axios.create({
    baseURL: '/',
});

export default api;

