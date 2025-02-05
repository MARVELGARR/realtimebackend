"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const router_1 = __importDefault(require("./routers/router"));
const cors_2 = __importDefault(require("./configs/cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const App = (0, express_1.default)();
const Port = process.env.PORT;
App.set("trust proxy", 1);
App.use(express_1.default.json());
App.use((0, cors_1.default)(cors_2.default));
App.use((0, cookie_parser_1.default)());
App.use("/api/v1", router_1.default);
App.listen(Port, () => {
    console.log(`Server running on http://localhost:${Port}`);
});
App.set('trust proxy', true);
