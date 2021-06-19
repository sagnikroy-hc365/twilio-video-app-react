import React, { ChangeEvent, FormEvent, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, makeStyles, TextField, Grid, Button, InputLabel, Theme } from '@material-ui/core';
import { useAppState } from '../../../state';

const useStyles = makeStyles((theme: Theme) => ({
  gutterBottom: {
    marginBottom: '1em',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '1.5em 0 3.5em',
    '& div:not(:last-child)': {
      marginRight: '1em',
    },
    [theme.breakpoints.down('sm')]: {
      margin: '1.5em 0 2em',
    },
  },
  textFieldContainer: {
    width: '100%',
  },
  continueButton: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

interface RoomNameScreenProps {
  name: string;
  roomName: string;
  setName: (name: string) => void;
  setRoomName: (roomName: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function RoomNameScreen({ name, roomName, setName, setRoomName, handleSubmit }: RoomNameScreenProps) {
  const classes = useStyles();
  const { user } = useAppState();

  /*
    These 'handle<variable>Change functions, were used when the user could manually add
    their name and the room then wanted to join (name and roomName respectively).
  */
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleRoomNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  let query = useQuery();

  // same as ngOnInit
  useEffect(() => {
    // get the roomName from the queryParams
    if (!roomName) {
      let room = query.get('roomName');
      if (room) setRoomName(room);
    }

    // get the userName from the queryParams
    if (!name) {
      let userName = query.get('userName') || query.get('user');
      if (userName) setName(userName);
    }
  }, [query]);

  // const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;
  const hasUsername = window.location.search.includes('user=') || user;
  const hasRoomName = window.location.search.includes('roomName=') || roomName;

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <>
      <Typography variant="h5" className={classes.gutterBottom}>
        Join a Room
      </Typography>
      {/* <Typography variant="body1">
        {hasUsername && hasRoomName
          ? "Hello " + capitalize(name) + "! Whenever you're ready, hit Continue to go straight into the waiting room."
          : hasUsername && !hasRoomName
          ? "Hello " + capitalize(name) + "! Please enter the name of a room you'd like to join."
          : "Enter your name and the name of a room you'd like to join"}
      </Typography> */}
      <Typography variant="body1">
        {hasUsername && hasRoomName
          ? 'Hello ' + capitalize(name) + "! Whenever you're ready, hit Continue to go straight into the waiting room."
          : 'There was an issue getting either your Name or Room. Please go back and try again.'}
      </Typography>
      {(!hasUsername || !hasRoomName) && (
        <Typography variant="body1">
          <br></br>
          If this problems persists, please contact support.
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <div className={classes.inputContainer}>
          {/* {!hasUsername && (
            <div className={classes.textFieldContainer}>
              <InputLabel shrink htmlFor="input-user-name">
                Your Name
              </InputLabel>
              <TextField
                id="input-user-name"
                variant="outlined"
                fullWidth
                size="small"
                value={name}
                onChange={handleNameChange}
              />
            </div>
          )} */}
          {/* {!hasRoomName && (
            <div className={classes.textFieldContainer}>
              <InputLabel shrink htmlFor="input-room-name">
                Room Name
              </InputLabel>
              <TextField
                autoCapitalize="false"
                id="input-room-name"
                variant="outlined"
                fullWidth
                size="small"
                value={roomName}
                onChange={handleRoomNameChange}
              />
            </div>
          )} */}
        </div>
        <Grid container justify="flex-end">
          <Button
            variant="contained"
            type="submit"
            color="primary"
            disabled={!name || !roomName}
            className={classes.continueButton}
          >
            Continue
          </Button>
        </Grid>
      </form>
    </>
  );
}
