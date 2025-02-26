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
const clearAllChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId) {
        res.status(400).json({ error: "No userId not found" });
        return;
    }
    if (userId === "null" || userId == null) {
        res.status(400).json({ error: "userId null" });
        return;
    }
    try {
        const clearMessage = yield prisma_1.prisma.message.deleteMany({
            where: { userId }
        });
        if (clearMessage) {
            res.status(200).json({ message: 'All message Cleared' });
            return;
        }
        else {
            res.status(500).json({ error: 'something wentwrong' });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ error: "Seomething went wrong" });
        return;
    }
});
exports.default = clearAllChats;
