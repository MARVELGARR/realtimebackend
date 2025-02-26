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
const zod_1 = require("zod");
const formSchema = zod_1.z.object({
    message: zod_1.z.string(),
    reciepientId: zod_1.z.string().optional(),
});
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const messageBody = req.body;
    const { reciepientId, message } = messageBody;
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const user = req.user;
    try {
        const parsedData = formSchema.parse({ message, reciepientId });
        let newMessage;
        if (conversationId && conversationId !== "undefined") {
            // If conversationId is provided, connect to the existing conversation
            newMessage = yield prisma_1.prisma.message.create({
                data: {
                    content: parsedData.message,
                    user: {
                        connect: {
                            id: user.userId
                        }
                    },
                    conversation: {
                        connect: {
                            id: conversationId
                        }
                    }
                },
                include: {
                    conversation: true
                }
            });
        }
        else {
            // If conversationId is not provided, create a new conversation
            newMessage = yield prisma_1.prisma.message.create({
                data: {
                    content: parsedData.message,
                    user: {
                        connect: {
                            id: user.userId
                        }
                    },
                    conversation: {
                        create: {
                            type: "DIRECT",
                            participants: {
                                create: [
                                    { userId: user.userId },
                                    { userId: parsedData.reciepientId }
                                ]
                            }
                        }
                    }
                },
                include: {
                    conversation: true
                }
            });
        }
        if (newMessage) {
            res.status(200).json({ message: "Message sent", newMessage });
            return;
        }
        else {
            res.status(400).json({ error: "Message not sent" });
        }
    }
    catch (error) {
        res.status(500).json({ error: `${error}` });
    }
});
exports.default = sendMessage;
