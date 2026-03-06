import api from './api';

export const getPlaylists = async () => {
    const response = await api.get('/api/playlists');
    return response.data;
};

export const getPlaylistById = async (id) => {
    const response = await api.get(`/api/playlists/${id}`);
    return response.data;
};

export const createPlaylist = async (data) => {
    const response = await api.post('/api/playlists', data);
    return response.data;
};

export const deletePlaylist = async (id) => {
    const response = await api.delete(`/api/playlists/${id}`);
    return response.data;
};
