import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

export function useRecipeReviews(recipeId, sessionUser) {
    const [userReview, setUserReview] = useState({ rating: null, comment: "" });
    const [commentInput, setCommentInput] = useState("");
    const [allReviews, setAllReviews] = useState([]);
    const [, setRatingSummary] = useState(null); // can remove if unused

    useEffect(() => {
        async function loadReviews() {
            if (!recipeId) return;

            const { data: summary } = await supabase
                .from("recipe_review_summary")
                .select("average_rating, rating_count")
                .eq("recipe_id", recipeId)
                .single();
            setRatingSummary(summary);

            if (sessionUser) {
                const { data: existing } = await supabase
                    .from("recipe_reviews")
                    .select("rating, comment")
                    .eq("recipe_id", recipeId)
                    .eq("user_id", sessionUser.id)
                    .single();

                if (existing) {
                    setUserReview({ rating: existing.rating, comment: existing.comment });
                    setCommentInput(existing.comment || "");
                }
            }

            const { data: all } = await supabase
                .from("recipe_reviews")
                .select("rating, comment, created_at, user_id")
                .eq("recipe_id", recipeId)
                .order("created_at", { ascending: false });

            setAllReviews(all || []);
        }

        loadReviews();
    }, [recipeId, sessionUser]);

    return {
        userReview,
        setUserReview,
        commentInput,
        setCommentInput,
        allReviews
    };
}