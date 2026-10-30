"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, Search, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Price } from "@/components/ui/Price/Price";
import { addSearch, clearSearches, readSearches, removeSearch } from "@/features/products/searchHistory";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useHydrated } from "@/lib/useHydrated";
import styles from "./SearchBox.module.scss";

const MIN_CHARS = 2;
const searchHref = (q: string) => `/products?q=${encodeURIComponent(q)}`;

type Option = { key: string; href: string; search?: string; label: string; image?: string | null; price?: number };

/** Desktop search: suggestions as you type, recent searches when empty, Ctrl/⌘ + K to focus. */
export function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLFormElement>(null);
  const hydrated = useHydrated();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);

  const text = value.trim();
  const term = useDebouncedValue(text, 250);
  const typing = text.length >= MIN_CHARS;
  const { data } = useQuery({
    queryKey: queryKeys.searchSuggest(term),
    queryFn: async () =>
      (await unwrap(api.GET("/api/v1/products", { params: { query: { q: term, pageSize: 5 } } }))).data,
    enabled: open && term.length >= MIN_CHARS,
    staleTime: 60_000,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  let options: Option[] = [];
  if (!text) {
    options = recent.map((r) => ({ key: `r-${r}`, href: searchHref(r), search: r, label: r }));
  } else if (typing) {
    // the debounced term lags the input: only show results that belong to what is typed
    const products = term === text ? (data ?? []) : [];
    options = [
      ...products.map((p) => ({
        key: `p-${p.id}`,
        href: `/products/${p.id}`,
        label: p.name,
        image: p.image,
        price: p.salePrice ?? p.price,
      })),
      { key: "all", href: searchHref(text), search: text, label: `Xem tất cả kết quả cho "${text}"` },
    ];
  }

  const go = (o: Option) => {
    if (o.search) setRecent(addSearch(o.search));
    setOpen(false);
    inputRef.current?.blur();
    router.push(o.href);
  };

  const submit = () => {
    if (active >= 0 && options[active]) return go(options[active]);
    if (text) go({ key: "q", href: searchHref(text), search: text, label: text });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (options.length === 0) return;
      e.preventDefault();
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      // cycles -1 (the typed text itself) .. last option
      setActive((a) => ((a + 1 + step + options.length + 1) % (options.length + 1)) - 1);
    }
  };

  const showList = open && options.length > 0;
  const optionId = (i: number) => `${listId}-${i}`;

  return (
    <form
      ref={rootRef}
      action="/products"
      method="get"
      role="search"
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor="site-search" className={styles.label}>
        Tìm laptop
      </label>
      <Search size={18} aria-hidden="true" className={styles.icon} />
      <input
        ref={inputRef}
        id="site-search"
        name="q"
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        maxLength={100}
        value={value}
        placeholder="Tìm theo tên laptop…"
        className={styles.input}
        onChange={(e) => {
          setValue(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => {
          setRecent(readSearches());
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {hydrated && (
        <kbd className={styles.kbd} aria-hidden="true">
          {/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K"}
        </kbd>
      )}
      <ul id={listId} role="listbox" aria-label="Gợi ý tìm kiếm" className={styles.list} hidden={!showList}>
        {!text && (
          <li role="presentation" className={styles.heading}>
            <span>Tìm kiếm gần đây</span>
            <button
              type="button"
              className={styles.link}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setRecent(clearSearches())}
            >
              Xóa tất cả
            </button>
          </li>
        )}
        {options.map((o, i) => (
          <li key={o.key} role="presentation" className={styles.row}>
            <div
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              className={styles.option}
              data-active={i === active || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(o)}
            >
              {o.image !== undefined && o.price !== undefined ? (
                <span className={styles.thumb}>
                  {o.image && <Image src={o.image} alt="" width={40} height={40} unoptimized />}
                </span>
              ) : (
                <span className={styles.thumb}>
                  {text ? <Search size={16} aria-hidden="true" /> : <Clock size={16} aria-hidden="true" />}
                </span>
              )}
              <span className={styles.name}>{o.label}</span>
              {o.price !== undefined && <Price value={o.price} size="sm" />}
            </div>
            {!text && o.search && (
              <button
                type="button"
                tabIndex={-1}
                className={styles.remove}
                aria-label={`Xóa "${o.search}" khỏi lịch sử`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setRecent(removeSearch(o.search!))}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </form>
  );
}
