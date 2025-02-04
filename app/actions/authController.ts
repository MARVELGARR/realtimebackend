import { Request, Response } from 'express';
import crypto from 'crypto';

// Store state tokens with expiry
const stateStore = new Map<string, { timestamp: number }>();

const cleanupStates = () => {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (now - data.timestamp > 600000) { // 10 minutes expiry
      stateStore.delete(state);
    }
  }
};