import { useState, useEffect } from 'react';
import { getUrlApi } from '@/services/http.service';

interface UseLookupDataProps {
    endpoint: string | null;
}

export const useLookupData = <T = any>({ endpoint }: UseLookupDataProps) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!endpoint) {
            setData([]);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getUrlApi(endpoint, {
                    headers: { 'Content-Type': 'application/json' },
                });

                if (res && res.data) {
                    setData(res.data);
                } else if (Array.isArray(res)) {
                    setData(res);
                } else {
                    setData([]);
                }
            } catch (err: any) {
                console.error(`Failed to fetch from ${endpoint}:`, err);
                setError(err.message || 'Error fetching data');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]);

    return { data, loading, error };
};
