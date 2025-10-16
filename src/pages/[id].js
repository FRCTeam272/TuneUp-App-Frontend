import React, { useEffect } from 'react';
import { navigate } from 'gatsby';

const NumericRedirectPage = ({ params }) => {
    const { id } = params;

    useEffect(() => {
        // Check if the id is a number
        if (id && /^\d+$/.test(id)) {
            // Redirect to team page
            navigate(`/team/${id}`, { replace: true });
        } else {
            // If not a number, redirect to scoreboard page
            navigate('/scoreboard', { replace: true });
        }
    }, [id]);

    // Return a loading state while redirecting
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '18px'
        }}>
            Redirecting...
        </div>
    );
};

export default NumericRedirectPage;