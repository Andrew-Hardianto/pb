// src/services/apiService.ts
import { axiosInstance } from '@/lib/axiosInstance';
import { AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';

export type RequestHeaders = RawAxiosRequestHeaders;

interface ApiConfig extends Omit<AxiosRequestConfig, 'headers'> {
    headers?: RequestHeaders;
}

// ─── Helper: build config dengan flag skip default headers ───────────────────
function buildConfig(config?: ApiConfig): AxiosRequestConfig {
    if (config?.headers && Object.keys(config.headers).length > 0) {
        return {
            ...config,
            headers: config.headers,
            // Flag ini dibaca di request interceptor untuk skip inject default
            _skipDefaultHeaders: true,
        } as AxiosRequestConfig;
    }

    // Tidak ada custom header → interceptor akan inject default header otomatis
    return config ?? {};
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function postUrlApi<T = any>(
    urlApi: string,
    dataPost: any,
    config?: ApiConfig
): Promise<T> {
    const isFormData = dataPost instanceof FormData;
    const finalConfig = buildConfig(config);

    // Hapus Content-Type untuk FormData agar boundary ter-set otomatis
    if (isFormData && finalConfig.headers?.['Content-Type']) {
        delete finalConfig.headers['Content-Type'];
    }

    const response = await axiosInstance.post<T>(urlApi, dataPost, finalConfig);
    return response.data;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteUrlApi<T = any>(
    urlApi: string,
    config?: ApiConfig
): Promise<T> {
    const response = await axiosInstance.delete<T>(urlApi, buildConfig(config));
    return response.data;
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function getUrlApi<T = any>(
    urlApi: string,
    config?: ApiConfig
): Promise<T> {
    const response = await axiosInstance.get<T>(urlApi, buildConfig(config));
    return response.data;
}