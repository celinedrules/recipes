import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const query = searchParams.get("query")?.toLowerCase();

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            const { data, error } = await supabase.rpc("search_recipes", {
                q: query,
            });

            if (error) {
                console.error("Search error:", error.message);
            } else {
                setResults(data);
            }

            setLoading(false);
        };

        if (query) {
            fetchResults();
        }
    }, [query]);

    return (
        <div className="search-results">
            <h1>Search Results for: "{query}"</h1>
            {loading ? (
                <p>Loading...</p>
            ) : results.length > 0 ? (
                <ul>
                    {results.map((recipe) => (
                        <li key={recipe.id}>
                            <a href={`/recipe/${recipe.slug}`}>
                                <img src={recipe.image_url} alt={recipe.name} />
                                <p>{recipe.name}</p>
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No recipes found.</p>
            )}
        </div>
    );
};

export default SearchResults;
