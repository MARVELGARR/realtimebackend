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
const getConversationWithrecepientId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recepientId } = req.query;
    const user = req.user;
    if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const conversation = yield prisma_1.prisma.conversation.findFirst({
            where: {
                participants: {
                    every: {
                        userId: {
                            in: [user.userId, recepientId]
                        }
                    }
                },
            },
            include: {
                messages: {
                    include: {
                        user: true
                    }
                },
                participants: {
                    distinct: ['userId']
                }
            }
        });
        if (conversation) {
            res.status(200).json(conversation);
            return;
        }
        else {
            res.status(404).json([]);
            return;
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
});
exports.default = getConversationWithrecepientId;
