import React, { Component } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { Link, Navigate } from 'react-router-dom';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

export default class CreateRoomPage extends Component {
    defaultVotes = 2;
    
    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: true,
            votesToSkip: this.defaultVotes,
            roomCreated: false,
            roomCode: null,
        };
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
        this.handleVotesChange = this.handleVotesChange.bind(this);
    }

    handleGuestCanPauseChange = (event) => {
        this.setState({
            guestCanPause: event.target.value === 'true' ? true : false,
        });
    };

    handleVotesChange = (event) => {
        this.setState({
            votesToSkip: parseInt(event.target.value),
        });
    };

    handleRoomButtonPressed = () => {
        console.log("Creating room with:", this.state);
        
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause,
            }),
        };
        
        fetch("/api/create-room", requestOptions)
            .then((response) => response.json())
            .then((data) => {
                console.log("Room created successfully:", data);
                this.setState({
                    roomCreated: true,
                    roomCode: data.code,
                });
            })
            .catch((error) => {
                console.error("Error creating room:", error);
            });
    }

    render() {
        // Handle navigation after room creation
        if (this.state.roomCreated) {
            return <Navigate to={`/room/${this.state.roomCode}`} replace />;
        }

        return (
            <Grid 
                container 
                justifyContent="center" 
                alignItems="center"
                direction="column"
                spacing={3}
                style={{ 
                    minHeight: '100vh',
                    padding: '20px'
                }}
            >
                <Grid>
                    <Typography component="h4" variant="h4" align="center">
                        Create A Room
                    </Typography>
                </Grid>

                <Grid>
                    <FormControl component="fieldset">
                        <FormHelperText style={{ textAlign: 'center', marginBottom: '8px' }}>
                            Guest Control of Playback State
                        </FormHelperText>
                        <RadioGroup
                            row
                            defaultValue="true"
                            onChange={this.handleGuestCanPauseChange}
                            style={{ justifyContent: 'center' }}
                        >
                            <FormControlLabel
                                value="true"
                                control={<Radio color="primary" />}
                                label="Play/Pause"
                                labelPlacement="bottom"
                            />
                            <FormControlLabel
                                value="false"
                                control={<Radio color="secondary" />}
                                label="No Control"
                                labelPlacement="bottom"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>

                <Grid>
                    <FormControl>
                        <TextField
                            required={true}
                            type="number"
                            onChange={this.handleVotesChange}
                            defaultValue={this.defaultVotes}
                            inputProps={{
                                min: 2,
                                style: { textAlign: "center" },
                            }}
                            style={{ width: '200px' }}
                        />
                        <FormHelperText style={{ textAlign: 'center', marginTop: '8px' }}>
                            Votes Required To Skip Song
                        </FormHelperText>
                    </FormControl>
                </Grid>

                <Grid>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={this.handleRoomButtonPressed}
                        style={{ 
                            marginTop: '16px',
                            minWidth: '150px'
                        }}
                    >
                        Create A Room
                    </Button>
                </Grid>

                <Grid>
                    <Button 
                        color="secondary" 
                        variant="contained" 
                        to="/" 
                        component={Link}
                        style={{ 
                            marginTop: '8px',
                            minWidth: '150px'
                        }}
                    >
                        Back
                    </Button>
                </Grid>
            </Grid>
        );
    }
}