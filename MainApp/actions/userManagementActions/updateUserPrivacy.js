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
const zod_1 = require("zod");
const prisma_1 = require("../../configs/prisma");
const FormSchema = zod_1.z.object({
    lastSeen: zod_1.z.enum(["EVERYONE", "MYCONTACTS", "NOBODY"]).optional(),
    online: zod_1.z.enum(["EVERYONE", "NOBODY"]).optional(),
    readreceipt: zod_1.z.boolean().default(false).optional(),
    disappearing: zod_1.z.enum(["OFF", "DAYS90", "DAYS7", "H24"]).optional(),
});
const updateUserPrivacy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { currentProfileId } = req.params;
    const { disappearing, lastSeen, online, readreceipt } = req.body;
    console.log(currentProfileId);
    if (!currentProfileId || currentProfileId === "null") {
        res.status(400).json({ error: "Invalid profile ID" });
        return;
    }
    try {
        // Validate input
        const parsedData = FormSchema.parse({ disappearing, lastSeen, online, readreceipt });
        const isPrivacyExist = yield prisma_1.prisma.privacy.findUnique({
            where: { profileId: currentProfileId }
        });
        if (!isPrivacyExist) {
            // Create a new privacy record if it does not exist
            const createPrivacy = yield prisma_1.prisma.privacy.create({
                data: {
                    profileId: currentProfileId,
                    disappearingMessages: parsedData.disappearing,
                    lastSeen: parsedData.lastSeen,
                    precense: parsedData.online,
                    readReciept: parsedData.readreceipt,
                },
            });
            if (createPrivacy) {
                res.status(200).json({ message: "privacy created", privacy: createPrivacy });
                return;
            }
        }
        else {
            const privacyUpdated = yield prisma_1.prisma.privacy.update({
                where: { profileId: currentProfileId },
                data: {
                    disappearingMessages: parsedData.disappearing,
                    lastSeen: parsedData.lastSeen,
                    precense: parsedData.online,
                    readReciept: parsedData.readreceipt,
                }
            });
            if (privacyUpdated) {
                res.status(200).json({ message: "privacy updates", privacy: privacyUpdated });
                return;
            }
        }
        const updatedProfile = yield prisma_1.prisma.user.findUnique({
            where: { id: currentProfileId },
            include: {
                profile: {
                    include: {
                        privacy: true,
                    },
                },
            },
        });
        if (updatedProfile) {
            res.status(200).json({ message: "Privacy updated", privacy: (_a = updatedProfile.profile) === null || _a === void 0 ? void 0 : _a.privacy });
            return;
        }
    }
    catch (error) {
        console.error('Error updating privacy:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    return;
});
exports.default = updateUserPrivacy;
