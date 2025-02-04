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
exports.createSessionForUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../configs/prisma");
const createSessionForUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: user.id,
        email: user.email,
        name: user.name,
    };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m',
        issuer: 'realtime',
        audience: 'realtimers',
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7d',
        issuer: 'realtime',
        audience: 'realtimers',
    });
    const newUserSession = yield prisma_1.prisma.session.create({
        data: {
            userId: user.id,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Corrected expiration time calculation
            sessionToken: token,
            refreshToken: refreshToken,
        }
    });
    if (newUserSession) {
        return { sessionId: newUserSession.id };
    }
    else {
        throw new Error('Failed to create session'); // Throw an error instead of returning an error object
    }
});
exports.createSessionForUser = createSessionForUser;
