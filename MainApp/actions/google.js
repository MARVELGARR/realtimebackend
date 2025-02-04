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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.googleAuth = void 0;
const crypto_1 = __importDefault(require("crypto"));
const auth_js_1 = require("../configs/auth.js");
const creatOauthUser_js_1 = require("./creatOauthUser.js");
// Store state tokens with expiry
const stateStore = new Map();
const cleanupStates = () => {
    const now = Date.now();
    for (const [state, data] of stateStore.entries()) {
        if (now - data.timestamp > 600000) {
            // 10 minutes expiry
            stateStore.delete(state);
        }
    }
};
// Clean up states every 5 minutes
setInterval(cleanupStates, 300000);
const googleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate and store state parameter
        const state = crypto_1.default.randomBytes(32).toString("hex");
        stateStore.set(state, { timestamp: Date.now() });
        // Clean up expired states
        cleanupStates();
        const params = new URLSearchParams({
            client_id: auth_js_1.authConfig.google.clientId,
            redirect_uri: auth_js_1.authConfig.google.callbackUrl,
            response_type: "code",
            scope: auth_js_1.authConfig.google.scopes.join(" "),
            access_type: "offline",
            state,
            prompt: "consent",
        });
        const authUrl = `${auth_js_1.authConfig.google.authUrl}?${params.toString()}`;
        res.redirect(authUrl);
    }
    catch (error) {
        console.error("Google auth error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
});
exports.googleAuth = googleAuth;
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, state } = req.query;
        // Verify state parameter
        if (!state || !stateStore.has(state)) {
            console.error("Invalid state parameter");
            return res
                .status(400)
                .redirect(`${process.env.FRONTEND_URL}/auth-error?error=invalid_state`);
        }
        stateStore.delete(state);
        if (!code) {
            console.error("Authorization code missing");
            return res
                .status(400)
                .redirect(`${process.env.FRONTEND_URL}/auth-error?error=code_missing`);
        }
        // Exchange code for tokens
        const tokenResponse = yield fetch(auth_js_1.authConfig.google.tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code,
                client_id: auth_js_1.authConfig.google.clientId,
                client_secret: auth_js_1.authConfig.google.clientSecret,
                redirect_uri: auth_js_1.authConfig.google.callbackUrl,
                grant_type: "authorization_code",
            }),
        });
        if (tokenResponse.ok) {
            const tokens = (yield tokenResponse.json());
            // Fetch user information
            const userResponse = yield fetch(auth_js_1.authConfig.google.userInfoUrl, {
                headers: {
                    Authorization: `Bearer ${tokens === null || tokens === void 0 ? void 0 : tokens.access_token}`,
                },
            });
            if (!userResponse.ok) {
                console.error("Failed to fetch user information");
                throw new Error("Failed to fetch user information");
            }
            const userData = (yield userResponse.json());
            const userWithTokens = Object.assign(Object.assign({}, userData), { access_token: tokens.access_token, refresh_token: tokens.refresh_token, id_token: tokens.id_token });
            console.log("user from oAuth", userWithTokens);
            // Create or update the user and get session
            const sessionID = yield (0, creatOauthUser_js_1.createOauthUser)(userWithTokens);
            // Set session in HTTP-only cookie
            res.cookie('sessionID', sessionID === null || sessionID === void 0 ? void 0 : sessionID.sessionId, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                domain: "localhost",
                maxAge: 24 * 60 * 60 * 1000,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
            res.redirect(`${process.env.FRONTEND_URL}/App`);
        }
        else {
            console.error("Failed to exchange authorization code");
            throw new Error("Failed to exchange authorization code");
        }
    }
    catch (error) {
        console.error("Google callback error:", error);
        res.status(500).redirect(`${process.env.FRONTEND_URL}/auth-error?error=server_error`);
    }
});
exports.googleCallback = googleCallback;
