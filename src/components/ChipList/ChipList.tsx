import { useEffect, useRef, useState } from "react";
import { Chip } from "@/components/Chip";
import styles from "./ChipList.module.css";

type Item = {
  id: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  items: Item[];
  onChange?: (selectedIds: string[]) => void;
};

export function ChipList({ items, onChange }: Props) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const dotsMeasureRef = useRef<HTMLButtonElement | null>(null);
  const chipMeasureRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(items.length);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      onChange?.(next);
      return next;
    });
  }

  function recalc() {
    const row = rowRef.current;
    if (!row) return;

    const rowWidth = row.clientWidth;
    if (rowWidth <= 0) return;

    const gap = 10;
    const dotsW = Math.ceil(dotsMeasureRef.current?.getBoundingClientRect().width ?? 0);

    const widths = items.map((it) => {
      const el = chipMeasureRefs.current[it.id];
      return Math.ceil(el?.getBoundingClientRect().width ?? 0);
    });

    const total = widths.reduce((a, b) => a + b, 0) + Math.max(0, items.length - 1) * gap;

    if (total <= rowWidth) {
      setVisibleCount(items.length);
      return;
    }

    let used = 0;
    let fit = 0;

    for (let i = 0; i < widths.length; i++) {
      const w = widths[i];
      const nextUsed = used + (i === 0 ? 0 : gap) + w;
      const need = nextUsed + gap + dotsW;

      if (need <= rowWidth) {
        used = nextUsed;
        fit = i + 1;
      } else {
        break;
      }
    }

    setVisibleCount(fit);
    if (fit === items.length) setOpen(false);
  }

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const ro = new ResizeObserver(() => recalc());
    ro.observe(row);

    recalc();
    return () => ro.disconnect();
  }, [items]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!open) return;
      if (!rowRef.current?.parentElement?.contains(e.target as Node)) setOpen(false);
    }

    function onDocKeyDown(e: KeyboardEvent) {
      if (open && e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [open]);

  const visible = items.slice(0, visibleCount);
  const hidden = items.slice(visibleCount);
  const showDots = hidden.length > 0;

  return (
    <div className={styles.root}>
      <div ref={rowRef} className={styles.row}>
        {visible.map((it) => (
          <Chip
            key={it.id}
            label={it.label}
            selected={selectedIds.includes(it.id)}
            disabled={it.disabled}
            onClick={() => toggleSelect(it.id)}
          />
        ))}

        {showDots && (
          <div className={styles.dotsWrap}>
            <button
              type="button"
              className={styles.dotsBtn}
              aria-label="Показать остальные чипсы"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              ...
            </button>

            {open && (
              <div className={styles.popover} role="dialog" aria-label="Остальные чипсы">
                <div className={styles.popoverInner}>
                  {hidden.map((it) => (
                    <Chip
                      key={it.id}
                      label={it.label}
                      selected={selectedIds.includes(it.id)}
                      disabled={it.disabled}
                      onClick={() => toggleSelect(it.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.measureLayer} aria-hidden="true">
          {items.map((it) => (
            <button
              key={it.id}
              ref={(el) => {
                chipMeasureRefs.current[it.id] = el;
              }}
              className={styles.measureChip}
              type="button"
            >
              {it.label}
            </button>
          ))}

          <button ref={dotsMeasureRef} className={styles.measureChip} type="button">
            ...
          </button>
        </div>
      </div>
    </div>
  );
}