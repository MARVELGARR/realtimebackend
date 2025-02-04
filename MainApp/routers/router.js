"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const google_1 = require("../actions/google");
const verifyToken_1 = require("../middleware/verifyToken");
const registerUser_1 = __importDefault(require("../actions/registerUser"));
// You can use the `--esModuleInterop` compiler option in your `tsconfig.json` file to avoid the need for explicit file extensions.
const router = (0, express_1.Router)();
router.get('/auth/google', google_1.googleAuth);
router.get('/auth/callback/google', google_1.googleCallback);
router.get('/user', verifyToken_1.authenticateToken, verifyToken_1.getUserData);
router.post('/register', registerUser_1.default);
exports.default = router;
