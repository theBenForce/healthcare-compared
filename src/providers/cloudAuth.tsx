/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CredentialResponse, TokenResponse, googleLogout, useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import React, { PropsWithChildren } from 'react';
import Axios from 'axios';


export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

type PersistedToken = TokenResponse & { expires_at: number };

interface CloudAuthContextInterface {
  authToken: PersistedToken | null;
  profile: UserProfile | null;
  drive: typeof gapi.client.drive | null;
  signOut: () => void;
  signIn: () => void;
}

const cloudAuthContext = React.createContext<CloudAuthContextInterface>({
  authToken: null,
  profile: null,
  drive: null,
  signOut: () => { },
  signIn: () => { },
});

export const useCloudAuth = () => React.useContext(cloudAuthContext);

const SCOPE = [
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.appfolder'
];

export const WithCloudAuth: React.FC<PropsWithChildren> = ({ children }) => {
  const [credential, setCredential] = React.useState<CredentialResponse | null>(null);
  const [authToken, setAuthToken] = React.useState<PersistedToken | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [drive, setDrive] = React.useState<typeof gapi.client.drive | null>(null);

  React.useEffect(() => {
    if (!authToken?.access_token || profile) return;

    Axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
        headers: {
          Authorization: `Bearer ${authToken.access_token}`,
          Accept: 'application/json'
        }
      })
      .then((res) => {
        console.dir(res.data);
        setProfile(res.data);
        localStorage.setItem('profile', JSON.stringify(res.data));
      })
      .catch((err) => console.log(err));

  }, [authToken, profile]);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (response: Omit<TokenResponse, 'error' | 'error_description' | 'error_uri'>) => {
      console.info(`Logged in with Google`);
      const persistedToken = { ...response, expires_at: Date.now() + response.expires_in * 1000 };
      setAuthToken(persistedToken);

      localStorage.setItem('authToken', JSON.stringify(persistedToken));
    },
    scope: SCOPE.join(' '),
    prompt: 'none'
  });

  React.useEffect(() => {
    if (!credential || !loginWithGoogle || !credential) return;
    const expiresAt = authToken?.expires_at ?? 0;
    if (expiresAt > Date.now()) return;

    console.info(`Refreshing auth token...`);

    loginWithGoogle({
      prompt: 'none',
      hint: credential.credential,
    });
  }, [authToken?.expires_at, credential, loginWithGoogle]);

  React.useEffect(() => {
    if (!credential?.credential || authToken) return;

    loginWithGoogle({
      hint: credential.credential,
    })
  }, [authToken, credential?.credential, loginWithGoogle]);

  useGoogleOneTapLogin({
    disabled: authToken !== null,
    onSuccess(response) {
      if (response.credential) {
        localStorage.setItem('googleCredential', JSON.stringify(response));
      }

      setCredential(response ?? null);
    }
  })

  React.useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('authToken') ?? 'null');
    const profile = JSON.parse(localStorage.getItem('profile') ?? 'null');
    const googleCredential = JSON.parse(localStorage.getItem('googleCredential') ?? 'null');
    if (profile) {
      console.info(`Setting profile from local storage: ${profile.name}`);
      setProfile(profile);
    }

    if (auth?.access_token) {
      console.info(`Setting auth token from local storage`);
      setAuthToken(auth);
    }

    if (googleCredential) {
      console.info(`Setting credential from local storage`);
      setCredential(googleCredential);
    }

    // Initializes the client with the API key and the Translate API.
    // @ts-ignore
    gapi.client.init({
      'apiKey': import.meta.env.VITE_GOOGLE_API_KEY,
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(function () {
      console.info(`Drive API Loaded!`)
      setDrive(gapi.client.drive);
    });
  }, []);

  const signIn = () => {
    loginWithGoogle();
  };

  const signOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('profile');
    googleLogout();

    setProfile(null);
    setAuthToken(null);
  };

  return <cloudAuthContext.Provider value={{ authToken, signOut, signIn, profile, drive }} children={children} />;
}