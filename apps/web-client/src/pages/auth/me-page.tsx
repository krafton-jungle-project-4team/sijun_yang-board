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
import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginInput, loginInputSchema } from "@nmm/shared";
import { useNavigate } from "@tanstack/react-router";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { useForm } from "react-hook-form";

import {
    useCurrentUserQuery,
    useLoginMutation,
    useLogoutMutation,
    useUpdateMeMutation
} from "../../features/auth/api/auth-queries";
import { needsSignup } from "../../features/auth/model/user-status";

export function MePage() {
    const navigate = useNavigate();
    const meQuery = useCurrentUserQuery();
    const login = useLoginMutation();
    const updateMe = useUpdateMeMutation();
    const logout = useLogoutMutation();
    const currentUser = meQuery.data;
    const [displayName, setDisplayName] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const loginForm = useForm<LoginInput>({
        defaultValues: {
            loginId: "",
            password: ""
        },
        resolver: zodResolver(loginInputSchema)
    });

    if (meQuery.isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My account</CardTitle>
                    <CardDescription>Loading account...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (meQuery.isError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My account</CardTitle>
                    <CardDescription>Could not load account.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!currentUser) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My account</CardTitle>
                    <CardDescription>Sign in with your ID and password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                        <FieldGroup>
                            <Field data-invalid={Boolean(loginForm.formState.errors.loginId)}>
                                <FieldLabel htmlFor="loginId">ID</FieldLabel>
                                <Input
                                    id="loginId"
                                    autoComplete="username"
                                    aria-invalid={Boolean(loginForm.formState.errors.loginId)}
                                    {...loginForm.register("loginId")}
                                />
                                {loginForm.formState.errors.loginId ? (
                                    <FieldError>{loginForm.formState.errors.loginId.message}</FieldError>
                                ) : null}
                            </Field>
                            <Field data-invalid={Boolean(loginForm.formState.errors.password)}>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    aria-invalid={Boolean(loginForm.formState.errors.password)}
                                    {...loginForm.register("password")}
                                />
                                {loginForm.formState.errors.password ? (
                                    <FieldError>{loginForm.formState.errors.password.message}</FieldError>
                                ) : null}
                            </Field>
                            {loginForm.formState.errors.root ? (
                                <FieldError>{loginForm.formState.errors.root.message}</FieldError>
                            ) : null}
                            <Button type="submit" disabled={login.isPending}>
                                Sign in
                            </Button>
                            <CardDescription>Try admin/admin or user/user.</CardDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        );
    }

    if (needsSignup(currentUser)) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Complete signup</CardTitle>
                    <CardDescription>Set a display name before posting.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button type="button" onClick={handleCompleteSignupClick}>
                        Complete signup
                    </Button>
                </CardContent>
            </Card>
        );
    }

    function handleCompleteSignupClick() {
        void navigate({ to: "/auth/complete-signup" });
    }

    async function handleLoginSubmit(input: LoginInput) {
        loginForm.clearErrors("root");

        try {
            await login.mutateAsync(input);
            loginForm.reset();
        } catch {
            loginForm.setError("root", {
                message: "Invalid ID or password."
            });
        }
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
