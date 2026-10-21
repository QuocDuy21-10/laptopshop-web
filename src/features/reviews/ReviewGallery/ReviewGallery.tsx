"use client";

import { useMemo, useRef, useState } from "react";
import type { ReviewImage } from "@/lib/api/types";
import { Button } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import styles from "./ReviewGallery.module.scss";

export function ReviewGallery({ images = [] }: { images?: ReviewImage[] }) {
  const ordered = useMemo(() => [...images].sort((a, b) => a.position - b.position), [images]);
  const [selected, setSelected] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selectedIdRef = useRef<number | null>(null);
  if (!ordered.length) return null;

  return (
    <>
      <div data-testid="review-gallery" data-count={ordered.length} className={`${styles.gallery} ${styles[`count${Math.min(ordered.length, 3)}`]}`}>
        {ordered.map((image) => (
          <Button key={image.id} className={styles.trigger} variant="ghost" aria-label={`Mở ảnh review ${image.id}`} onClick={(event) => { triggerRef.current = event.currentTarget; selectedIdRef.current = image.id; setSelected(image.id); }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt={`Ảnh review ${image.id}`} width={image.width} height={image.height} loading="lazy" />
          </Button>
        ))}
      </div>
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) { setSelected(null); const id = selectedIdRef.current; setTimeout(() => { triggerRef.current?.focus(); if (id !== null) document.querySelector<HTMLButtonElement>(`button[aria-label="Mở ảnh review ${id}"]`)?.focus(); }, 0); } }} title="Ảnh review">
        {selected !== null && (() => {
          const image = ordered.find((item) => item.id === selected) ?? ordered[0];
          return (
            <div className={styles.lightbox}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={`Ảnh review ${image.id}`} width={image.width} height={image.height} />
            </div>
          );
        })()}
      </Dialog>
    </>
  );
}
