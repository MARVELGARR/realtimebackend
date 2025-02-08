import { Router } from 'express';
import { googleAuth, googleCallback } from '../actions/google';
import { authenticateToken, getUserData } from '../middleware/verifyToken';
import registerUser from '../actions/registerUser';
import { loginUser } from '../actions/loginUser';
import verifyResetPassword from '../middleware/verifyResetPassword';
import resetPassword from '../actions/authActions/resetPassword';
import { forgotPassword } from '../actions/authActions/forgotPassword';
// You can use the `--esModuleInterop` compiler option in your `tsconfig.json` file to avoid the need for explicit file extensions.
const router = Router();

router.get('/auth/google', googleAuth);
router.get('/auth/callback/google', googleCallback);
router.get('/user', authenticateToken, getUserData);
router.post('/register', registerUser);
router.post('/login', loginUser)
router.post('/password-reset', forgotPassword)
router.post('/reset-password', verifyResetPassword, resetPassword)

export default router;
