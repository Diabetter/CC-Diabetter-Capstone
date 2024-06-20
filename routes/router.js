import express from "express";
import FirebaseAuthController from "../controllers/firebase-auth-controller.js";
import getDataMakanan from "../helper/getData.js";
import predictController from "../helper/predictHandler.js";
import searchFeature from "../helper/search.js";
import historyFeature from "../helper/history.js";
import { Firestore } from "@google-cloud/firestore";

const router = express.Router();

router.post("/api/register", FirebaseAuthController.registerUser);
router.post("/api/login", FirebaseAuthController.loginUser);
router.post("/api/logout", FirebaseAuthController.logoutUser);
router.post("/api/reset-password", FirebaseAuthController.resetPassword);
router.post("/api/verify-token", FirebaseAuthController.verifyToken);

router.post("/api/create-profile", FirebaseAuthController.createProfile);
router.post("/api/edit-profile", FirebaseAuthController.editProfile);
router.post("/api/get-profile", FirebaseAuthController.getProfile);

router.post("/api/predict", async (req, res) => {
  try {
    // Validation of required parameters
    if (!req.body.uid) {
      return res
        .status(400)
        .send('Missing required field "uid" in request body.');
    }
    if (!req.body.rating || req.body.rating < 1 || req.body.rating >= 4) {
      req.body.rating = 1;
    }
    const profile = await FirebaseAuthController.getlocalProfile(req.body.uid);
    if (profile.message && profile.message === "Profile not found") {
      // If the profile is not found, send a 404 response with an error message
      return res.status(404).send({ error: "Profile not found" });
    } else if (profile.height) {
      await predictController.predictHandler(
        req.body.uid,
        profile,
        req.body.rating,
        res
      );
    }
  } catch (error) {
    console.error("Prediction error:", error);
    return res.status(500).send("Prediction failed");
  }
});

router.post("/api/get-makanan", async (req, res) => {
  try {
    // Validate request body

    if (!req.body || !req.body.namaMakanan) {
      return res
        .status(400)
        .send('Missing required field "namaMakanan" in request body.');
    }

    const makananName = req.body.namaMakanan;

    // Call getMakananByName function with validated data
    await getDataMakanan.getMakananByName(makananName, res);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error.");
  }
});

router.post("/api/search", async (req, res) => {
  if (!req.body || !req.body.search) {
    return res
      .status(400)
      .send('Missing required field "search" in request body.');
  }
  const searchparam = req.body.search;

  // Call getMakananByName function with validated data
  await searchFeature.search(searchparam, res);
});

router.post("/api/history", async (req, res) => {
  if (!req.body || !req.body.uid) {
    return res
      .status(400)
      .send('Missing required field "uid" in request body.');
  }
  const historyparam = req.body.uid;

  // Call getMakananByName function with validated data
  await historyFeature.getHistory(historyparam, res);
});

router.post("/api/all-history", async (req, res) => {
  try {
    const historyData = await historyFeature.getAllHistory();
    res.status(200).json(historyData); // Send the returned data from getAllHistory
  } catch (error) {
    console.error("Error in getAllHistory:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" }); // Handle any errors from getAllHistory with appropriate status code
  }
});

router.delete("/api/delete-history", async (req, res) => {
  if (!req.body || !req.body.id) {
    return res.status(400).send('Missing required field "id" in request body.');
  }
  const deletehistoryparam = req.body.id;

  // Call getMakananByName function with validated data
  await historyFeature.deleteHistory(deletehistoryparam, res);
});

router.post("/api/store-predict", async (req, res) => {
  if (!req.body || !req.body.data) {
    return res.status(400).send("Missing required data in request body.");
  }
  // await FirebaseAuthController.editProfile(req.body);
  const firestore = new Firestore({
    keyFilename: process.env.KEY_FILE,
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseId: process.env.DATABASE_NAME,
  });

  const doc = await firestore.collection("profile").doc(req.body.uid).get();
  let data = {};

  if (doc.exists) {
    data = doc.data();
  } else {
    return res.status(404).json({
      message: "Profile not found",
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
    food_id = req.body.data.id,
  } = req.body;

  await firestore.collection("profile").doc(req.body.uid).set({
    username,
    gender,
    age,
    weight,
    height,
    activities,
    food_id,
  });
  return await predictController.storePredict(
    req.body.data.id,
    req.body.data,
    res
  );
});

router.post("/api/get-menu", async (req, res) => {
  if (!req.body || !req.body.id) {
    return res.status(400).send('Missing required field "id" in request body.');
  }
  return await getDataMakanan.getMenu(req.body.id, res);
});

router.post("/api/temp-predict", async (req, res) => {
  if (!req.body.uid) {
    return res
      .status(400)
      .send('Missing required field "uid" in request body.');
  }
  if (!req.body.rating || req.body.rating < 1 || req.body.rating >= 4) {
    req.body.rating = 1;
  }
  const profile = await FirebaseAuthController.getlocalProfile(req.body.uid);
  console.log(profile.food_id);
  if (profile.message && profile.message === "Profile not found") {
    // If the profile is not found, send a 404 response with an error message
    return res.status(404).send({ error: "Profile not found" });
  } else if (profile.food_id) {
    return await getDataMakanan.getMenu(profile.food_id, res);
  }
});

export default router;
