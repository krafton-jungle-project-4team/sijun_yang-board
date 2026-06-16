import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Field,
    FieldError,
    FieldLabel,
    Input
} from "@nmm/ui/components";
import { useNavigate } from "@tanstack/react-router";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { needsSignup, useCurrentUserQuery, useLogoutMutation, useUpdateMeMutation } from "../../features/auth";

export function MePage() {
    const navigate = useNavigate();
    const meQuery = useCurrentUserQuery();
    const updateMe = useUpdateMeMutation();
    const logout = useLogoutMutation();
    const currentUser = meQuery.data;
    const [displayName, setDisplayName] = useState("");
    const [message, setMessage] = useState<string | null>(null);

    if (meQuery.isPending) {
        return <p className="muted">Loading account...</p>;
    }

    if (meQuery.isError) {
        return <p className="muted">Could not load account.</p>;
    }

    if (!currentUser) {
        return (
            <div className="page-stack">
                <Card>
                    <CardHeader>
                        <CardTitle>My account</CardTitle>
                        <CardDescription>
                            Use a seeded session cookie or bearer token to view this page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (needsSignup(currentUser)) {
        return (
            <div className="page-stack">
                <Card>
                    <CardHeader>
                        <CardTitle>Complete signup</CardTitle>
                        <CardDescription>Choose a display name before writing posts or comments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button type="button" onClick={handleCompleteSignupClick}>
                            Complete signup
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    function handleCompleteSignupClick() {
        void navigate({ to: "/auth/complete-signup" });
    }

    function handleDisplayNameChange(event: ChangeEvent<HTMLInputElement>) {
        setDisplayName(event.target.value);
        setMessage(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextDisplayName = displayName.trim();

        if (!nextDisplayName) {
            setMessage("Display name is required.");
            return;
        }

        await updateMe.mutateAsync(nextDisplayName);
        setMessage("Saved.");
        setDisplayName("");
    }

    async function handleLogoutClick() {
        await logout.mutateAsync();
        setMessage(null);
    }

    return (
        <div className="page-stack">
            <div className="page-heading">
                <h1>My account</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{currentUser.displayName}</CardTitle>
                    <CardDescription>{currentUser.email}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="form-stack">
                        <div className="button-row">
                            <Badge variant="secondary">{currentUser.role}</Badge>
                            <Badge variant="outline">{currentUser.status}</Badge>
                        </div>
                        <form className="form-stack" onSubmit={handleSubmit}>
                            <Field>
                                <FieldLabel htmlFor="displayName">Display name</FieldLabel>
                                <Input
                                    id="displayName"
                                    placeholder={currentUser.displayName}
                                    value={displayName}
                                    onChange={handleDisplayNameChange}
                                />
                                {message ? <FieldError>{message}</FieldError> : null}
                            </Field>
                            <div className="button-row justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={logout.isPending}
                                    onClick={handleLogoutClick}
                                >
                                    Logout
                                </Button>
                                <Button type="submit" disabled={updateMe.isPending || displayName.trim().length === 0}>
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
