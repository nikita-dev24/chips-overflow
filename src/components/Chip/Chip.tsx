import React from "react";
import styles from "./Chip.module.css";

export type ChipProps = {
  label: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export function Chip({ label, selected = false, disabled = false, onClick, className }: ChipProps) {
  const cls = [
    styles.chip,
    selected ? styles.selected : "",
    disabled ? styles.disabled : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={cls}
      aria-pressed={selected}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {label}
    </button>
  );
}