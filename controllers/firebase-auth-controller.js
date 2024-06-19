import admin from "firebase-admin";
import {
  db,
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "../config/firebase.js";

class FirebaseAuthController {
  registerUser(req, res) {
    const { email, password, confirm_password } = req.body;
    if (!email || !password || !confirm_password) {
      return res.status(422).json({
        email: "Email is required",
        password: "Password is required",
        confirm_password: "Write the password again!",
      });
    }
    if (password != confirm_password) {
      return res.status(422).json({
        password: "confirm password not same!",
      });
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const uid = userCredential.user.uid;
        sendEmailVerification(auth.currentUser)
          .then(() => {
            res.status(201).json({
              message:
                "Verification email sent! User ${uid} created successfully!",
              uid: uid,
            });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error: "Error sending email verification" });
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage =
          error.message || "An error occurred while registering user";
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
        const idToken = userCredential._tokenResponse.idToken;
        if (idToken) {
          res.cookie("access_token", idToken, {
            httpOnly: true,
          });
          res.status(200).json({
            message: "User logged in successfully",
            uid: uid,
            userCredential,
          });
        } else {
          res.status(500).json({ error: "Internal Server Error" });
        }
      })
      .catch((error) => {
        console.error(error);
        const errorCode = error.code;
        const errorMessage =
          error.message || "An error occurred while logging in";
        res.status(500).json({ error: errorMessage });
      });
  }

  logoutUser(req, res) {
    signOut(auth)
      .then(() => {
        res.clearCookie("access_token");
        res.status(200).json({ message: "User logged out successfully" });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  }

  resetPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(422).json({
        email: "Email is required",
      });
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        res
          .status(200)
          .json({ message: "Password reset email sent successfully!" });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  }

  createProfile(req, res) {
    const { uid, username, gender, age, weight, height, activities } = req.body;
    if (
      !uid ||
      !username ||
      !gender ||
      !age ||
      !weight ||
      !height ||
      !activities
    ) {
      return res.status(422).json({
        message: "all fields are required",
      });
    }
    db.collection("profile")
      .doc(uid)
      .set({
        username,
        gender,
        age,
        weight,
        height,
        activities,
      })
      .then(() => {
        res.status(201).json({ message: "Profile created successfully" });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Error creating profile" });
      });
  }

  async getProfile(req, res) {
    const uid = req.params.userid;
    if (!uid) {
      return res.status(422).json({
        message: "uid is required"
      });
    }

    try {
      const collectionRef = db.collection("profile");

      // Use `doc` to reference the document based on the passed variable
      const docRef = collectionRef.doc(uid);

      // Use `get` to retrieve the document
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        return res.status(404).json({
          message: "Profile not found"
        });
      }
      const data = docSnapshot.data();
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Error retrieving profile"
      });
    }
  }

  async editProfile(req, res) {
    const { uid } = req.body;

    try {
      const doc = await db.collection("profile").doc(uid).get();
      let data = {};

      if (doc.exists) {
        data = doc.data();
      } else {
        return res.status(404).json({
          message: "Profile not found"
        });
      }

      // Update data dengan yang ada di req.body, atau gunakan yang lama jika tidak ada yang baru
      const {
        username = data.username,
        gender = data.gender,
        age = data.age,
        weight = data.weight,
        height = data.height,
        activities = data.activities,
        food_id = data.food_id,
      } = req.body;

      await db.collection("profile").doc(uid).set({
        username,
        gender,
        age,
        weight,
        height,
        activities,
        food_id,
      });

      res.status(200).json({
        message: "Profile updated successfully"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error updating profile"
      });
    }
  }

  verifyToken(req, res) {
    const idToken = req.headers.authorization.split(" ")[1];
    try {
      const decodedToken = auth.verifyIdToken(idToken);
      res.json({ uid: decodedToken.uid, email: decodedToken.email });
    } catch (error) {
      res
        .status(401)
        .json({ message: "Token verification failed", error: error.message });
    }
  }
}

export default new FirebaseAuthController();
