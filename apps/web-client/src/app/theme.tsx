import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

export type ThemePreference = "light" | "dark" | "system";

type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
    theme: ThemePreference;
    setTheme: (theme: ThemePreference) => void;
};

const storageKey = "nmm-theme";
const systemThemeQuery = "(prefers-color-scheme: dark)";
const themeValues = new Set<ThemePreference>(["light", "dark", "system"]);

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
    return value !== null && themeValues.has(value as ThemePreference);
}

function getStoredTheme(): ThemePreference {
    if (typeof window === "undefined") {
        return "system";
    }

    const storedTheme = window.localStorage.getItem(storageKey);

    return isThemePreference(storedTheme) ? storedTheme : "system";
}

function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") {
        return "light";
    }

    return window.matchMedia(systemThemeQuery).matches ? "dark" : "light";
}

function resolveTheme(theme: ThemePreference): ResolvedTheme {
    return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: ThemePreference) {
    const resolvedTheme = resolveTheme(theme);
    const root = window.document.documentElement;

    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setThemeState] = useState<ThemePreference>(getStoredTheme);

    const setTheme = useCallback((nextTheme: ThemePreference) => {
        setThemeState(nextTheme);
        window.localStorage.setItem(storageKey, nextTheme);
    }, []);

    useEffect(() => {
        applyTheme(theme);

        if (theme !== "system") {
            return;
        }

        const mediaQuery = window.matchMedia(systemThemeQuery);
        const handleSystemThemeChange = () => {
            applyTheme("system");
        };

        mediaQuery.addEventListener("change", handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
    }, [theme]);

    const contextValue = useMemo(
        () => ({
            theme,
            setTheme
        }),
        [setTheme, theme]
    );

    return <ThemeContext value={contextValue}>{children}</ThemeContext>;
}

export function useTheme() {
    const context = use(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider.");
    }

    return context;
}
