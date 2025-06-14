import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Room() {
    const { roomCode } = useParams(); // Get room code from URL params
    
    const [state, setState] = useState({
        votesToSkip: 2, // Default votes to skip
        guestCanPause: true, // Default value for guest control
        isHost: false, // To determine if the user is the host
    });

    // Define function properly in functional component
    const getRoomDetails = () => {
        fetch("/api/get-room" + "?code=" + roomCode)
            .then((response) => response.json())
            .then((data) => {
                setState({
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host,
                });
            })
            .catch((error) => {
                console.error("Error fetching room details:", error);
            });
    };

    // Use useEffect to call getRoomDetails when component mounts
    useEffect(() => {
        getRoomDetails();
    }, [roomCode]); // Re-run when roomCode changes

    return (
        <div>
            <h1>Room Code: {roomCode}</h1>
            <p>Votes: {state.votesToSkip}</p>
            <p>Guest Can Pause: {state.guestCanPause.toString()}</p>
            <p>Host: {state.isHost.toString()}</p>
        </div>
    );
}

export default Room;