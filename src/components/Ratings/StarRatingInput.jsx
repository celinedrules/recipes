// src/components/Ratings/StarRatingInput.jsx
import { FaStar, FaRegStar } from "react-icons/fa";

const StarRatingInput = ({ value = 0, onChange, disabled = false, size = 24 }) => {
    const handleClick = (index) => {
        if (!disabled && onChange) {
            onChange(index + 1);
        }
    };

    return (
        <div style={{ color: "gold", display: "inline-flex" }}>
            {[...Array(5)].map((_, i) => (
                <span
                    key={i}
                    onClick={() => handleClick(i)}
                    style={{
                        cursor: disabled ? "default" : "pointer",
                        opacity: disabled ? 0.6 : 1,
                        fontSize: size
                    }}
                >
                    {i < value ? <FaStar /> : <FaRegStar />}
                </span>
            ))}
        </div>
    );
};

export default StarRatingInput;