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
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const { message } = req.body;
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const user = req.user;
    if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
    }
    if (!conversationId) {
        res.status(400).json({ error: 'Conversation ID is required' });
        return;
    }
    try {
        const newMessage = yield prisma_1.prisma.message.create({
            data: {
                conversationId: conversationId,
                content: message,
                userId: req.user.userId,
                conversation: {
                    connect: {
                        id: conversationId
                    }
                }
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = sendMessage;
