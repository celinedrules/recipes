// src/components/Reviews/ReviewSection.jsx
import {useEffect, useState} from "react";
import {supabase} from "../../lib/supabase.js";
import { toast } from 'react-toastify';
import {FaRegStar, FaStar} from "react-icons/fa";

const ReviewSection = ({recipeId, sessionUser}) => {
    const [userReview, setUserReview] = useState({rating: null, comment: ""});
    const [commentInput, setCommentInput] = useState("");
    const [allReviews, setAllReviews] = useState([]);
    const [ratingSummary, setRatingSummary] = useState(null);
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
        }, { onConflict: ['recipe_id', 'user_id'] });

        const { data: summary } = await supabase
            .from("recipe_review_summary")
            .select("average_rating, rating_count")
            .eq("recipe_id", recipeId)
            .single();

        setRatingSummary(summary);
        setUserReview({ rating: userReview.rating, comment: commentInput.trim() });

        toast.success("Your review has been saved!");

        setTimeout(() => setIsSubmitting(false), 3000);
    };

    const renderStars = (rating) => {
        return (
            <span style={{color: "gold", marginRight: "0.5rem"}}>
                {[...Array(5)].map((_, i) => i < rating ? <FaStar key={i}/> : <FaRegStar key={i}/>)}
            </span>
        );
    };

    const toggleExpanded = (index) => {
        setExpandedReviews(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <div className="review-section" style={{marginTop: "2rem"}}>
            <h4>Reviews</h4>

            {sessionUser ? (
                <div className="user-review" style={{marginTop: "1rem"}}>
                    <h5>Your Review</h5>
                    <div style={{color: "gold"}}>
                        {[...Array(5)].map((_, i) =>
                            <span
                                key={i}
                                onClick={() => setUserReview(prev => ({...prev, rating: i + 1}))}
                                style={{cursor: 'pointer'}}
                            >
                                {i < userReview.rating ? <FaStar/> : <FaRegStar/>}
                            </span>
                        )}
                    </div>
                    <textarea
                        placeholder="What did you think of this recipe? (optional)"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        style={{width: "100%", height: "100px", marginTop: "0.5rem"}}
                    />
                    <button
                        onClick={submitReview}
                        disabled={isSubmitting}
                        style={{
                            marginTop: "0.5rem",
                            opacity: isSubmitting ? 0.5 : 1,
                            cursor: isSubmitting ? "not-allowed" : "pointer"
                        }}
                    >
                        {isSubmitting ? "Saving..." : "Submit Review"}
                    </button>
                </div>
            ) : (
                <p style={{color: "#666", fontStyle: "italic", marginTop: "1rem"}}>
                    Log in to rate and review this recipe.
                </p>
            )}

            {allReviews
                .filter(r => r.user_id !== sessionUser?.id)
                .map((r, i) => (
                    <div key={i} className="review" style={{marginBottom: "1rem", fontSize: "1rem"}}>
                        {renderStars(r.rating)}
                        {r.comment && (
                            <span style={{color: "#666", fontStyle: "italic", fontWeight: 300, whiteSpace: "pre-wrap"}}>
        — "
                                {expandedReviews[i] || r.comment.length <= 200
                                    ? r.comment
                                    : `${r.comment.slice(0, 200)}... `}
                                {r.comment.length > 200 && (
                                    <button
                                        onClick={() => toggleExpanded(i)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#666",
                                            cursor: "pointer",
                                            padding: 0,
                                            fontSize: 14,
                                            fontStyle: "italic",
                                            fontWeight: 'bold',
                                            verticalAlign: "baseline",
                                        }}
                                    >
                                        {expandedReviews[i] ? "Show less" : "Read more"}
                                    </button>
                                )}
                                "
    </span>
                        )}
                    </div>
                ))}
        </div>
    );
};

export default ReviewSection;
