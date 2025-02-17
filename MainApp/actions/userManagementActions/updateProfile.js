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
exports.updateProfile = void 0;
const prisma_1 = require("../../configs/prisma");
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { nickname, bio, email, profilePicture, phoneNumber } = req.body;
    if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
    }
    try {
        const updatedUser = yield prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                email,
                profile: {
                    update: {
                        profilePicture,
                        nickname,
                        bio,
                        phoneNumber
                    },
                },
            },
            include: {
                profile: true
            }
        });
        res
            .status(200)
            .json({ message: "Profile updated successfully", user: updatedUser });
        return;
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
});
exports.updateProfile = updateProfile;
