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
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    if (!messageId) {
        res.status(400).json({ error: 'Message ID is required' });
        return;
    }
    try {
        const deleteMessage = yield prisma_1.prisma.message.delete({
            where: { id: messageId }
        });
        if (deleteMessage) {
            res.status(200).json({ message: 'Message deleted successfully' });
            return;
        }
        else {
            res.status(500).json({ error: 'Failed to delete message' });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = deleteMessage;
