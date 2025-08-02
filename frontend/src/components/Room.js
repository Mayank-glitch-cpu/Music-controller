import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Button, Typography } from '@mui/material';
import CreateRoomPage from './CreateRoomPage';

function Room(props) {
    // Get roomCode from URL parameters
    const { roomCode } = useParams();
    const navigate = useNavigate();
    
    console.log("Room component loaded with code:", roomCode); // Add this debug log
    
    const [state, setState] = useState({
        votesToSkip: 2,
        guestCanPause: true,
        isHost: false,
        showSettings: false,
        spotifyAuthenticated: false,
    });

    useEffect(() => {
        // Fetch room details when component mounts or roomCode changes
        if (roomCode) {
            getRoomDetails();
        }
    }, [roomCode]);

    const getRoomDetails = () => {
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
                
                if (data.is_host) {
                    authenticateSpotify();
                }
            });
    };

    const authenticateSpotify = () => {
        console.log("Checking Spotify authentication...");
        fetch("/spotify/is-authenticated")
            .then((response) => {
                console.log("Authentication response status:", response.status);
                if (!response.ok) {
                    throw new Error(`Authentication check failed: ${response.status}`);
                }
                return response.text().then(text => {
                    try {
                        // Try to parse as JSON
                        return JSON.parse(text);
                    } catch (e) {
                        // If parsing fails, log the raw response
                        console.error("Failed to parse response as JSON:", text);
                        throw new Error("Invalid JSON response");
                    }
                });
            })
            .then((data) => {
                console.log("Authentication status:", data);
                setState((prevState) => ({
                    ...prevState,
                    spotifyAuthenticated: data.status,
                }));
                
                if (!data.status) {
                    console.log("Not authenticated, getting auth URL with room code:", roomCode);
                    // Pass the room code as a query parameter
                    return fetch(`/spotify/get-auth-url?room_code=${roomCode}`);
                }
                return null;
            })
            .then((response) => {
                if (!response) return null;
                console.log("Auth URL response status:", response.status);
                if (!response.ok) {
                    throw new Error(`Auth URL request failed: ${response.status}`);
                }
                return response.text().then(text => {
                    try {
                        // Try to parse as JSON
                        return JSON.parse(text);
                    } catch (e) {
                        // If parsing fails, log the raw response
                        console.error("Failed to parse response as JSON:", text);
                        throw new Error("Invalid JSON response");
                    }
                });
            })
            .then((data) => {
                if (data && data.url) {
                    console.log("Redirecting to Spotify auth URL:", data.url);
                    window.location.href = data.url;
                }
            })
            .catch((error) => {
                console.error("Spotify authentication error:", error);
            });
    };
    // Define leaveButtonPressed function
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
        {state.isHost ? renderSettingsButton() : null}
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