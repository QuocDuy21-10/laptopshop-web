export const UNKNOWN_LABEL = "Không xác định";

/**
 * Looks up the Vietnamese label of an API enum value. Unknown values get a neutral fallback so a raw key
 * such as `REQUEST_CREATED` is never shown to people.
 */
export const labelOf = (map: Readonly<Record<string, string>>, value: string | null | undefined, fallback = UNKNOWN_LABEL) =>
  (value != null && map[value]) || fallback;
