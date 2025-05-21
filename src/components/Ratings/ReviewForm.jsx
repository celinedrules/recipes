// src/components/Reviews/ReviewForm.jsx
import StarRatingInput from "../Ratings/StarRatingInput";

const ReviewForm = ({
                        rating,
                        comment,
                        onRatingChange,
                        onCommentChange,
                        onSubmit,
                        isSubmitting = false
                    }) => {
    return (
        <div className="user-review" style={{ marginTop: "1rem" }}>
            <h5>Your Review</h5>
            <StarRatingInput
                value={rating}
                onChange={onRatingChange}
                disabled={isSubmitting}
            />
            <textarea
                placeholder="What did you think of this recipe? (optional)"
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                style={{ width: "100%", height: "100px", marginTop: "0.5rem" }}
            />
            <button
                onClick={() => onSubmit({ rating, comment })}
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
    );
};

export default ReviewForm;