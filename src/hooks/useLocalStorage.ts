import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {

  const readValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);

      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Reload when key changes (different user)
  useEffect(() => {
    setStoredValue(readValue());
  }, [key]);

  // Save to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify(storedValue)
      );
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}