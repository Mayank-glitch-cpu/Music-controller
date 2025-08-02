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
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

export default class CreateRoomPage extends Component {
    static defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => {},
    };
    
    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            roomCreated: false,
            roomCode: null,
            errorMsg: "",
            successMsg: "",
        };
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
        this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this);
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
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();  // Only try to parse JSON if response is OK
            })
            .then((data) => {
                console.log("Room created successfully:", data);
                this.setState({
                    roomCreated: true,
                    roomCode: data.code,
                });
            })
            .catch((error) => {
                console.error("Error creating room:", error);
                this.setState({
                    errorMsg: "Error creating room. Please try again."
                });
            });
    }

    handleUpdateButtonPressed = () => {
        console.log("Updating room with:", this.state);
        
        const requestOptions = {
            method: "PATCH", // Use PATCH for updates
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause,
                code: this.props.roomCode,
            }),
        };
        
        fetch("/api/update-room", requestOptions)
            .then((response) => {
                if (response.ok) {
                    this.setState({
                        successMsg: "Room updated successfully!",
                    });
                    
                    // Auto-hide success message after 2 seconds then call callback with success=true
                    setTimeout(() => {
                        this.setState({ successMsg: "" });
                        this.props.updateCallback(true); // Pass true to indicate success
                    }, 1000);
                } else {
                    this.setState({
                        errorMsg: "Error updating room. Please try again."
                    });
                    // Still close the settings but indicate failure
                    setTimeout(() => {
                        this.props.updateCallback(false); // Pass false to indicate failure
                    }, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updating room:", error);
                this.setState({
                    errorMsg: "Error updating room. Please try again."
                });
                // Still close the settings but indicate failure
                setTimeout(() => {
                    this.props.updateCallback(false); // Pass false to indicate failure
                }, 3000);
            });
    }

    renderButtons() {
        if (this.props.update) {
            // Update Room Mode - Show Update and Close buttons
            return (
                <Grid container spacing={1} direction="column">
                    <Grid item xs={12} align="center">
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={this.handleUpdateButtonPressed}
                            style={{ 
                                marginTop: '16px',
                                minWidth: '150px'
                            }}
                        >
                            Update Room
                        </Button>
                    </Grid>
                    <Grid item xs={12} align="center">
                        <Button 
                            color="secondary" 
                            variant="contained" 
                            onClick={() => this.props.updateCallback(false)}
                            style={{ 
                                marginTop: '8px',
                                minWidth: '150px'
                            }}
                        >
                            Close
                        </Button>
                    </Grid>
                </Grid>
            );
        } else {
            // Create Room Mode - Show Create and Back buttons
            return (
                <Grid container spacing={1} direction="column">
                    <Grid item xs={12} align="center">
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
                    <Grid item xs={12} align="center">
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

    render() {
        const title = this.props.update ? "Update Room" : "Create a Room";
        
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
                    minHeight: this.props.update ? 'auto' : '100vh',
                    padding: '20px'
                }}
            >
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        {title}
                    </Typography>
                </Grid>
                
                {/* Success and Error Messages */}
                <Grid item xs={12} align="center">
                    <Collapse in={this.state.successMsg !== "" || this.state.errorMsg !== ""}>
                        {this.state.successMsg !== "" ? (
                            <Alert 
                                severity="success"
                                onClose={() => this.setState({ successMsg: "" })}
                            >
                                {this.state.successMsg}
                            </Alert>
                        ) : (
                            this.state.errorMsg !== "" && (
                                <Alert 
                                    severity="error"
                                    onClose={() => this.setState({ errorMsg: "" })}
                                >
                                    {this.state.errorMsg}
                                </Alert>
                            )
                        )}
                    </Collapse>
                </Grid>

                <Grid item xs={12} align="center">
                    <FormControl component="fieldset">
                        <FormHelperText style={{ textAlign: 'center', marginBottom: '8px' }}>
                            Guest Control of Playback State
                        </FormHelperText>
                        <RadioGroup
                            row
                            defaultValue={this.props.guestCanPause.toString()}
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

                <Grid item xs={12} align="center">
                    <FormControl>
                        <TextField
                            required={true}
                            type="number"
                            onChange={this.handleVotesChange}
                            defaultValue={this.state.votesToSkip}
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

                {/* Render appropriate buttons based on mode */}
                {this.renderButtons()}
            </Grid>
        );
    }
}