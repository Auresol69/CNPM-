// src/services/messageService.js
import api from '../api/apiClient';
import { mockGetMyMessagesResponse } from '../mocks/mockTripResponses'; // Fallback mock

export const getMyMessages = async () => {
  try {
    const response = await api.get('/messages/me');
    return response.data.data;
  } catch (error) {
    console.warn('API getMyMessages failed → using mock', error);
    return mockGetMyMessagesResponse.data; // Fallback
  }
};