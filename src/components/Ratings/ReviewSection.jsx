import {useState} from "react";
import {supabase} from "../../lib/supabase.js";
import ReviewForm from "./ReviewForm.jsx";
import {useRecipeReviews} from "../../hooks/useRecipeReviews.js";
import {showReviewSuccess} from "../../lib/toastHelpers.jsx";
import ReviewList from "./ReviewList.jsx";

const ReviewSection = ({recipeId, sessionUser}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        userReview,
        setUserReview,
        commentInput,
        setCommentInput,
        allReviews
    } = useRecipeReviews(recipeId, sessionUser);

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

        setUserReview({rating: userReview.rating, comment: commentInput.trim()});
        showReviewSuccess();
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

            <ReviewList reviews={allReviews} currentUserId={sessionUser?.id} />

        </div>
    );
};

export default ReviewSection;
