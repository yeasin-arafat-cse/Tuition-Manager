import { createContext, useState, useEffect, useContext } from "react";

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // থিম লজিক
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // ভাষা লজিক (বাংলা/ইংরেজি)
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);
  const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "bn" : "en"));
  const t = (en, bn) => (language === "en" ? en : bn);

  return (
    <AppContext.Provider value={{ theme, toggleTheme, language, toggleLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
};