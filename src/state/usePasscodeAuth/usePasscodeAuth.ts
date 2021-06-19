import { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const endpoint = process.env.REACT_APP_TOKEN_ENDPOINT || '/token';

export function getPasscode() {
  const match = window.location.search.match(/passcode=(.*)&?/);
  const passcode = match ? match[1] : window.sessionStorage.getItem('passcode');
  return passcode;
}

export function fetchToken(
  name: string,
  room: string,
  passcode: string,
  create_room = true,
  create_conversation = process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS !== 'true'
) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      user_identity: name,
      room_name: room,
      passcode,
      create_room,
      create_conversation,
    }),
  });
}

export function verifyPasscode(passcode: string) {
  return fetchToken('temp-name', 'temp-room', passcode, false /* create_room */, false /* create_conversation */).then(
    async res => {
      const jsonResponse = await res.json();
      if (res.status === 401) {
        return { isValid: false, error: jsonResponse.error?.message };
      }

      if (res.ok && jsonResponse.token) {
        return { isValid: true };
      }
    }
  );
}

export function getErrorMessage(message: string) {
  switch (message) {
    case 'passcode incorrect':
      return 'Passcode is incorrect';
    case 'passcode expired':
      return 'Passcode has expired';
    default:
      return message;
  }
}

export default function usePasscodeAuth() {
  const history = useHistory();

  const PASSCODE_STORAGE_NAME = 'passcode';
  const DISPLAYNAME_STORAGE_NAME = 'displayName';
  const ROOMNAME_STORAGE_NAME = 'roomName';

  const [user, setUser] = useState<{ displayName: undefined; photoURL: undefined; passcode: string } | null>(null);
  const [stateRoomName, setStateRoomName] = useState<string>('');
  const [isAuthReady, setIsAuthReady] = useState(false);

  const getToken = useCallback(
    (name: string, room: string) => {
      return fetchToken(name, room, user!.passcode)
        .then(async res => {
          if (res.ok) {
            return res;
          }
          const json = await res.json();
          const errorMessage = getErrorMessage(json.error?.message || res.statusText);
          throw Error(errorMessage);
        })
        .then(res => res.json());
    },
    [user]
  );

  const updateRecordingRules = useCallback(
    async (room_sid, rules) => {
      return fetch('/recordingrules', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_sid, rules, passcode: user?.passcode }),
        method: 'POST',
      }).then(async res => {
        const jsonResponse = await res.json();

        if (!res.ok) {
          const error = new Error(jsonResponse.error?.message || 'There was an error updating recording rules');
          error.code = jsonResponse.error?.code;

          return Promise.reject(error);
        }

        return jsonResponse;
      });
    },
    [user]
  );

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  let query = useQuery();
  useEffect(() => {
    function getUserDisplayName() {
      let match = query.get('userName') || query.get('user');
      const userName = match ? match : window.sessionStorage.getItem(DISPLAYNAME_STORAGE_NAME);
      return userName;
    }
    function getRoomName(): string {
      // return query.get("roomName") || '';
      let match = query.get('roomName');
      const roomName = match ? match : window.sessionStorage.getItem(ROOMNAME_STORAGE_NAME);
      return roomName || '';
    }
    const passcode = getPasscode();
    const displayName = getUserDisplayName();
    const urlRoomName = getRoomName();

    if (passcode) {
      verifyPasscode(passcode)
        .then(verification => {
          if (verification?.isValid) {
            setUser({ displayName, passcode } as any);
            setStateRoomName(urlRoomName);
            window.sessionStorage.setItem(PASSCODE_STORAGE_NAME, passcode);
            window.sessionStorage.setItem(DISPLAYNAME_STORAGE_NAME, displayName || '');
            window.sessionStorage.setItem(ROOMNAME_STORAGE_NAME, urlRoomName);
            history.replace(window.location.pathname);
          }
        })
        .then(() => setIsAuthReady(true));
    } else {
      setIsAuthReady(true);
    }
  }, [history]);

  const signIn = useCallback((passcode: string) => {
    return verifyPasscode(passcode).then(verification => {
      if (verification?.isValid) {
        setUser({ passcode } as any);
        window.sessionStorage.setItem(PASSCODE_STORAGE_NAME, passcode);
      } else {
        throw new Error(getErrorMessage(verification?.error));
      }
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setStateRoomName('');
    window.sessionStorage.removeItem(PASSCODE_STORAGE_NAME);
    window.sessionStorage.removeItem(DISPLAYNAME_STORAGE_NAME);
    window.sessionStorage.removeItem(ROOMNAME_STORAGE_NAME);
    return Promise.resolve();
  }, []);

  return { user, stateRoomName, isAuthReady, getToken, signIn, signOut, updateRecordingRules };
}
