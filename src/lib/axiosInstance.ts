import { encrypt } from '@/services/crypto.service';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { authoritiesToken, dismissLoading, getAccessToken, getMainUrl, getRefreshToken, logout, tenantId } from '../services/main-service.service';
import { setSecure } from '../services/storage.service';

let refreshTokenPromise: Promise<string> | null = null;

let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token!);
    });
    failedQueue = [];
};

export const axiosInstance: AxiosInstance = axios.create({
    baseURL: getMainUrl(),
    timeout: 60000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Jika user set custom header sendiri, skip inject default
        if ((config as any)._skipDefaultHeaders) {
            return config;
        }

        const tenantIds = await tenantId();
        const accessToken = await getAccessToken();
        const authToken = await authoritiesToken();

        if (accessToken) config.headers['Authorization'] = `Bearer ${accessToken}`;
        if (authToken) config.headers['AuthorizationToken'] = authToken;
        if (tenantIds) config.headers['X-TenantID'] = tenantIds;

        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 403) {
            await dismissLoading();
            logout();
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (refreshTokenPromise) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((newToken) => {
                    // Jika pakai custom header, update Authorization di custom header juga
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                });
            }

            refreshTokenPromise = doRefreshToken().finally(() => {
                refreshTokenPromise = null;
            });

            try {
                const newAccessToken = await refreshTokenPromise;
                const authToken = await authoritiesToken();
                const tenantID = await tenantId();

                processQueue(null, newAccessToken);

                // Selalu update Authorization di header apapun (default atau custom)
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['AuthorizationToken'] = authToken;
                originalRequest.headers['X-TenantID'] = tenantID;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                await dismissLoading();
                logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ─── Refresh Token ─────────────────────────────────────────────────────────
async function doRefreshToken(): Promise<string> {
    const refreshToken = await getRefreshToken();
    const url = `${getMainUrl()}/api/public/v1/auth/refresh`;

    const response = await axios.post(
        url,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
    );

    const { access_token, refresh_token } = response.data;

    await setSecure('SXNIUDH1WJ', encrypt(access_token));
    await setSecure('GLA6F07C76', encrypt(refresh_token));

    return access_token;
}
