import { postUrlApi } from '@/services/http.service';
import { handleHttpError } from '@/utils/httpError';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

interface UsePostOptions<TData, TVariables> {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any) => void;
    mutationOptions?: Omit<
        UseMutationOptions<TData, any, TVariables>,
        'mutationFn'
    >;
}

export function usePost<TData = any, TVariables = any>(
    urlApi: string,
    options?: UsePostOptions<TData, TVariables>
) {
    const mutation = useMutation<TData, any, TVariables>({
        mutationFn: (variables) => postUrlApi<TData>(urlApi, variables),
        onSuccess: options?.onSuccess,
        onError: (error) => {
            handleHttpError(error);
            options?.onError?.(error);
        },
        ...options?.mutationOptions,
    });

    return {
        ...mutation,
        loading: mutation.isPending
    };
}
