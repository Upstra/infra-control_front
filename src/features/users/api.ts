import axios from '@/services/api';
import type { UserMeResponse } from './types';

export const fetchUusers = () => {
  console.log("Hello from users API");
  return axios.get('/users');
};

export const createUusers = (payload: any) => {
  console.log("Creating new users");
  return axios.post('/users', payload);
};

export const getMe = async (token: string): Promise<UserMeResponse> => {
  const response = await axios.get('/user/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}