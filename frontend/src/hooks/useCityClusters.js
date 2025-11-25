import { useState, useEffect } from 'react';

export function useCityClusters() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await fetch("https://zcashme-map-api.trinath-panda-6cd.workers.dev/");
                if (!res.ok) {
                    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
                }
                const json = await res.json();

                // Mock categories for development
                const categories = ["Business", "Personal", "Organization"];
                const enrichedData = json.map(city => ({
                    ...city,
                    users: city.users.map(u => ({
                        name: u,
                        category: categories[Math.floor(Math.random() * categories.length)]
                    }))
                }));

                setData(enrichedData);
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
