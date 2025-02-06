import {
  Request,
  Response,
  RequestHandler,
  RequestParamHandler,
} from "express";
import crypto from "crypto";
import { authConfig } from "../configs/auth.js";
import { createOauthUser, OauthRespondsUser } from "./creatOauthUser.js";


const domain = process.env.ENV 

// Store state tokens with expiry
const stateStore = new Map<string, { timestamp: number }>();

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

export const googleAuth: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    // Generate and store state parameter
    const state = crypto.randomBytes(32).toString("hex");
    stateStore.set(state, { timestamp: Date.now() });

    // Clean up expired states
    cleanupStates();

    const params = new URLSearchParams({
      client_id: authConfig.google.clientId!,
      redirect_uri: authConfig.google.callbackUrl!,
      response_type: "code",
      scope: authConfig.google.scopes.join(" "),
      access_type: "offline",
      state,
      prompt: "none",
    });

    const authUrl = `${authConfig.google.authUrl}?${params.toString()}`;
    res.redirect(authUrl);
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const googleCallback = async (
  req: Request,
  res: Response
) => {
  try {
    const { code, state } = req.query;

    // Verify state parameter
    if (!state || !stateStore.has(state as string)) {
      console.error("Invalid state parameter");
      return res
        .status(400)
        .redirect(`${process.env.FRONTEND_URL}/auth-error?error=invalid_state`);
    }

    stateStore.delete(state as string);

    if (!code) {
      console.error("Authorization code missing");
      return res
        .status(400)
        .redirect(
          `${process.env.FRONTEND_URL}/auth-error?error=code_missing`
        );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(authConfig.google.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: authConfig.google.clientId,
        client_secret: authConfig.google.clientSecret,
        redirect_uri: authConfig.google.callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    if (tokenResponse.ok) {
      const tokens = (await tokenResponse.json()) as any;

      // Fetch user information
      const userResponse = await fetch(authConfig.google.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${tokens?.access_token}`,
        },
      });

      if (!userResponse.ok) {
        console.error("Failed to fetch user information");
        throw new Error("Failed to fetch user information");
      }

      const userData = (await userResponse.json() ) as any
      
      const userWithTokens = {
        ...userData,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        id_token: tokens.id_token,
      }
      
      
      console.log("user from oAuth",userWithTokens)

      // Create or update the user and get session
      const sessionID = await createOauthUser(userWithTokens); 

    
      // Set session in HTTP-only cookie
      res.cookie('sessionID', sessionID?.sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, 
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

  
      res.redirect(`${process.env.FRONTEND_URL}/App`);
      
    } else {
      console.error("Failed to exchange authorization code");
      throw new Error("Failed to exchange authorization code");
    }
  } catch (error) {
    console.error("Google callback error:", error);
    res.status(500).redirect(
      `${process.env.FRONTEND_URL}/auth-error?error=server_error`
    );
  }
};