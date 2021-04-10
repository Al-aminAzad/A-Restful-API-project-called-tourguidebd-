import axios from 'axios';
import { showAlert } from './alert';
export const auth = async (data, type) => {
  try {
    const url =
      type === 'logged in' ? 'http://127.0.0.1:3000/api/v1/users/login' : 'http://127.0.0.1:3000/api/v1/users/signup';
    const res = await axios({
      method: 'POST',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `✔ ${type.toUpperCase()} successfully`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', `✘ ${err.response.data.message}`);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlert('Error', 'Error loging out! Try again');
  }
};
