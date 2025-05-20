import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import RecipeList from "../components/Recipes/RecipeList.jsx";

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
            <h1>Search Results for "{query}"</h1>
            {loading ? (
                <p>Loading...</p>
            ) : results.length > 0 ? (
                <RecipeList recipes={results} />
            ) : (
                <p>No recipes found.</p>
            )}
        </div>
    );
};

export default SearchResults;
