import { Router } from 'express';

import { authenticateToken, getUserData, logout } from '../middleware/verifyToken';

import verifyResetPassword from '../middleware/verifyResetPassword';
import resetPassword from '../actions/authActions/resetPassword';
import { forgotPassword } from '../actions/authActions/forgotPassword';
import { updateProfile } from '../actions/userManagementActions/updateProfile';
import { googleAuth, googleCallback } from '../actions/authActions/google';
import registerUser from '../actions/authActions/registerUser';
import { loginUser } from '../actions/authActions/loginUser';
import updateUserPrivacy from '../actions/userManagementActions/updateUserPrivacy';
import clearAllChats from '../actions/userManagementActions/clearAllChat';
import { getAndFilterChats } from '../actions/userManagementActions/getAndFilterChats';
import sendMessage from '../actions/messageActions/sendMessage';
import deleteMessage from '../actions/messageActions/deleteMessage';
import getConversationWithrecepientId from '../actions/messageActions/getConversationWithrecepientId';
import getSearchUsers from '../actions/userManagementActions/getSearchUsers';
import starMessage from '../actions/messageActions/starMessage';
import unStarMessage from '../actions/messageActions/unStarMessage';
import deleteMessages from '../actions/messageActions/deleteMessages';
import getRecepientProfile from '../actions/chatActions/getRecepientProfile';
import addFriend from '../actions/interAction/addFriend';
import unFriend from '../actions/interAction/unFriend';
import singleFileUpload from '../actions/fileUploadActions/fileUpload';
import { upload } from '../middleware/multer';
import createGroup from '../actions/groupActions/createGroup';
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



// user management routes
router.patch('/update-profile', authenticateToken, updateProfile)
router.patch("/update-user-privacy:currentProfileId", authenticateToken, updateUserPrivacy)
router.get('/clear-all-message/:userId', authenticateToken, clearAllChats);
router.get('/search', authenticateToken, getAndFilterChats)
router.get('/searchUsers', authenticateToken, getSearchUsers)



//message & conversation routes   
router.post('/send-message:conversationId', authenticateToken, sendMessage)
router.delete('/delete-message/:messageId', authenticateToken, deleteMessage)
router.patch('/update-message/:messageId', authenticateToken)
router.get( `/conversation-recepientId`,authenticateToken, getConversationWithrecepientId)
router.post(`/star-message`,authenticateToken, starMessage)
router.post(`/unStar-message`, authenticateToken, unStarMessage )
router.post(`/delete-messages`, authenticateToken, deleteMessages)


//chat routes
router.get('/get-recepient-profile/:recepientId', authenticateToken, getRecepientProfile)


// user interActions
router.post('/add-friend', authenticateToken, addFriend)
router.post(`/un-friend`, authenticateToken, unFriend)
router.post('/singleFileUpload', upload.single("singleFile"), singleFileUpload)

// Group routes
router.post("/createGroup",authenticateToken, createGroup)

export default router;
