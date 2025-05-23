import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase.js";
import "./FavoriteToggle.scss"; // for styling the heart

const FavoriteToggle = ({ recipeId, sessionUser }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (!sessionUser) return;

        async function fetchFavoriteStatus() {
            const { data } = await supabase
                .from("saved_recipes")
                .select("id")
                .eq("user_id", sessionUser.id)
                .eq("recipe_id", recipeId)
                .maybeSingle();

            setIsFavorite(!!data);
        }

        fetchFavoriteStatus();
    }, [recipeId, sessionUser]);

    const toggleFavorite = async () => {
        if (!sessionUser) {
            alert("Please log in to save recipes.");
            return;
        }

        if (isFavorite) {
            await supabase
                .from("saved_recipes")
                .delete()
                .eq("user_id", sessionUser.id)
                .eq("recipe_id", recipeId);
            setIsFavorite(false);
        } else {
            await supabase
                .from("saved_recipes")
                .insert({ user_id: sessionUser.id, recipe_id: recipeId });
            setIsFavorite(true);
        }
    };

    return (
        <button className={`favorite-toggle ${isFavorite ? "active" : ""}`} onClick={toggleFavorite}>
            {isFavorite ? "❤️" : "🤍"}
        </button>
    );
};

export default FavoriteToggle;