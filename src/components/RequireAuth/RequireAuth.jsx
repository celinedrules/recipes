// RequireAuth.jsx
import React, {useEffect, useState} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {supabase} from '../../lib/supabase';

export default function RequireAuth({children}) {
    const [session, setSession] = useState(undefined);  // undefined = loading
    const location = useLocation();

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);      // sets to object or null
        });

        const {data: listener} = supabase.auth.onAuthStateChange(
            (_e, session) => setSession(session)
        );
        return () => listener.subscription.unsubscribe();
    }, []);

    // still checking? show nothing (or a spinner)
    if (session === undefined) return null;

    // not logged in? bounce to login
    if (!session) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    // otherwise show the protected page
    return children;
}
