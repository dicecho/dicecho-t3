import { useDebugValue, useEffect, useState } from "react";

export const useLocalStorage = <S>(
  key: string,
  initialState?: S | (() => S)
): [S, React.Dispatch<React.SetStateAction<S>>] => {
  // Use lazy initialization to properly handle function initializers
  const [state, setState] = useState<S>(() =>
    typeof initialState === "function"
      ? (initialState as () => S)()
      : (initialState as S)
  );
  const [mounted, setMounted] = useState(false);
  useDebugValue(state);

  useEffect(() => {
    const item = localStorage.getItem(key);
    if (item) setState(parse(item));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(key, JSON.stringify(state));

  }, [key, state, mounted]);

  return [state, setState];
};

const parse = <R>(value: string): R => {
  try {
    return JSON.parse(value) as R;
  } catch {
    return value as R;
  }
};
