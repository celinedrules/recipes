// src/components/Reviews/ReviewSection.jsx
import {useEffect, useState} from "react";
import {supabase} from "../../lib/supabase.js";
import {toast} from 'react-toastify';
import ReviewItem from "./ReviewItem.jsx";
import ReviewForm from "./ReviewForm.jsx";

const ReviewSection = ({recipeId, sessionUser}) => {
    const [userReview, setUserReview] = useState({rating: null, comment: ""});
    const [commentInput, setCommentInput] = useState("");
    const [allReviews, setAllReviews] = useState([]);
    const [, setRatingSummary] = useState(null);
    const [expandedReviews, setExpandedReviews] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function loadReviews() {
            if (!recipeId) return;

            const {data: summary} = await supabase
                .from("recipe_review_summary")
                .select("average_rating, rating_count")
                .eq("recipe_id", recipeId)
                .single();
            setRatingSummary(summary);

            if (sessionUser) {
                const {data: existing} = await supabase
                    .from("recipe_reviews")
                    .select("rating, comment")
                    .eq("recipe_id", recipeId)
                    .eq("user_id", sessionUser.id)
                    .single();

                if (existing) {
                    setUserReview({rating: existing.rating, comment: existing.comment});
                    setCommentInput(existing.comment || "");
                }
            }

            const {data: all} = await supabase
                .from("recipe_reviews")
                .select("rating, comment, created_at, user_id")
                .eq("recipe_id", recipeId)
                .order("created_at", {ascending: false});

            setAllReviews(all || []);
        }

        loadReviews();
    }, [recipeId, sessionUser]);

    const submitReview = async () => {
        if (!userReview.rating || isSubmitting) return;

        setIsSubmitting(true);

        await supabase.from("recipe_reviews").upsert({
            recipe_id: recipeId,
            user_id: sessionUser.id,
            rating: userReview.rating,
            comment: commentInput.trim()
        }, {onConflict: ['recipe_id', 'user_id']});

        const {data: summary} = await supabase
            .from("recipe_review_summary")
            .select("average_rating, rating_count")
            .eq("recipe_id", recipeId)
            .single();

        setRatingSummary(summary);
        setUserReview({rating: userReview.rating, comment: commentInput.trim()});

        toast.success("Your review has been saved!", {
            icon: () => (
                <img
                    src="/images/review-success.png"
                    alt="Success"
                    style={{
                        width: 28, // try 26–28
                        height: 28,
                        padding: 2, // prevents clipping inside toast
                        objectFit: "contain"
                    }}
                />
            )
        });


        setTimeout(() => setIsSubmitting(false), 3000);
    };

    return (
        <div className="review-section" style={{marginTop: "2rem"}}>
            <h4>Reviews</h4>

            {sessionUser ? (
                <ReviewForm
                    rating={userReview.rating}
                    comment={commentInput}
                    onRatingChange={(r) => setUserReview(prev => ({ ...prev, rating: r }))}
                    onCommentChange={(c) => setCommentInput(c)}
                    isSubmitting={isSubmitting}
                    onSubmit={({ rating, comment }) => submitReview(rating, comment)}
                />

            ) : (
                <p style={{color: "#666", fontStyle: "italic", marginTop: "1rem"}}>
                    Log in to rate and review this recipe.
                </p>
            )}

            {allReviews
                .filter(r => r.user_id !== sessionUser?.id)
                .map((r, i) => (
                    <ReviewItem
                        key={i}
                        rating={r.rating}
                        comment={r.comment}
                        index={i}
                    />
                ))}

        </div>
    );
};

export default ReviewSection;
