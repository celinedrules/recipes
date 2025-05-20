import { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/**
 * Displays a star rating.
 *
 * @param {number} rating - The current rating value (e.g. 4.2).
 * @param {boolean} editable - Whether the user can interact with the stars.
 * @param {function} onRate - Callback called with a new rating when a star is clicked.
 */
const StarRatingDisplay = ({ rating = 0, editable = false, onRate = () => {} }) => {
    const [hoveredRating, setHoveredRating] = useState(null);

    // If user is hovering, use that as the visual rating
    const displayRating = hoveredRating !== null ? hoveredRating : rating;

    return (
        <div style={{ display: 'flex', gap: '4px', cursor: editable ? 'pointer' : 'default' }}>
            {[0, 1, 2, 3, 4].map((i) => {
                const full = i + 1 <= displayRating;
                const half = displayRating > i && displayRating < i + 1;

                const icon = full
                    ? <FaStar />
                    : half
                        ? <FaStarHalfAlt />
                        : <FaRegStar />;

                return (
                    <span
                        key={i}
                        style={{ color: 'gold', fontSize: 25 }}
                        onMouseEnter={() => editable && setHoveredRating(i + 1)}
                        onMouseLeave={() => editable && setHoveredRating(null)}
                        onClick={() => editable && onRate(i + 1)}
                    >
                        {icon}
                    </span>
                );
            })}
        </div>
    );
};

export default StarRatingDisplay;