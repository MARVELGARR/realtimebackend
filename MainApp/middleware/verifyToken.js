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
exports.logout = exports.getUserData = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../configs/prisma");
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionID = req.cookies.sessionID;
    if (!sessionID || sessionID === "null") {
        res.status(401).json({ error: 'No session ID provided' });
        return;
    }
    try {
        // Find the session in the database by 
        // session ID
        const session = yield prisma_1.prisma.session.findUnique({
            where: { id: sessionID },
        });
        if (!session) {
            res.status(401).json({ error: 'session dosent exist pls login again' });
            return;
        }
        // Optionally, you can validate JWT from the session
        const decoded = jsonwebtoken_1.default.verify(session.sessionToken, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        req.user = decoded; // Attach user data to request object
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            const session = yield prisma_1.prisma.session.findUnique({
                where: { id: sessionID },
            });
            if (!session) {
                res.status(401).json({ error: 'Session not found, please log in again' });
                return;
            }
            const refreshToken = session.refreshToken;
            if (!refreshToken) {
                res.status(401).json({ error: 'No refresh token found, please log in again' });
                return;
            }
            try {
                // Verify the refresh token
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET);
                // Generate a new access token
                const newAccessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId, email: decoded.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
                const updatedSession = yield prisma_1.prisma.session.update({
                    where: { id: sessionID },
                    data: {
                        sessionToken: newAccessToken
                    }
                });
                if (updatedSession) {
                    res.cookie('sessionData', updatedSession.id), {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                        maxAge: 24 * 60 * 60 * 1000,
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    };
                    res.status(200).json({ message: "Token refreshed successfully" });
                    return;
                }
                else {
                    res.status(200).json({ error: "Token refresh error" });
                    return;
                }
            }
            catch (refreshError) {
                res.status(401).json({ error: refreshError });
                return;
            }
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(400).json({ error: 'token error' });
            return;
        }
        else {
            console.error("Token verification failed:", error);
            res.status(500).json({ error: error });
            return;
        }
    }
});
exports.authenticateToken = authenticateToken;
const getUserData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user.email) {
        res.status(400).json({ error: 'User email is missing from the token' });
        return next();
    }
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: { email: req.user.email },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                profile: {
                    include: {
                        privacy: true
                    }
                },
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return next();
        }
        res.status(200).json(user);
        return next();
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to retrieve user data' });
        return next();
    }
});
exports.getUserData = getUserData;
const logout = (req, res) => {
    res.clearCookie('sessionID');
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
