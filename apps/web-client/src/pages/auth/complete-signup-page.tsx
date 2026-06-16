import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Field,
    FieldError,
    FieldLabel,
    Input
} from "@nmm/ui/components";
import { useNavigate } from "@tanstack/react-router";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { useCompleteSignupMutation } from "../../features/auth";

export function CompleteSignupPage() {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const completeSignup = useCompleteSignupMutation();

    function handleDisplayNameChange(event: ChangeEvent<HTMLInputElement>) {
        setDisplayName(event.target.value);
        setError(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextDisplayName = displayName.trim();

        if (!nextDisplayName) {
            setError("Display name is required.");
            return;
        }

        await completeSignup.mutateAsync(nextDisplayName);
        await navigate({ to: "/me" });
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
                            <FieldLabel htmlFor="displayName">Display name</FieldLabel>
                            <Input id="displayName" value={displayName} onChange={handleDisplayNameChange} />
                            {error ? <FieldError>{error}</FieldError> : null}
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
