import {
    Badge,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    Input
} from "@nmm/ui/components";
import { Navigate } from "@tanstack/react-router";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { useLogoutMutation, useSuspenseCurrentUserQuery, useUpdateMeMutation } from "@/features/auth/api/auth-queries";

export function MePage() {
    const currentUser = useSuspenseCurrentUserQuery().data;
    const updateMe = useUpdateMeMutation();
    const logout = useLogoutMutation();
    const [displayName, setDisplayName] = useState("");
    const [message, setMessage] = useState<string | null>(null);

    if (!currentUser) {
        return <Navigate to="/login" replace />;
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
        <div className="grid gap-5">
            <CardHeader className="px-0">
                <CardTitle>My account</CardTitle>
            </CardHeader>
            <Card>
                <CardHeader>
                    <CardTitle>{currentUser.displayName}</CardTitle>
                    <CardDescription>{currentUser.email}</CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <ButtonGroup>
                            <Badge variant="secondary">{currentUser.role}</Badge>
                            <Badge variant="outline">{currentUser.status}</Badge>
                        </ButtonGroup>
                        <form onSubmit={handleSubmit}>
                            <FieldGroup>
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
                                <ButtonGroup className="self-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={logout.isPending}
                                        onClick={handleLogoutClick}
                                    >
                                        Logout
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={updateMe.isPending || displayName.trim().length === 0}
                                    >
                                        Save
                                    </Button>
                                </ButtonGroup>
                            </FieldGroup>
                        </form>
                    </FieldGroup>
                </CardContent>
            </Card>
        </div>
    );
}
