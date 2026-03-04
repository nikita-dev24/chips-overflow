import { ChipList } from "@/components/ChipList";
import styles from "./App.module.css";

export default function App() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <ChipList
          items={Array.from({ length: 13 }).map((_, i) => ({
            id: String(i + 1),
            label: `Чипс ${i + 1}`,
          }))}
        />
      </div>
    </div>
  );
}