import apiClient from './apiClient';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface ApiRequestOptions {
  url: string;
  method: HttpMethod;
  data?: any;
  params?: any;
  pagination?: PaginationParams;
  headers?: any;
  responseType?: 'json' | 'blob';
}

export interface StandardApiResponse<T = any> {
  result?: string;
  message?: string;
  content?: T;
  status: number;
}

export const apiRequest = async <T = any>(options: ApiRequestOptions): Promise<StandardApiResponse<T>> => {
  const { url, method, data, params, pagination, headers, responseType } = options;

  let requestParams = { ...params };
  
  // Handing pagination gracefully
  if (pagination) {
    if (pagination.page !== undefined) requestParams.page = pagination.page;
    if (pagination.page_size !== undefined) requestParams.page_size = pagination.page_size;
  }

  const config: AxiosRequestConfig = {
    url,
    method,
    data,
    params: requestParams,
    headers: headers || {},
    responseType,
  };

  // If sending FormData, we must let axios set the Content-Type automatically (with boundary)
  if (data instanceof FormData && config.headers) {
    delete (config.headers as any)['Content-Type'];
  }

  try {
    const response: AxiosResponse = await apiClient(config);
    return {
      result: response.data?.result || 'success',
      message: response.data?.message || 'Request successful',
      content: response.data?.content !== undefined ? response.data.content : response.data,
      status: response.status,
    };
  } catch (error: any) {
    if (error.response) {
      return {
        result: error.response.data?.result || 'error',
        message: error.response.data?.message || error.response.data?.detail || 'An error occurred during the request.',
        content: error.response.data?.content || error.response.data,
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        result: 'error',
        message: 'No response received from the server. Please check your network connection.',
        status: 0,
      };
    } else {
      return {
        result: 'error',
        message: error.message || 'An unexpected error occurred while processing your request.',
        status: 0,
      };
    }
  }
};
