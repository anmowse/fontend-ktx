import axios from 'axios';
import { API_URL } from '../config';

export const updateStudentInfo = async (data) => {
  try {
    const response = await axios.put(`${API_URL}/students/update-info`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (data) => {
  try {
    const response = await axios.put(`${API_URL}/students/change-password`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 