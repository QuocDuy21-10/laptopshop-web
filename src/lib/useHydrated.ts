import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

// false on the server and during hydration, true afterwards: gate markup that depends on client-only state
// (React never patches mismatched attributes or elements while hydrating)
export const useHydrated = () => useSyncExternalStore(noopSubscribe, () => true, () => false);
