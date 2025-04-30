import { useState, useEffect } from "react";

const useCustomDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const storedPref = localStorage.getItem("darkMode");
      if (storedPref === "enabled") return true;
      if (storedPref === "disabled") return false;
      // If no stored preference, use system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("darkMode", "enabled");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("darkMode", "disabled");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return [isDarkMode, toggleDarkMode];
};

export default useCustomDarkMode;
