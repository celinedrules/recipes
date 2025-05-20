import {useState} from "react";

const StarRating = () => {
    const [rating, setRating] = useState(0)
    return (
        <div>
            {[1, 2, 3, 4, 5].map((star) => {
                return (
                    <span
                        className='start'
                        style={{
                            cursor: 'pointer',
                            color: rating >= star ? 'gold' : 'gray',
                            fontSize: `35px`,
                        }}
                        onClick={() => {
                            setRating(star)
                        }}
                    >
            {' '}
                        ★{' '}
          </span>
                )
            })}
        </div>
    );
};

export default StarRating;