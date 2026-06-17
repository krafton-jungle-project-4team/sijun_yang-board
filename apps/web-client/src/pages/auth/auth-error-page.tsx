import { Card, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";
import { useEffect } from "react";

import { showAuthenticationProblemFlashbar } from "@/app/app-flashbar-store";

export function AuthErrorPage() {
    useEffect(() => {
        showAuthenticationProblemFlashbar();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Authentication error</CardTitle>
                <CardDescription>The session could not be verified.</CardDescription>
            </CardHeader>
        </Card>
    );
}
