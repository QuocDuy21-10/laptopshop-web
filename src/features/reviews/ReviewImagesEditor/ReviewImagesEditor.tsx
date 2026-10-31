"use client";

import { useEffect, useRef, useState } from "react";
import type { ReviewImage } from "@/lib/api/types";
import { Button } from "@/components/ui/Button/Button";
import styles from "./ReviewImagesEditor.module.scss";

export type DraftImage =
  | { kind: "new"; clientId: string; file: File; url: string }
  | { kind: "existing"; clientId: string; image: ReviewImage };
export type ReviewImagesState = DraftImage[];

type Props = {
  images: ReviewImage[];
  value?: ReviewImagesState;
  disabled?: boolean;
  onChange: (state: ReviewImagesState) => void;
};

const previewUrl = (file: File) =>
  typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : "";
const draftClientId = () =>
  typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

export function ReviewImagesEditor({ images, value, disabled = false, onChange }: Props) {
  const [localItems, setLocalItems] = useState<DraftImage[]>(() =>
    images.map((image) => ({ kind: "existing", clientId: `existing-${image.id}`, image })),
  );
  const items = value ?? localItems;
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef(new Set<string>());
  const [fileError, setFileError] = useState<string | null>(null);
  const imageSignature = images.map((image) => `${image.id}:${image.position}`).join(",");
  const signatureRef = useRef(imageSignature);

  useEffect(() => {
    if (value !== undefined || signatureRef.current === imageSignature) return;
    signatureRef.current = imageSignature;
    setLocalItems(
      images.map((image) => ({ kind: "existing", clientId: `existing-${image.id}`, image })),
    );
  }, [imageSignature, images, value]);

  useEffect(
    () => () => {
      for (const url of urlsRef.current) URL.revokeObjectURL(url);
    },
    [],
  );

  const update = (next: DraftImage[]) => {
    if (value === undefined) setLocalItems(next);
    onChange(next);
  };

  useEffect(() => {
    const active = new Set(items.flatMap((item) => (item.kind === "new" ? [item.url] : [])));
    for (const url of urlsRef.current)
      if (!active.has(url)) {
        URL.revokeObjectURL(url);
        urlsRef.current.delete(url);
      }
  }, [items]);

  const addFiles = (files: FileList | null) => {
    if (!files || disabled) return;
    setFileError(null);
    const selected = Array.from(files);
    const invalidType = selected.find(
      (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );
    if (invalidType) {
      setFileError(`Định dạng ảnh không được hỗ trợ: ${invalidType.name}`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const tooLarge = selected.find((file) => file.size > 3 * 1024 * 1024);
    if (tooLarge) {
      setFileError(`Ảnh vượt quá 3 MB: ${tooLarge.name}`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const available = selected;
    if (available.length > 3 - items.length) {
      setFileError("Review chỉ được tối đa 3 ảnh.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const additions = available.slice(0, 3 - items.length).map((file) => {
      const url = previewUrl(file);
      if (url.startsWith("blob:")) urlsRef.current.add(url);
      return { kind: "new" as const, clientId: draftClientId(), file, url };
    });
    if (additions.length) update([...items, ...additions]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (index: number, offset: -1 | 1) => {
    if (disabled) return;
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  };

  const remove = (index: number) => {
    if (disabled) return;
    const item = items[index];
    if (item?.kind === "new" && urlsRef.current.has(item.url)) {
      URL.revokeObjectURL(item.url);
      urlsRef.current.delete(item.url);
    }
    update(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <fieldset className={styles.editor} disabled={disabled}>
      <legend>Ảnh thực tế ({items.length}/3 ảnh)</legend>
      <label className={styles.inputLabel} htmlFor="review-images-input">
        Chọn ảnh
      </label>
      <input
        ref={inputRef}
        id="review-images-input"
        className={styles.input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => addFiles(event.target.files)}
      />
      {fileError && <p className={styles.error}>{fileError}</p>}
      <div className={styles.grid}>
        {items.map((item, index) => {
          const url = item.kind === "existing" ? item.image.url : item.url;
          const name = item.kind === "existing" ? `ảnh ${item.image.id}` : item.file.name;
          return (
            <figure className={styles.item} key={item.clientId}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={
                  item.kind === "new"
                    ? `Ảnh xem trước ${item.file.name}`
                    : `Ảnh review ${item.image.id}`
                }
                width={item.kind === "existing" ? item.image.width : 160}
                height={item.kind === "existing" ? item.image.height : 120}
              />
              <figcaption>{name}</figcaption>
              <div className={styles.actions}>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={index === 0}
                  aria-label={`Sang trái ${name}`}
                  onClick={() => move(index, -1)}
                >
                  ←
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={index === items.length - 1}
                  aria-label={`Sang phải ${name}`}
                  onClick={() => move(index, 1)}
                >
                  →
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  aria-label={`Xóa ảnh ${item.kind === "new" ? item.file.name : name}`}
                  onClick={() => remove(index)}
                >
                  Xóa
                </Button>
              </div>
            </figure>
          );
        })}
      </div>
    </fieldset>
  );
}
