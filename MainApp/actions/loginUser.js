"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const prisma_1 = require("../configs/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createSession_1 = require("./createSession");
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email) {
        res.status(400).json({
            error: "Email is required"
        });
    }
    if (!password) {
        res.status(400).json({ error: 'Password is required' });
    }
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            res.status(404).json({
                error: "You don't have an account"
            });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                error: "Wrong Password"
            });
        }
        const sessionID = yield (0, createSession_1.createSessionForUser)(user);
        res.cookie('sessionID', sessionID === null || sessionID === void 0 ? void 0 : sessionID.sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: "localhost",
            maxAge: 24 * 60 * 60 * 1000,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        res.status(200).json({
            message: "Login successful",
            user: user,
            sessionId: sessionID === null || sessionID === void 0 ? void 0 : sessionID.sessionId,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.loginUser = loginUser;
