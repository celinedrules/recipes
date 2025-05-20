import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRatingDisplay = ({ rating }) => {
    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2, 3, 4].map((i) => {
                const full = i + 1 <= rating;
                const half = rating > i && rating < i + 1;

                if (full) {
                    return <FaStar key={i} color="gold" size={25} />;
                } else if (half) {
                    return <FaStarHalfAlt key={i} color="gold" size={25} />;
                } else {
                    return <FaRegStar key={i} color="gold" size={25} />;
                }
            })}
        </div>
    );
};

export default StarRatingDisplay;