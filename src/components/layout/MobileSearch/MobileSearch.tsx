"use client";

import { Search } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import { SearchForm } from "../SearchForm/SearchForm";
import styles from "./MobileSearch.module.scss";

/** Phones only: the desktop search field is hidden below 768px, so the header gets a trigger instead. */
export function MobileSearch() {
  return (
    <Dialog
      variant="sheet"
      title="Tìm laptop"
      trigger={
        <button type="button" className={styles.trigger} aria-label="Tìm kiếm">
          <Search size={20} aria-hidden="true" />
        </button>
      }
    >
      <SearchForm id="mobile-search" autoFocus />
    </Dialog>
  );
}
