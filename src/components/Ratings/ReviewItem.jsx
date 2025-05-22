// src/components/Reviews/ReviewItem.jsx
import { FaStar, FaRegStar } from "react-icons/fa";
import { useState } from "react";

const ReviewItem = ({ rating, comment, index }) => {
    const [expanded, setExpanded] = useState(false);
    const safeComment = comment || "";

    const toggleExpanded = () => setExpanded((prev) => !prev);

    const renderStars = (rating) => (
        <span style={{ color: "gold", marginRight: "0.5rem" }}>
            {[...Array(5)].map((_, i) => (i < rating ? <FaStar key={i} /> : <FaRegStar key={i} />))}
        </span>
    );

    const isLong = safeComment.length > 200;
    const displayComment = expanded || !isLong ? safeComment : safeComment.slice(0, 200) + "... ";

    return (
        <div className="review" style={{ marginBottom: "1rem", fontSize: "1rem" }}>
            {renderStars(rating)}
            {safeComment && (
                <span
                    style={{
                        color: "#666",
                        fontStyle: "italic",
                        fontWeight: 300,
                        whiteSpace: "pre-wrap"
                    }}
                >
                    — "{displayComment}"
                    {isLong && (
                        <button
                            onClick={toggleExpanded}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#666",
                                cursor: "pointer",
                                padding: 0,
                                fontSize: 14,
                                fontStyle: "italic",
                                fontWeight: "bold",
                                verticalAlign: "baseline"
                            }}
                        >
                            {expanded ? "Show less" : "Read more"}
                        </button>
                    )}
                    "
                </span>
            )}
        </div>
    );
};

export default ReviewItem;