import express from 'express';
import FirebaseAuthController from '../controllers/firebase-auth-controller.js';

const router = express.Router();

router.post('/api/register', FirebaseAuthController.registerUser);
router.post('/api/login', FirebaseAuthController.loginUser);
router.post('/api/logout', FirebaseAuthController.logoutUser);
router.post('/api/reset-password', FirebaseAuthController.resetPassword);
router.post('/api/verify-token', FirebaseAuthController.verifyToken);

router.post('/api/create-profile', FirebaseAuthController.createProfile);
router.post('/api/edit-profile', FirebaseAuthController.editProfile);

export default router;