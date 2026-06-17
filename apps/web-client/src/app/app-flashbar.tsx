import { Alert, AlertDescription, AlertTitle, Button } from "@nmm/ui/components";
import { CheckCircleIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { dismissAppFlashbar, useAppFlashbarItem } from "./app-flashbar-store";
import type { AppFlashbarType } from "./app-flashbar-store";

const flashbarIcons = {
    error: OctagonXIcon,
    info: InfoIcon,
    success: CheckCircleIcon,
    warning: TriangleAlertIcon
} satisfies Record<AppFlashbarType, LucideIcon>;

const flashbarClassNames = {
    error: "border-destructive/30 bg-card text-card-foreground [&>svg]:text-destructive",
    info: "bg-card text-card-foreground",
    success: "bg-card text-card-foreground",
    warning: "bg-card text-card-foreground"
} satisfies Record<AppFlashbarType, string>;

export function AppFlashbar() {
    const item = useAppFlashbarItem();

    if (!item) {
        return null;
    }

    const Icon = flashbarIcons[item.type];

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pt-4">
            <Alert
                variant={item.type === "error" ? "destructive" : "default"}
                className={getFlashbarClassName(item.type)}
            >
                <Icon />
                <div className="min-w-0">
                    <AlertTitle className="col-auto">{item.title}</AlertTitle>
                    {item.description ? (
                        <AlertDescription className="col-auto">{item.description}</AlertDescription>
                    ) : null}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="col-start-3 row-start-1"
                    aria-label="Dismiss notification"
                    onClick={dismissAppFlashbar}
                >
                    <XIcon />
                </Button>
            </Alert>
        </div>
    );
}

function getFlashbarClassName(type: AppFlashbarType) {
    return `grid-cols-[auto_1fr_auto] gap-x-3 ${flashbarClassNames[type]}`;
}
