import { Card, CardContent, CardHeader, CardTitle } from "@nmm/ui/components";
import { useQuery } from "@tanstack/react-query";

import { authApi } from "../../features/auth";

export function MePage() {
    const meQuery = useQuery({
        queryKey: ["account", "me"],
        queryFn: authApi.getMe
    });

    if (meQuery.isPending) {
        return <p className="muted">Loading account...</p>;
    }

    if (meQuery.isError) {
        return <p className="muted">Sign in with a seeded session token to view this page.</p>;
    }

    return (
        <div className="page-stack">
            <div className="page-heading">
                <h1>My account</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{meQuery.data.displayName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{meQuery.data.email}</p>
                    <p className="muted">
                        {meQuery.data.role} · {meQuery.data.status}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
