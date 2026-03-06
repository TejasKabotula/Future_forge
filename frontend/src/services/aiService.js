import api from './api';

export const processVideo = async (data) => {
    const response = await api.post('/api/ai/process', data);
    return response.data;
};

export const chatWithAi = async (messages) => {
    const response = await api.post('/api/ai/chat', { messages });
    return response.data;
};
