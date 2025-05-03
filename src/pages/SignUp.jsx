import {FaFacebookF, FaGooglePlusG, FaLinkedinIn} from "react-icons/fa";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {supabase} from "../lib/supabase.js";
import "../styles/LoginPage.scss";

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [errorMsg, setErrorMsg] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setErrorMsg(null);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: displayName }
            }
        });

        if (error) {
            // This will catch "duplicate email" among other errors
            setErrorMsg(error.message);
        } else {
            // Optionally you could show a "confirm your email" notice here
            navigate("/login");
        }
    };

    const handleSignIn = () => navigate("/login");

    return (
        <div className="page-container">
            <section className="login-panel">
                <h1>Create a new Account</h1>

                <form className="login-form" onSubmit={handleSubmit}>
                    {errorMsg && <div className="error">{errorMsg}</div>}
                    <div className="form-group">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            placeholder="Enter your password"
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            id="displayName"
                            name="displayName"
                            type="text"
                            value={displayName}
                            placeholder="Enter your display name"
                            onChange={e => setDisplayName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="account">
                        <button type="submit" className="btn-login">
                            Sign Up
                        </button>
                    </div>
                </form>
            </section>

            {/* Right: Signup Panel */}
            <section className="signup-panel">
                <h2>Existing User?</h2>
                <p>Sign in and discover a great amount of new opportunities!</p>
                <div className="account">
                    <button type="button" className="btn-login" onClick={handleSignIn}>
                        Sign In
                    </button>
                </div>
            </section>
        </div>
    );
};

export default SignUp;