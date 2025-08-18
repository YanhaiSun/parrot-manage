import axios from 'axios';

const api = axios.create({
    // baseURL: 'https://suduan.top/parrot/api', // 后端接口地址
    baseURL: 'http://localhost:18976/api',
    timeout: 5000,
});

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

