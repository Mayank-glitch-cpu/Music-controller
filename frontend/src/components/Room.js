import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Button, Typography } from '@mui/material';
import CreateRoomPage from './CreateRoomPage';

function Room() {
    const { roomCode } = useParams(); // Get room code from URL params
    
    const [state, setState] = useState({
        votesToSkip: 2, // Default votes to skip
        guestCanPause: true, // Default value for guest control
        isHost: false, // To determine if the user is the host
        showSettings: false, // To toggle settings visibility
    }
);

    // Define function properly in functional component
    const getRoomDetails = () => {
        fetch("/api/get-room" + "?code=" + roomCode)
            .then((response) => response.json())
            .then((data) => {
                if (!data) {
                    console.error("Room not found");
                    return;
                }
                // Update state with room details
                setState((prevState) => ({
                    ...prevState,
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host,
                }));
            })
            .catch((error) => {
                console.error("Error fetching room details:", error);
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
    // Use useEffect to call getRoomDetails when component mounts
    useEffect(() => {
        getRoomDetails();
    }, [roomCode]); // Re-run when roomCode changes

    const updateShowSettings = (value) => {
    setState((prevState) => ({
        ...prevState,        // Keep existing state
        showSettings: value, // Update only showSettings
    }));
};

    // function to render the settings button
    const renderSettings = () => {
         return (
         <Grid container spacing={1}>
            <Grid item xs ={12} align="center">
                <CreateRoomPage
                    update={true}
                    votesToSkip={state.votesToSkip}
                    guestCanPause={state.guestCanPause}
                    roomCode={roomCode}
                    updateCallback={updateShowSettings}
                />
            </Grid>
            <Grid item xs={12} align="center">
                <Button
                        variant="contained"
                        color="primary"
                        onClick={() => updateShowSettings(false)}
                    >
                        Close
                    </Button>
            </Grid>
        </Grid>);
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