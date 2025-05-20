import { Router } from 'express';

import { authenticateToken, getUserData, logout } from '../middleware/verifyToken';

import verifyResetPassword from '../middleware/verifyResetPassword';
import resetPassword from '../actions/authActions/resetPassword';
import { forgotPassword } from '../actions/authActions/forgotPassword';
import { googleAuth, googleCallback } from '../actions/authActions/google';
import registerUser from '../actions/authActions/registerUser';
import { loginUser } from '../actions/authActions/loginUser';
import { upload } from '../middleware/multer';
import singleFileUpload from '../actions/fileUploader/fileUpload';
import update_profile from '../actions/userActions/updateProfile';
import updatePrivacy from '../actions/userActions/updatePrivacy';
import getConversations from '../actions/conversationActions/getConversations';
import getUser from '../actions/userActions/getUser';
import getUsers from '../actions/usersActions/getUsers';
import getFriendsRequest from '../actions/friendActions/getFriendRequests';
import acceptFriendRequest from "../actions/friendActions/acceptFriendRequest"
import getMyFriends from '../actions/friendActions/getMyFriends';
import getConvoDetails from '../actions/chatActions/getConvoDetails';
import getMessages from '../actions/chatActions/getMessages';
import sendMessage from '../actions/messagesAction/sendMessage';
// You can use the `--esModuleInterop` compiler option in your `tsconfig.json` file to avoid the need for explicit file extensions.
const router = Router();


//Auth routes
router.get('/auth/google', googleAuth);
router.get('/auth/callback/google', googleCallback);
router.get('/user', authenticateToken, getUserData);
router.post('/register', registerUser);
router.post('/login', loginUser)
router.get('/logout', logout)
router.post('/password-reset', forgotPassword)
router.get("/verifying-reset-password", verifyResetPassword)
router.post('/reset-password', resetPassword)


//file upload 
router.post('/singleFileUpload', upload.single("singleFile"), singleFileUpload)

// user management
router.patch('/update-profile', authenticateToken, update_profile)
router.patch("/update-privacy", authenticateToken, updatePrivacy)

//users
router.get('/users', authenticateToken, getUsers)
router.get('/my-friends', authenticateToken, getMyFriends)

// friend request
router.get('/friend-requests', authenticateToken,  getFriendsRequest)
router.post("/confirmFriendRequest", authenticateToken, acceptFriendRequest)

//conversations
router.get('/conversations', authenticateToken, getConversations)
router.get('/convo-details/:conversationId', authenticateToken, getConvoDetails)
router.get('/messages/:conversationId', authenticateToken, getMessages)



export default router;