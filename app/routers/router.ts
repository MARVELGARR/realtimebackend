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
import getFriends from '../actions/userActions/getFriends';
import createNewGroup from '../actions/groupActions/createNewGroup';
import readMessage from '../actions/messagesAction/readMessage';
import updateGroupSetting from '../actions/groupActions/updateGroup';
import getParticipantProfile from '../actions/chatActions/participanProfile';
import getGroupDetails from '../actions/groupActions/getGroupDetails';
import sendFriendRequest from '../actions/friendActions/sendFriendRequest';
import addParticipant from '../actions/groupActions/addParticipant';
import getUsersProfile from '../actions/usersActions/getUsersProfile';
import removeParticipant from '../actions/groupActions/removeParticipant';
import blockUser from '../actions/userActions/blockUser';
import getBlockedUsers from '../actions/userActions/getBlockedUsers';
import unblockUser from '../actions/userActions/unBlockUser';
import removeFriend from '../actions/userActions/removeFriend';
import unreadMessageCount from '../actions/messagesAction/unreadmessageCount';
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
router.get('/block/:recieverId', authenticateToken, blockUser)
router.get("/block-users", authenticateToken, getBlockedUsers)
router.delete('/un-block-user/:recieverId', authenticateToken, unblockUser)
//users
router.get('/users', authenticateToken, getUsers)
router.get('/my-friends', authenticateToken, getMyFriends)
router.get("/friends", authenticateToken, getFriends)
router.get('/participant-profile/:userId', authenticateToken, getParticipantProfile)
router.get('/users-profile/:userId', authenticateToken, getUsersProfile)
// friend request
router.get('/friend-requests', authenticateToken,  getFriendsRequest)
router.post("/confirmFriendRequest", authenticateToken, acceptFriendRequest)
router.get('/send-friend-request/:receiverId', authenticateToken, sendFriendRequest)
router.delete('/remove-friend/:receiverId', authenticateToken, removeFriend)

//conversations
router.get('/conversations', authenticateToken, getConversations)
router.get('/convo-details/:conversationId', authenticateToken, getConvoDetails)
router.get('/messages/:conversationId', authenticateToken, getMessages)
router.get('/read-message/:conversationId', authenticateToken, readMessage)
router.get('/message-count', authenticateToken, unreadMessageCount)
//group
router.post('/createNewGroup', authenticateToken, createNewGroup)
router.post("/update-group-settings/:groupId", authenticateToken, updateGroupSetting)
router.get('/group-profile/:groupId', authenticateToken, getGroupDetails)
router.post('/add-participant/:groupId', authenticateToken, addParticipant)
router.delete("remove-participant/:groupId", authenticateToken, removeParticipant)

export default router;