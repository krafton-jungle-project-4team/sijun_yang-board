import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@nmm/ui/components";
import { LaptopMinimalIcon, MoonIcon, SunIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useTheme, type ThemePreference } from "./theme";

type ThemeOption = {
    value: ThemePreference;
    label: string;
    icon: LucideIcon;
};

const themeOptions: ThemeOption[] = [
    {
        value: "light",
        label: "Light",
        icon: SunIcon
    },
    {
        value: "dark",
        label: "Dark",
        icon: MoonIcon
    },
    {
        value: "system",
        label: "System",
        icon: LaptopMinimalIcon
    }
];

const themeLabels: Record<ThemePreference, string> = {
    light: "Light",
    dark: "Dark",
    system: "System"
};

const themeIcons: Record<ThemePreference, LucideIcon> = {
    light: SunIcon,
    dark: MoonIcon,
    system: LaptopMinimalIcon
};

function isThemePreference(value: string): value is ThemePreference {
    return value === "light" || value === "dark" || value === "system";
}

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const CurrentThemeIcon = themeIcons[theme];

    const handleThemeChange = (value: string) => {
        if (isThemePreference(value)) {
            setTheme(value);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="icon-sm" aria-label={`Theme: ${themeLabels[theme]}`}>
                    <CurrentThemeIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
                    {themeOptions.map(({ value, label, icon: Icon }) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                            <Icon />
                            {label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
