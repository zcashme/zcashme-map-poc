import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export function useCityClusters() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await fetch(API_URL);
                if (!res.ok) {
                    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
                }
                const json = await res.json();

                // Data is now enriched by the backend
                setData(json);
                setError(null);
            } catch (err) {
                console.error("Error loading clusters:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return { data, loading, error };
}
