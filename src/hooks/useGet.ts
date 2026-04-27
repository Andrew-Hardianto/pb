import { getUrlApi } from '@/services/http.service';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export function useGet<TData = any>(
    queryKey: unknown[],
    urlApi: string,
    options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
    const mutation = useQuery<TData>({
        queryKey,
        queryFn: () => getUrlApi<TData>(urlApi),
        ...options,
    });

    return {
        ...mutation,
        loading: mutation.isPending
    };
}