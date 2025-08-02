import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SpotifyCallback() {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
            console.error("Spotify authorization error:", error);
            navigate('/');
            return;
        }
        
        if (code) {
            // Send the code to your backend
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: code,
                }),
            };
            
            fetch("/api/spotify/callback", requestOptions)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    // Redirect back to room or another page
                    if (data.roomCode) {
                        navigate(`/room/${data.roomCode}`);
                    } else {
                        navigate('/');
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    navigate('/');
                });
        } else {
            // No code found, redirect home
            navigate('/');
        }
    }, [navigate]);
    
    return (
        <div className="center">
            <h3>Processing Spotify Authentication...</h3>
            <p>Please wait...</p>
        </div>
    );
}

export default SpotifyCallback;