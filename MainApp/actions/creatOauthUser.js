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
exports.createOauthUser = void 0;
const auth_1 = require("../configs/auth");
const prisma_1 = require("../configs/prisma");
const createSession_1 = require("./createSession");
const createOauthUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.prisma.user.findUnique({
        where: { email: user.email },
    });
    if (existingUser) {
        return yield (0, createSession_1.createSessionForUser)(existingUser);
    }
    // If user doesn't exist, create new user with account
    const newUser = yield prisma_1.prisma.user.create({
        data: {
            email: user.email,
            name: user.name,
            image: user.picture,
            password: "",
            profile: {
                create: {
                    bio: "",
                    profilePicture: user.picture,
                    firstName: user.given_name,
                    lastName: user.family_name,
                    birthDay: user.birthDay,
                    gender: user.gender,
                    phoneNumber: user.phoneNumber
                }
            },
            accounts: {
                create: [{
                        type: "oauth",
                        provider: 'google',
                        providerAccountId: user.id,
                        access_token: user.access_token || '',
                        refresh_token: user.refresh_token || '',
                        token_type: 'Bearer',
                        scope: auth_1.scopes.join(" "),
                        id_token: user.id_token || '',
                        expires_at: null,
                    }]
            }
        }
    });
    if (newUser) {
        return yield (0, createSession_1.createSessionForUser)(newUser);
    }
});
exports.createOauthUser = createOauthUser;
