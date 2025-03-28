import { useRef, useEffect } from "react";

export default function useEnterKey() {
  const inputRef = useRef(null);
  useEffect(() => {
    function focusInput(e) {
      if (inputRef.current === document.activeElement) return;
        if (e.key === "Enter")
            inputRef.current.focus();
    }
    document.addEventListener("keydown", focusInput);
    return () => {
      document.removeEventListener("keydown", focusInput);
    };
  }, []);
    return inputRef;
    
}