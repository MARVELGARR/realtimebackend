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
const updateMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    const { message } = req.body;
    if (!messageId) {
        res.status(400).json({ error: 'Message ID is required' });
        return;
    }
    try {
        const updateMessage = yield prisma_1.prisma.message.update({
            where: { id: messageId },
            data: {
                content: message
            }
        });
        if (updateMessage) {
            res.status(200).json({ message: 'Message updated successfully' });
        }
        else {
            res.status(400).json({ error: 'Message not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = updateMessage;
