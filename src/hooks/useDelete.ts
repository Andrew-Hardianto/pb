import { deleteUrlApi } from '@/services/http.service';
import { handleHttpError } from '@/utils/httpError';
import { useMutation } from '@tanstack/react-query';

export function useDelete<TData = any>(
    urlApi: string,
    options?: {
        onSuccess?: (data: TData) => void;
        onError?: (error: any) => void;
    }
) {
    return useMutation<TData, any, void>({
        mutationFn: () => deleteUrlApi<TData>(urlApi),
        onSuccess: options?.onSuccess,
        onError: (error) => {
            handleHttpError(error);
            options?.onError?.(error);
        },
    });
}
