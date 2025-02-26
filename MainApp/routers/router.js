"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middleware/verifyToken");
const verifyResetPassword_1 = __importDefault(require("../middleware/verifyResetPassword"));
const resetPassword_1 = __importDefault(require("../actions/authActions/resetPassword"));
const forgotPassword_1 = require("../actions/authActions/forgotPassword");
const updateProfile_1 = require("../actions/userManagementActions/updateProfile");
const google_1 = require("../actions/authActions/google");
const registerUser_1 = __importDefault(require("../actions/authActions/registerUser"));
const loginUser_1 = require("../actions/authActions/loginUser");
const updateUserPrivacy_1 = __importDefault(require("../actions/userManagementActions/updateUserPrivacy"));
const clearAllChat_1 = __importDefault(require("../actions/userManagementActions/clearAllChat"));
const getAndFilterChats_1 = require("../actions/userManagementActions/getAndFilterChats");
const sendMessage_1 = __importDefault(require("../actions/messageActions/sendMessage"));
const deleteMessage_1 = __importDefault(require("../actions/messageActions/deleteMessage"));
const getConversationWithrecepientId_1 = __importDefault(require("../actions/messageActions/getConversationWithrecepientId"));
// You can use the `--esModuleInterop` compiler option in your `tsconfig.json` file to avoid the need for explicit file extensions.
const router = (0, express_1.Router)();
//Auth routes
router.get('/auth/google', google_1.googleAuth);
router.get('/auth/callback/google', google_1.googleCallback);
router.get('/user', verifyToken_1.authenticateToken, verifyToken_1.getUserData);
router.post('/register', registerUser_1.default);
router.post('/login', loginUser_1.loginUser);
router.get('/logout', verifyToken_1.logout);
router.post('/password-reset', forgotPassword_1.forgotPassword);
router.get("/verifying-reset-password", verifyResetPassword_1.default);
router.post('/reset-password', resetPassword_1.default);
// user management routes
router.patch('/update-profile', verifyToken_1.authenticateToken, updateProfile_1.updateProfile);
router.patch("/update-user-privacy:currentProfileId", verifyToken_1.authenticateToken, updateUserPrivacy_1.default);
router.get('/clear-all-message/:userId', verifyToken_1.authenticateToken, clearAllChat_1.default);
router.get('/search', verifyToken_1.authenticateToken, getAndFilterChats_1.getAndFilterChats);
//message & conversation routes   
router.post('/send-message:conversationId', verifyToken_1.authenticateToken, sendMessage_1.default);
router.delete('/delete-message/:messageId', verifyToken_1.authenticateToken, deleteMessage_1.default);
router.patch('/update-message/:messageId', verifyToken_1.authenticateToken);
router.get(`/conversation-recepientId`, verifyToken_1.authenticateToken, getConversationWithrecepientId_1.default);
exports.default = router;
