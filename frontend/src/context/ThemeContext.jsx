import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) return savedTheme;
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
            return "light";
        }
        return "dark";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "light") {
            root.classList.add("light");
            root.classList.remove("dark");
        } else {
            root.classList.remove("light");
            root.classList.add("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
        const handleChange = (e) => {
            if (!localStorage.getItem("theme")) {
                setTheme(e.matches ? "light" : "dark");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
