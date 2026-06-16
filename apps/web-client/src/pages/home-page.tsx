import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@nmm/ui/components";
import { Link } from "@tanstack/react-router";

export function HomePage() {
    return (
        <div className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <CardHeader className="px-0">
                    <CardTitle>Board starter</CardTitle>
                    <CardDescription>SQL-first auth and board starter with shared Zod contracts.</CardDescription>
                </CardHeader>
                <Button asChild>
                    <Link to="/posts">Open posts</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Contract boundaries</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        Web calls `/api` over HTTP and uses shared schemas to parse the envelope.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
