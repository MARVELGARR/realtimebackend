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
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../configs/prisma");
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionId = req.cookies.sessionID;
    if (!sessionId) {
        res.status(400).json({ error: "No session ID found in cookies" });
        return;
    }
    try {
        const deletedSession = yield prisma_1.prisma.session.delete({
            where: { id: sessionId }
        });
        if (deletedSession) {
            res.clearCookie('sessionID', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                domain: "localhost"
            });
            res.status(200).json({ message: "Logout successful" });
            return;
        }
        else {
            res.status(500).json({ error: "Failed to delete session" });
            return;
        }
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});
exports.default = logout;
