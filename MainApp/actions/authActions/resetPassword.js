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
const prisma_1 = require("../../configs/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password } = req.body;
        const token = req.query.token;
        const secret = process.env.JWT_SECRET;
        const verify = jsonwebtoken_1.default.verify(token, secret);
        const user = yield prisma_1.prisma.user.findUnique({
            where: { email: verify.email }
        });
        if (!user) {
            res.status(400).json({ error: "User not found" });
            return;
        }
        const encryptedPassword = yield bcrypt_1.default.hash(password, 10);
        const updateUser = yield prisma_1.prisma.user.update({
            where: { email: user.email },
            data: { password: encryptedPassword }
        });
        if (updateUser) {
            res.status(200).json({ message: "Password changed successfully" });
            return;
        }
        else {
            res.status(500).json({ error: "Error changing password" });
            return;
        }
    }
    catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
});
exports.default = resetPassword;
