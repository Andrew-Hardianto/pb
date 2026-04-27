import { getUrlApi } from '@/services/http.service';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export function useGet<TData = any>(
    queryKey: unknown[],
    urlApi: string,
    options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
    return useQuery<TData>({
        queryKey,
        queryFn: () => getUrlApi<TData>(urlApi),
        ...options,
    });
}