"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corsOptions = {
    origin: `${process.env.FRONTEND_URL}`, // Your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
exports.default = corsOptions;
