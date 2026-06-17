import { useSyncExternalStore } from "react";

export type AppFlashbarType = "error" | "info" | "success" | "warning";

export type AppFlashbarItem = {
    description?: string;
    title: string;
    type: AppFlashbarType;
};

type ShowGlobalProblemFlashbarInput = {
    description: string;
    title: string;
};

const appFlashbarStateKey = "__nmmAppFlashbarItem";
const appFlashbarEventName = "nmm:app-flashbar-change";

type AppFlashbarWindow = Window &
    typeof globalThis & {
        [appFlashbarStateKey]?: AppFlashbarItem | null;
    };

export function useAppFlashbarItem() {
    return useSyncExternalStore(subscribeAppFlashbar, getAppFlashbarSnapshot, getServerAppFlashbarSnapshot);
}

export function dismissAppFlashbar() {
    setAppFlashbarItem(null);
}

export function showAuthenticationFailedFlashbar() {
    showAppFlashbar({
        description: "Check your ID and password, then try again.",
        title: "Sign in failed",
        type: "error"
    });
}

export function showAuthenticationProblemFlashbar() {
    showAppFlashbar({
        description: "Your session could not be verified. Sign in again to continue.",
        title: "Authentication error",
        type: "error"
    });
}

export function showAuthenticationRequiredFlashbar() {
    showAppFlashbar({
        description: "Sign in to continue to this workspace page.",
        title: "Sign in required",
        type: "error"
    });
}

export function showGlobalProblemFlashbar({ description, title }: ShowGlobalProblemFlashbarInput) {
    showAppFlashbar({
        description,
        title,
        type: "error"
    });
}

export function showResourceCreatedFlashbar(resourceLabel: string) {
    showAppFlashbar({
        description: "The detail page is open.",
        title: `${resourceLabel} created`,
        type: "success"
    });
}

function showAppFlashbar(item: AppFlashbarItem) {
    setAppFlashbarItem(item);
}

function subscribeAppFlashbar(listener: () => void) {
    window.addEventListener(appFlashbarEventName, listener);

    return () => {
        window.removeEventListener(appFlashbarEventName, listener);
    };
}

function getAppFlashbarSnapshot() {
    if (typeof window === "undefined") {
        return null;
    }

    return (window as AppFlashbarWindow)[appFlashbarStateKey] ?? null;
}

function getServerAppFlashbarSnapshot() {
    return null;
}

function setAppFlashbarItem(item: AppFlashbarItem | null) {
    if (typeof window === "undefined") {
        return;
    }

    (window as AppFlashbarWindow)[appFlashbarStateKey] = item;
    window.dispatchEvent(new Event(appFlashbarEventName));
}
