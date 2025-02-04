"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Store state tokens with expiry
const stateStore = new Map();
const cleanupStates = () => {
    const now = Date.now();
    for (const [state, data] of stateStore.entries()) {
        if (now - data.timestamp > 600000) { // 10 minutes expiry
            stateStore.delete(state);
        }
    }
};
