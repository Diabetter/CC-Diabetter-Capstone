import admin from 'firebase-admin';
import { db, auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider } from '../config/firebase.js';

class FirebaseAuthController {
    registerUser(req, res) {
        const { email, password, confirm_password } = req.body;
        if (!email || !password || !confirm_password) {
            return res.status(422).json({
                email: "Email is required",
                password: "Password is required",
                confirm_password: "Write the password again!"
            });
        }
        if (password != confirm_password) {
            return res.status(422).json({
                password: "confirm password not same!"
            })
        }
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const uid = userCredential.user.uid;
            sendEmailVerification(auth.currentUser)
            .then(() => {
                res.status(201).json({ message: "Verification email sent! User ${uid} created successfully!", uid: uid });
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ error: "Error sending email verification" });
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message || "An error occurred while registering user";
            res.status(500).json({ error: errorMessage });
        });
    }

    loginUser(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({
                email: "Email is required",
                password: "Password is required",
            });
        }
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => { 
            const user = userCredential.user;
            const uid = user.uid;
            const idToken = userCredential._tokenResponse.idToken
            if (idToken) {
                res.cookie('access_token', idToken, {
                    httpOnly: true
                });
                res.status(200).json({ message: "User logged in successfully", uid: uid, userCredential });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        })
        .catch((error) => {
            console.error(error);
            const errorCode = error.code;
            const errorMessage = error.message || "An error occurred while logging in";
            res.status(500).json({ error: errorMessage });
        });
    }

    logoutUser(req, res) {
        signOut(auth)
        .then(() => {
            res.clearCookie('access_token');
            res.status(200).json({ message: "User logged out successfully" });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        });
    }

    resetPassword(req, res){
        const { email } = req.body;
        if (!email ) {
            return res.status(422).json({
                email: "Email is required"
            });
        }
        sendPasswordResetEmail(auth, email)
        .then(() => {
            res.status(200).json({ message: "Password reset email sent successfully!" });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        });
    }

    createProfile(req, res){
        const { uid, username, gender, age, weight, height, activities } = req.body;
        if(!uid || !username || !gender || !age || !weight || !height || !activities) {
            return res.status(422).json({
                message: "all fields are required"
            });
        }
        db.collection('profile').doc(uid).set({
            username,
            gender,
            age,
            weight,
            height,
            activities
        })
        .then(() => {
            res.status(201).json({ message: "Profile created successfully" });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: "Error creating profile" });
        })
    }

    verifyToken(req, res){
        const idToken = req.headers.authorization.split(' ')[1];
        try {
            const decodedToken = auth.verifyIdToken(idToken);
            res.json({ uid: decodedToken.uid, email: decodedToken.email });
        } catch (error) {
            res.status(401).json({ message: 'Token verification failed', error: error.message });
        }
    }
}

export default new FirebaseAuthController();