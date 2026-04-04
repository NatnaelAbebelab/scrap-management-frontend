import axios from 'axios';
import { tokenService } from './tokenService';
import { API_BASE_URL, STATIC_PATH } from '../config';


export const authService = {
  refreshToken: async (): Promise<string | null> => {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/user/api/token/refresh/`, {
        refresh: refreshToken
      });

      if (response.data && response.data.access) {
        const { access, refresh } = response.data;
        // Optionally update refresh if backend returns a new one
        if (refresh) {
          tokenService.setTokens(access, refresh);
        } else {
          tokenService.setAccessToken(access);
        }
        return access;
      }
      return null;
    } catch (error) {
      console.error('Refresh token failed', error);
      return null;
    }
  },

  logout: (): void => {
    tokenService.clearAuthData();
    // Redirect to login page
    window.location.href = `${STATIC_PATH}login`;
  }
};
