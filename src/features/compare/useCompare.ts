"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_COMPARE, getCompareItems, subscribeCompare } from "./store";

// the server snapshot is empty so the first client render matches the HTML
export const useCompare = () =>
  useSyncExternalStore(subscribeCompare, getCompareItems, () => EMPTY_COMPARE);
