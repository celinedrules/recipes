// src/components/Header/Header.jsx
import React, {useState, useEffect} from "react";
import {useNavigate, Link, NavLink} from "react-router-dom";
import {supabase} from "../../lib/supabase";     // adjust path as needed
import "./Header.scss";

const Header = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [session, setSession] = useState(null);
    const navigate = useNavigate();

    // 1) Subscribe to auth state
    useEffect(() => {
        // get initial session
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
        });

        // listen for changes
        const {data: listener} = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // optional: clear any local state, then redirect
        navigate("/");
    };

    return (
        <header className="header">
            <div className="logo">
                <Link to="/">
                    <img
                        src="/images/logo.svg"
                        alt="Cooking Blog - Made with Node.js"
                    />
                </Link>
            </div>

            <nav>
                <ul>
                    <li>
                        <NavLink to="/" end>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/about">About</NavLink>
                    </li>
                    <li>
                        <NavLink to="/submitPage">Submit</NavLink>
                    </li>
                    <li>
                        <NavLink to="/contact">Contact</NavLink>
                    </li>

                    {/* 2) Conditionally render Login vs Logout */}
                    {session ? (
                        <li>
                            <button
                                className="nav-button logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </li>
                    ) : (
                        <li>
                            <NavLink to="/login">Login</NavLink>
                        </li>
                    )}
                </ul>
            </nav>

            <div className="search">
                <form onSubmit={handleSearch} role="search">
                    <input
                        type="search"
                        name="searchTerm"
                        className="search-input"
                        placeholder="Search..."
                        aria-label="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>
        </header>
    );
};

export default Header;
