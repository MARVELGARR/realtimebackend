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
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../configs/prisma");
const createSession_1 = require("./createSession");
const client_1 = require("@prisma/client");
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, phoneNumber, email, password, gender, birthday } = req.body;
    const missingField = !firstname ? 'firstname' :
        !lastname ? 'lastname' :
            !phoneNumber ? 'phoneNumber' :
                !email ? 'email' : null;
    switch (missingField) {
        case 'firstname':
            res.status(400).json({ message: 'firstname is required' });
            return;
        case 'lastname':
            res.status(400).json({ message: 'lastname is required' });
            return;
        case 'phoneNumber':
            res.status(400).json({ message: 'phoneNumber is required' });
            return;
        case 'email':
            res.status(400).json({ message: 'email is required' });
            return;
        default:
            break;
    }
    const hashed = yield bcrypt_1.default.hash(password, 10);
    try {
        const existingUser = yield prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ message: 'email already exists' });
            return;
        }
        const Genda = (genda) => {
            switch (genda) {
                case "male":
                    return client_1.Gender.MALE;
                case "female":
                    return client_1.Gender.FEMALE;
                case "others":
                    return client_1.Gender.OTHERS;
                default:
                    break;
            }
        };
        const newUser = yield prisma_1.prisma.user.create({
            data: {
                email,
                name: `${firstname} ${lastname}`,
                password: hashed,
                profile: {
                    create: {
                        bio: "",
                        firstName: firstname,
                        lastName: lastname,
                        birthDay: new Date(birthday),
                        gender: Genda(gender),
                        phoneNumber: phoneNumber,
                    }
                }
            }
        });
        if (newUser) {
            const sessionId = yield (0, createSession_1.createSessionForUser)(newUser);
            res.cookie('sessionID', sessionId === null || sessionId === void 0 ? void 0 : sessionId.sessionId, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                domain: "localhost",
                maxAge: 24 * 60 * 60 * 1000,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
            res.status(200).json({
                message: "User registered successfully",
                sessionId: sessionId === null || sessionId === void 0 ? void 0 : sessionId.sessionId,
            });
        }
        else {
            res.status(400).json({ message: "User registered successfully",
                sessionId: null });
            return;
        }
    }
    catch (err) {
        res.status(500).json({ message: `Internal server error: ${err}` });
        return;
    }
});
exports.default = registerUser;
