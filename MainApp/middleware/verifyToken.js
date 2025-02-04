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
    if (!sessionID) {
        return res.status(401).json({ error: 'No session ID provided' });
    }
    try {
        // Find the session in the database by session ID
        const session = yield prisma_1.prisma.session.findUnique({
            where: { id: sessionID },
        });
        if (!session) {
            return res.status(401).json({ error: 'Invalid session' });
        }
        // Optionally, you can validate JWT from the session
        const decoded = jsonwebtoken_1.default.verify(session.sessionToken, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        req.user = decoded; // Attach user data to request object
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: 'Token has expired, please log in again' });
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token, please log in again' });
        }
        else {
            console.error("Token verification failed:", error);
            res.status(500).json({ error: 'Something went wrong with token verification' });
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
                profile: true,
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
    res.clearCookie('token'); // Clear the session token cookie
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
