import { Card, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";

export function AuthErrorPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Authentication error</CardTitle>
                <CardDescription>The session could not be verified.</CardDescription>
            </CardHeader>
        </Card>
    );
}
