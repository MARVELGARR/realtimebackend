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
exports.forgotPassword = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("./sendEmail");
const prisma = new client_1.PrismaClient();
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Find user
        const user = yield prisma.user.findUnique({ where: { email } });
        // Don't reveal if user exists
        if (!user) {
            res.status(200).json({
                error: 'If an account exists with this email, you will receive a password reset link'
            });
            return;
        }
        // Generate reset token
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL}/resettingPassword?token=${resetToken}&userId=${user.id}`;
        const subject = "Password rest";
        // Send email
        yield (0, sendEmail_1.sendResetEmail)(email, resetLink, subject);
        res.status(200).json({
            message: 'If an account exists with this email, you will receive a password reset link'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: `Failed to process password reset request${error}` });
    }
});
exports.forgotPassword = forgotPassword;
