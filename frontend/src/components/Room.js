import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Button, Typography } from '@mui/material';
import CreateRoomPage from './CreateRoomPage';

function Room(props) {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    
    const [state, setState] = useState({
        votesToSkip: 2,
        guestCanPause: true,
        isHost: false,
        showSettings: false,
        spotifyAuthenticated: false,
    });

    // This prevents the infinite loop by tracking auth in localStorage
    useEffect(() => {
        // Check if we're returning from Spotify auth
        const url = window.location.href;
        if (url.includes('room/') && localStorage.getItem('spotify_auth_attempted') === roomCode) {
            console.log('Returning from Spotify auth, skipping auth check');
            // Already attempted auth for this room, don't try again
            setState(prev => ({ ...prev, spotifyAuthenticated: true }));
        } else {
            // Reset for new rooms
            localStorage.removeItem('spotify_auth_attempted');
        }
    }, [roomCode]);

    // Use useCallback to prevent the function from being recreated on each render
    const getRoomDetails = useCallback(() => {
        console.log("Fetching room details for:", roomCode);
        fetch(`/api/get-room?code=${roomCode}`)
            .then((response) => {
                if (!response.ok) {
                    props.leaveRoomCallback();
                    navigate("/");
                    return null;
                }
                return response.json();
            })
            .then((data) => {
                if (!data) return;
                
                console.log("Room data received:", data);
                setState((prevState) => ({
                    ...prevState,
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host,
                }));
                
                // Only check if host and not already authenticated
                if (data.is_host && !localStorage.getItem('spotify_auth_attempted')) {
                    checkSpotifyAuth();
                }
            });
    }, [roomCode, navigate, props]);

    const checkSpotifyAuth = () => {
        fetch("/spotify/is-authenticated")
            .then((response) => response.json())
            .then((data) => {
                setState(prevState => ({
                    ...prevState,
                    spotifyAuthenticated: data.status
                }));
                
                // Only authenticate if not already authenticated
                if (!data.status) {
                    authenticateWithSpotify();
                }
            });
    };
    
    const authenticateWithSpotify = () => {
        // Mark that we've attempted auth for this room
        localStorage.setItem('spotify_auth_attempted', roomCode);
        
        fetch(`/spotify/get-auth-url?room_code=${roomCode}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.url) {
                    window.location.href = data.url;
                }
            });
    };

    // This effect runs once when the component mounts and whenever roomCode changes
    useEffect(() => {
        getRoomDetails();
    }, [getRoomDetails]);

    const leaveButtonPressed = () => { 
        fetch("/api/leave-room", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response) => {
            if (response.ok) {
                window.location.href = "/"; // Redirect to home page
            } else {
                console.error("Failed to leave room");
            }
        })
        .catch((error) => {
            console.error("Error leaving room:", error);
        });
    };

    const updateShowSettings = (value) => {
        setState((prevState) => ({
            ...prevState,        // Keep existing state
            showSettings: value, // Update only showSettings
        }));
    };

    // New callback function for room updates
    const roomUpdateCallback = (success) => {
        if (success) {
            // Refresh room details if update was successful
            getRoomDetails();
        }
        // Close the settings view
        updateShowSettings(false);
    };

    // function to render the settings button
    const renderSettings = () => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage
                        update={true}
                        votesToSkip={state.votesToSkip}
                        guestCanPause={state.guestCanPause}
                        roomCode={roomCode}
                        updateCallback={roomUpdateCallback} // Pass the new callback
                    />
                </Grid>
            </Grid>
        );
    }

    // render the settings only to the host
    const renderSettingsButton = () => {
        if (!state.isHost) {
            return null; // If not host, do not render the button
        }
        return (
            <Grid item xs={12} align="center">
                {state.isHost ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => updateShowSettings(true)}
                    >
                        Settings
                    </Button>
                ) : null}
            </Grid>
        );
    }

    // if show settings is true, render the settings
    if (state.showSettings) {
        return renderSettings();
    }

    // else render the room details
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Code: {roomCode}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Votes: {state.votesToSkip}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Guest Can Pause: {state.guestCanPause.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h6">
            Host: {state.isHost.toString()}
          </Typography>
        </Grid>
        {renderSettingsButton()}
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={leaveButtonPressed}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
}

export default Room;