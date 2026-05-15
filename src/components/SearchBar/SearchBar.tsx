import { useEffect, useState, type KeyboardEvent } from "react";
import styles from "./SearchBar.module.css";

interface Props {
  defaultValue?: string;
  placeholder?: string;
  sugerencias?: string[];
  onSearch: (clave: string) => void;
}

export default function SearchBar({
  defaultValue = "",
  placeholder = "Clave de casilla",
  sugerencias,
  onSearch,
}: Props) {
  const [value, setValue] = useState(defaultValue);

  // Si la URL cambia (ej. navegación desde Inicio), sincroniza el input.
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = () => {
    if (value.trim()) onSearch(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar}>
        <span className={styles.prompt} aria-hidden="true">
          →
        </span>
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
          spellCheck={false}
          aria-label="Clave de casilla"
        />
        <button
          className={styles.button}
          onClick={handleSubmit}
          disabled={!value.trim()}
        >
          Buscar
        </button>
      </div>
      {sugerencias && sugerencias.length > 0 && (
        <div className={styles.sugerencias}>
          <span className={styles.sugLabel}>Prueba con</span>
          {sugerencias.map((s) => (
            <button
              key={s}
              className={styles.sugChip}
              onClick={() => {
                setValue(s);
                onSearch(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}