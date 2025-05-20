// src/components/Reviews/ReviewSection.jsx
import {useEffect, useState} from "react";
import {supabase} from "../../lib/supabase.js";
import StarRatingDisplay from "../Ratings/StarRatingDisplay.jsx";

const ReviewSection = ({recipeId, sessionUser}) => {
    const [userReview, setUserReview] = useState({rating: null, comment: ""});
    const [commentInput, setCommentInput] = useState("");
    const [allReviews, setAllReviews] = useState([]);
    const [ratingSummary, setRatingSummary] = useState(null);

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
        if (!userReview.rating) return;

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
    };

    return (
        <div className="review-section" style={{marginTop: "2rem"}}>
            <h4>Reviews</h4>

            {ratingSummary && (
                <>
                    <StarRatingDisplay rating={parseFloat(ratingSummary.average_rating || 0)}/>
                    <p style={{color: "#777", fontSize: "0.9rem"}}>
                        {ratingSummary.rating_count > 0
                            ? `Based on ${ratingSummary.rating_count} ${ratingSummary.rating_count === 1 ? 'rating' : 'ratings'}`
                            : 'No ratings yet'}
                    </p>
                </>
            )}

            {sessionUser ? (
                <div className="user-review" style={{marginTop: "1rem"}}>
                    <h5>Your Review</h5>
                    <StarRatingDisplay
                        rating={userReview.rating || 0}
                        editable={true}
                        onRate={(r) => setUserReview(prev => ({...prev, rating: r}))}
                    />
                    <textarea
                        placeholder="What did you think of this recipe? (optional)"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        style={{width: "100%", height: "100px", marginTop: "0.5rem"}}
                    />
                    <button onClick={submitReview} style={{marginTop: "0.5rem"}}>Submit Review</button>
                </div>
            ) : (
                <p style={{color: "#666", fontStyle: "italic", marginTop: "1rem"}}>
                    Log in to rate and review this recipe.
                </p>
            )}

            {allReviews
                .filter(r => r.user_id !== sessionUser?.id)  // 👈 Exclude your own
                .map((r, i) => (
                    <div key={i} className="review" style={{marginBottom: "1rem"}}>
                        <StarRatingDisplay rating={r.rating}/>
                        {r.comment && <p style={{whiteSpace: "pre-wrap", marginTop: "0.25rem"}}>{r.comment}</p>}
                    </div>
                ))}
        </div>
    );
};

export default ReviewSection;