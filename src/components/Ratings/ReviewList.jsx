// src/components/Reviews/ReviewList.jsx
import ReviewItem from "./ReviewItem";

const ReviewList = ({ reviews, currentUserId }) => {
    const filteredReviews = reviews.filter((r) => r.user_id !== currentUserId);

    if (!reviews || filteredReviews.length === 0) {
        return (
            <p style={{ color: "#666", fontStyle: "italic" }}>
                No reviews yet. Be the first to leave one!
            </p>
        );
    }

    return (
        <>
            {filteredReviews.map((r, i) => (
                <ReviewItem
                    key={i}
                    rating={r.rating}
                    comment={r.comment}
                    index={i}
                />
            ))}
        </>
    );
};

export default ReviewList;