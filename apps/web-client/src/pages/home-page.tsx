import { Button, Card, CardContent, CardHeader, CardTitle } from "@nmm/ui/components";
import { Link } from "@tanstack/react-router";

export function HomePage() {
    return (
        <div className="page-stack">
            <div className="page-heading">
                <div>
                    <h1>Board starter</h1>
                    <p>SQL-first auth and board starter with shared Zod contracts.</p>
                </div>
                <Button asChild>
                    <Link to="/posts">Open posts</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Contract boundaries</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="muted">Web calls `/api` over HTTP and uses shared schemas to parse the envelope.</p>
                </CardContent>
            </Card>
        </div>
    );
}
