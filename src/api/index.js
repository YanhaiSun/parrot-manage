import axios from 'axios';

const api = axios.create({
    baseURL: 'https://jaychou.sbs/parrot/api',
    // baseURL: 'http://127.0.0.1:18976/api',
    timeout: 5000,
});

// 用于标记是否正在刷新token
let isRefreshing = false;
// 存储待重试的请求
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

// 请求拦截器：自动添加accessToken
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器：处理401错误并自动刷新token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // 如果正在刷新token，将请求加入队列
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshTokenValue = localStorage.getItem('refreshToken');

            if (refreshTokenValue) {
                try {
                    // 使用独立的axios实例避免循环调用
                    const refreshApi = axios.create({
                        baseURL: 'http://127.0.0.1:18976/api',
                        timeout: 5000,
                    });

                    const response = await refreshApi.post('/auth/refresh', {
                        refreshToken: refreshTokenValue
                    });

                    const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;

                    // 更新本地存储
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    localStorage.setItem('expiresIn', expiresIn);

                    // 更新请求头
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    processQueue(null, accessToken);

                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    // 刷新失败，清除存储并跳转登录
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('expiresIn');
                    localStorage.removeItem('username');
                    localStorage.removeItem('nickname');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // 没有refreshToken，直接跳转登录
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('expiresIn');
                localStorage.removeItem('username');
                localStorage.removeItem('nickname');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// 修改 getParrots 方法，添加分页参数
export const getParrots = (page = 1, pageSize = 50) =>
    api.get(`/parrots?pageNum=${page}&pageSize=${pageSize}`);

// 获取所有鹦鹉（不分页）
export const getAllParrots = () =>
    api.get(`/parrots`, {
        params: {
            all: true
        },
    });

export const addParrot = (data) => api.post('/parrots', data);

export const updateParrot = (id, data) => api.put(`/parrots/${id}`, data);

export async function getParrotsByCageId(cageId) {return await api.get(`/parrots/by-cage/${cageId}`);}

export const getCages = (page = 1, pageSize = 50) =>
    api.get(`/cages/with-parrot-count?pageNum=${page}&pageSize=${pageSize}`);

export const getAllCages = () => api.get('/cages/all');

export const getCageById = (cageId) =>
    api.get(`/cages/${cageId}`)
export const addCage = (data) => api.post('/cages', data);

export const deleteCage = (id) => api.delete(`/cages/${id}`);

export const searchParrotsByRing = (ring) => api.get('/parrots/search/like', { params: { ring } });

export const getSpeciesList = () => api.get('/species');

export const updateSpecies = (id, data) => {
    return api({
        url: `/species/${id}`,
        method: 'PUT',
        data,
    });
};

// api.js
export const getCagesByLocation = (location) => {
    return api.get(`/cages/by-location/${location}`);
}

// list-with-parrot-count
export const getCagesWithParrotCountAll = () => {
    return api.get('/cages/list-with-parrot-count');
}
export const searchCages = (keyword) => {
    return api.get('/cages/search', {
        params: {
            keyword
        }
    });
};

export const searchCagesWithParrots = (keyword) => {
    return api.get('/cages/search-with-parrot-count', {
        params: {
            keyword
        }
    });
};


export const createSpecies = (data) => api.post('/species', data);

export const deleteSpecies = (id) => api.delete(`/species/${id}`);

export const deleteParrot = (id) => { return api.delete(`/parrots/${id}`);};

// 认证相关API
export const login = (credentials) => api.post('/auth/login', credentials);

export const checkUsername = (username) => api.get('/auth/check', { params: { username } });

export const refreshToken = (refreshTokenValue) => api.post('/auth/refresh', {
    refreshToken: refreshTokenValue
});

