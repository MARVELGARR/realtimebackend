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
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const verifyResetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    const secret = process.env.JWT_SECRET;
    if (typeof token !== 'string') {
        res.status(400).json({ error: 'Invalid token' });
        return;
    }
    try {
        const verify = jsonwebtoken_1.default.verify(token, secret);
        req.passwordReset = verify;
        res.status(200).json({
            message: "verification success",
            token: `${token}`
        });
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
        return;
    }
});
exports.default = verifyResetPassword;
