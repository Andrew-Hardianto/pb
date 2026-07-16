// src/services/apiService.ts
import { axiosInstance } from '@/lib/axiosInstance';
import { AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { authoritiesToken, getAccessToken, getMainUrl, tenantId } from './main-service.service';

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
    const isFormData = dataPost && dataPost._parts;

    if (isFormData) {
        const tenantIds = await tenantId();
        const accessToken = await getAccessToken();
        const authToken = await authoritiesToken();

        const headers: any = {
            ...(config?.headers || {})
        };

        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        if (authToken) headers['AuthorizationToken'] = authToken;
        if (tenantIds) headers['X-TenantID'] = tenantIds;
        
        // Hapus Content-Type manual agar React Native bisa inject otomatis dengan boundary yang benar
        delete headers['Content-Type'];

        const response = await fetch(getMainUrl() + urlApi, {
            method: 'POST',
            body: dataPost,
            headers,
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: response.statusText };
            }
            throw { response: { status: response.status, data: errorData } };
        }

        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);
    }

    const finalConfig = buildConfig(config);
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