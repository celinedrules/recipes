import React, {use, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {supabase} from "../lib/supabase.js";
import {FaFacebookF, FaGooglePlusG, FaLinkedinIn} from 'react-icons/fa';
import "../styles/LoginPage.scss";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        const {data, error} = await supabase.auth.signInWithPassword({
            email, password
        });

        if (error) {
            setErrorMsg(error.message);
        } else {
            navigate('/');
        }
    };

    const handleSignUp = () => navigate("/signup");

    return (
        <div className="page-container">
            {/* Left: Login Panel */}
            <section className="login-panel">
                <h1>Login to Your Account</h1>
                <p className="subheader">Login using social networks</p>

                {/* Social Login Buttons */}
                <div className="social-login">
                    <button type="button" className="social-btn facebook">
                        <FaFacebookF/>
                    </button>
                    <button type="button" className="social-btn google">
                        <FaGooglePlusG/>
                    </button>
                    <button type="button" className="social-btn linkedin">
                        <FaLinkedinIn/>
                    </button>
                </div>

                <div className="divider">
                    <span>OR</span>
                </div>

                {/* Login Form */}
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
                    <div className="account">
                        <button type="submit" className="btn-login" onClick="lo">
                            Sign In
                        </button>
                    </div>
                </form>
            </section>

            {/* Right: Signup Panel */}
            <section className="signup-panel">
                <h2>New Here?</h2>
                <p>Sign up and discover a great amount of new opportunities!</p>
                <div className="account">
                    <button type="button" className="btn-login" onClick={handleSignUp}>
                        Sign Up
                    </button>
                </div>
            </section>
        </div>
    );
};

export default LoginPage;