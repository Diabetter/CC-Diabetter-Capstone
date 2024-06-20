import express from "express";
import FirebaseAuthController from "../controllers/firebase-auth-controller.js";
import getDataMakanan from "../helper/getData.js";
import predictController from "../helper/predictHandler.js";
import searchFeature from "../helper/search.js";
import historyFeature from "../helper/history.js";

const router = express.Router();

router.post("/api/register", FirebaseAuthController.registerUser);
router.post("/api/login", FirebaseAuthController.loginUser);
router.post("/api/logout", FirebaseAuthController.logoutUser);
router.post("/api/reset-password", FirebaseAuthController.resetPassword);
router.post("/api/verify-token", FirebaseAuthController.verifyToken);

router.post("/api/create-profile", FirebaseAuthController.createProfile);
router.post("/api/edit-profile", FirebaseAuthController.editProfile);
router.get("/api/get-profile/:userid", FirebaseAuthController.getProfile);

router.post("/api/predict", async (req, res) => {
  try {
    // Validation of required parameters
    if (!req.body.uid) {
      return res
        .status(400)
        .send('Missing required field "uid" in request body.');
    }
    if (!req.body.rating) {
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
    return res.status(400).send('Missing required field "id" in request body.');
  }
  await FirebaseAuthController.editProfile;
  return await predictController.storePredict(
    req.body.data.id,
    req.body.data,
    res
  );
});

export default router;
