import { useSyncExternalStore } from "react";

import { getAuthSnapshot, subscribeToAuth, type AuthSnapshot } from "../utils/authSession";

/**
 * The current sign-in state, re-rendering when it changes (including sign-out in another tab).
 * Reads the session module directly rather than a Context or the editor store, per CLAUDE.md's
 * "no second state mechanism" rule: the session module is the single owner of auth state.
 */
export const useAuthSession = (): AuthSnapshot => useSyncExternalStore(subscribeToAuth, getAuthSnapshot);
