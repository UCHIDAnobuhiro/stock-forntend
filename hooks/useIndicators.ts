import { useState, useCallback } from "react";

export function useIndicators() {
  const [smaEnabled, setSmaEnabled] = useState(false);
  const [bollingerEnabled, setBollingerEnabled] = useState(false);

  const toggleSma = useCallback(() => {
    setSmaEnabled((v) => !v);
  }, []);

  const toggleBollinger = useCallback(() => {
    setBollingerEnabled((v) => !v);
  }, []);

  return { smaEnabled, toggleSma, bollingerEnabled, toggleBollinger };
}
