import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // 后端接口地址
    timeout: 5000,
});

export const getParrots = () => api.get('/parrots');

export const addParrot = (data) => api.post('/parrots', data);

export const updateParrot = (id, data) => api.put(`/parrots/${id}`, data);

export async function getParrotsByCageId(cageId) {return await api.get(`/parrots/by-cage/${cageId}`);}

export const getCages = () => api.get('/cages');

export const addCage = (data) => api.post('/cages', data);

export const deleteCage = (id) => api.delete(`/cages/${id}`);

export const searchParrotsByRing = (ring) => api.get('/parrots/search/like', { params: { ring } });

export const getSpeciesList = () => api.get('/species');

export const createSpecies = (data) => api.post('/species', data);

export const deleteSpecies = (id) => api.delete(`/species/${id}`);

export const deleteParrot = (id) => { return api.delete(`/parrots/${id}`);};

