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
import getGroupConversation from '../actions/conversationActions/getGroupConversation';
import starGroupMessage from '../actions/groupActions/starGroupMessage';
import unStarGroupMessage from '../actions/groupActions/unStarGroupMessage';
import getGroupById from '../actions/groupActions/getGroupById';
import getGroupParticipant from '../actions/groupActions/getGroupParticipant';
import editGroup from '../actions/groupActions/editGroup';
import sendGroupMessage from '../actions/messageActions/sendGroupMessage';
import deleteGroupMessages from '../actions/messageActions/deleteGroupMessages';
import deleteGroupMessage from '../actions/groupActions/deleteGroupMessage';
import getGroupMessages from '../actions/groupActions/getGroupMessages';
import getMessages from '../actions/messageActions/getMessages';
import readMessage from '../actions/chatActions/readMessage';
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
router.post('/send-message:reciepientId', authenticateToken, sendMessage)
router.delete('/delete-message/:messageId', authenticateToken, deleteMessage)
router.patch('/update-message/:messageId', authenticateToken)
router.get( `/conversation-recepientId`,authenticateToken, getConversationWithrecepientId)
router.get('/get-messages/:recepientId',authenticateToken, getMessages )
router.get( `/groupConversation:conversationId`,authenticateToken, getGroupConversation)
router.post(`/star-message`,authenticateToken, starMessage)
router.post(`/unStar-message`, authenticateToken, unStarMessage )
router.post(`/delete-messages`, authenticateToken, deleteMessages)


//chat routes
router.get('/get-recepient-profile/:recepientId', authenticateToken, getRecepientProfile)
router.get("/read-message/:conversationId", authenticateToken, readMessage)

// user interActions
router.post('/add-friend', authenticateToken, addFriend)
router.post(`/un-friend`, authenticateToken, unFriend)
router.post('/singleFileUpload', upload.single("singleFile"), singleFileUpload)

// Group routes
router.post(`/send-group-message/:conversationId`, authenticateToken, sendGroupMessage)
router.post(`/star-group-message`,authenticateToken, starGroupMessage)
router.post(`/unStar-group-message`, authenticateToken, unStarGroupMessage )
router.delete(`/delete-group-messages/:conversationId`, authenticateToken, deleteGroupMessages)
router.delete(`/delete-group-message/:messageId`, authenticateToken, deleteGroupMessage)
router.post("/createGroup",authenticateToken, createGroup)
router.get("/get-group-profile-by-id/:groupId", authenticateToken, getGroupById)
router.get("/get-group-participants/:conversationId", authenticateToken, getGroupParticipant)
router.patch("/edit-group-details/:groupId", upload.fields([{name: "description"}, {name: "description"}, {name: "disappearingMessages"}, {name: "groupImage"}]), authenticateToken, editGroup)
router.get("/get-group-messages/:conversationId", authenticateToken, getGroupMessages)

export default router;
