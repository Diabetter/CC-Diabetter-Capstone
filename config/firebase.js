import { Firestore } from '@google-cloud/firestore';
import { initializeApp } from 'firebase/app';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider } from 'firebase/auth';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);

const serviceAccount = {
  "type": process.env.GCP_TYPE,
  "project_id": process.env.GCP_PROJECT_ID,
  "private_key_id": process.env.GCP_PRIVATE_KEY_ID,
  "private_key": process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.GCP_CLIENT_EMAIL,
  "client_id": process.env.GCP_CLIENT_ID,
  "auth_uri": process.env.GCP_AUTH_URI,
  "token_uri": process.env.GCP_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.GCP_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.GCP_CLIENT_X509_CERT_URL,
  "universe_domain": process.env.GCP_UNIVERSE_DOMAIN
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const provider = new GoogleAuthProvider();
const auth = getAuth();

const db = new Firestore({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'diabeter-425219',
  databaseId: 'makanan'
});

export { db, auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
    admin };