import { useSyncExternalStore } from "react";

import { getPathname, subscribeToLocation } from "../utils/navigation";

/**
 * The current URL path, re-rendering on `navigate` and on Back/Forward. Reads `window.location`
 * directly rather than mirroring it in state, so it can never disagree with the address bar.
 */
export const usePathname = (): string => useSyncExternalStore(subscribeToLocation, getPathname);
