import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";

type UseLocalStorageOptions<T> = {
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
  sync?: boolean; // listen to storage events
};

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>, { remove: () => void; reset: () => void }] {
  const {
    serialize = (v: T) => JSON.stringify(v),
    deserialize = (raw: string) => {
      try {
        return JSON.parse(raw) as T;
      } catch {
        // Fallback: treat raw as string if T extends string, else throw
        return raw as unknown as T;
      }
    },
    sync = true,
  } = options;

  const initRef = useRef(false);

  const getStored = useCallback((): T => {
    if (!isBrowser()) {
      return typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        return typeof initialValue === "function"
          ? (initialValue as () => T)()
          : initialValue;
      }
      return deserialize(raw);
    } catch {
      return typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;
    }
  }, [key, initialValue, deserialize]);

  const [value, setValue] = useState<T>(getStored);

  useEffect(() => {
    if (!isBrowser()) return;
    if (initRef.current) return;
    initRef.current = true;
    // Ensure localStorage has initial value if missing
    if (window.localStorage.getItem(key) === null) {
      try {
        window.localStorage.setItem(key, serialize(value));
      } catch {
        /* ignore quota errors */
      }
    }
  }, [key, serialize, value]);

  const setStoredValue: Dispatch<SetStateAction<T>> = useCallback(
    (update) => {
      setValue((prev) => {
        const next =
          typeof update === "function" ? (update as (p: T) => T)(prev) : update;
        if (isBrowser()) {
          try {
            window.localStorage.setItem(key, serialize(next));
          } catch {
            /* ignore */
          }
        }
        return next;
      });
    },
    [key, serialize]
  );

  const remove = useCallback(() => {
    if (isBrowser()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
    setValue(
      typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue
    );
  }, [key, initialValue]);

  const reset = useCallback(() => {
    const base =
      typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;
    setStoredValue(base);
  }, [initialValue, setStoredValue]);

  useEffect(() => {
    if (!sync || !isBrowser()) return;
    const handler = (e: StorageEvent) => {
      if (e.storageArea === window.localStorage && e.key === key) {
        setValue(
          e.newValue === null
            ? typeof initialValue === "function"
              ? (initialValue as () => T)()
              : initialValue
            : deserialize(e.newValue)
        );
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, sync, deserialize, initialValue]);

  return [value, setStoredValue, { remove, reset }];
}
