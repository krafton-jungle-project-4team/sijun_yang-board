import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input, Label } from "@nmm/ui/components";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { authApi } from "../../features/auth";

export function CompleteSignupPage() {
    const [displayName, setDisplayName] = useState("");
    const completeSignup = useMutation({
        mutationFn: authApi.completeSignup
    });

    function handleDisplayNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        setDisplayName(event.target.value);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await completeSignup.mutateAsync(displayName);
    }

    return (
        <div className="page-stack">
            <div className="page-heading">
                <h1>Complete signup</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="form-stack" onSubmit={handleSubmit}>
                        <Field>
                            <Label htmlFor="displayName">Display name</Label>
                            <Input id="displayName" value={displayName} onChange={handleDisplayNameChange} />
                        </Field>
                        <Button disabled={completeSignup.isPending} type="submit">
                            {completeSignup.isPending ? "Saving..." : "Complete"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
