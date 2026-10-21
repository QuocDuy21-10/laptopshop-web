"use client";

import { useEffect, useRef, useState } from "react";
import type { ReviewImage } from "@/lib/api/types";
import { Button } from "@/components/ui/Button/Button";
import styles from "./ReviewImagesEditor.module.scss";

export type ReviewImagesState = { existingIds: number[]; newFiles: File[] };

type NewItem = { kind: "new"; file: File; url: string };
type ExistingItem = { kind: "existing"; image: ReviewImage };
type Item = NewItem | ExistingItem;

type Props = {
  images: ReviewImage[];
  onChange: (state: ReviewImagesState) => void;
};

const previewUrl = (file: File) =>
  typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : "";

export function ReviewImagesEditor({ images, onChange }: Props) {
  const [items, setItems] = useState<Item[]>(() => images.map((image) => ({ kind: "existing", image })));
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef(new Set<string>());
  const imageSignature = images.map((image) => image.id).join(",");
  const signatureRef = useRef(imageSignature);

  useEffect(() => {
    if (signatureRef.current === imageSignature) return;
    signatureRef.current = imageSignature;
    setItems(images.map((image) => ({ kind: "existing", image })));
  }, [imageSignature, images]);

  useEffect(() => () => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
  }, []);

  const update = (next: Item[]) => {
    setItems(next);
    onChange({
      existingIds: next.filter((item): item is ExistingItem => item.kind === "existing").map((item) => item.image.id),
      newFiles: next.filter((item): item is NewItem => item.kind === "new").map((item) => item.file),
    });
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const available = Array.from(files).filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    const additions = available.slice(0, 3 - items.length).map((file) => {
      const url = previewUrl(file);
      if (url.startsWith("blob:")) urlsRef.current.add(url);
      return { kind: "new" as const, file, url };
    });
    if (additions.length) update([...items, ...additions]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  };

  const remove = (index: number) => {
    const item = items[index];
    if (item?.kind === "new" && item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
      urlsRef.current.delete(item.url);
    }
    update(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <fieldset className={styles.editor}>
      <legend>Ảnh thực tế ({items.length}/3 ảnh)</legend>
      <label className={styles.inputLabel} htmlFor="review-images-input">Chọn ảnh</label>
      <input
        ref={inputRef}
        id="review-images-input"
        className={styles.input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => addFiles(event.target.files)}
      />
      <div className={styles.grid}>
        {items.map((item, index) => {
          const url = item.kind === "existing" ? item.image.url : item.url;
          const name = item.kind === "existing" ? `ảnh ${item.image.id}` : item.file.name;
          return (
            <figure className={styles.item} key={item.kind === "existing" ? item.image.id : `${item.file.name}-${index}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={item.kind === "new" ? `Ảnh xem trước ${item.file.name}` : `Ảnh review ${item.image.id}`} width={item.kind === "existing" ? item.image.width : 160} height={item.kind === "existing" ? item.image.height : 120} />
              <figcaption>{name}</figcaption>
              <div className={styles.actions}>
                <Button size="sm" variant="ghost" disabled={index === 0} aria-label={`Sang trái ${name}`} onClick={() => move(index, -1)}>←</Button>
                <Button size="sm" variant="ghost" disabled={index === items.length - 1} aria-label={`Sang phải ${name}`} onClick={() => move(index, 1)}>→</Button>
                <Button size="sm" variant="danger" aria-label={`Xóa ảnh ${item.kind === "new" ? item.file.name : name}`} onClick={() => remove(index)}>Xóa</Button>
              </div>
            </figure>
          );
        })}
      </div>
    </fieldset>
  );
}
