import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import { Link, useNavigate } from "@tanstack/react-router";
import { LogInIcon, UserPlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { useLoginMutation } from "../../features/auth/api/auth-queries";

export function LoginPage() {
    const navigate = useNavigate();
    const login = useLoginMutation();
    const loginForm = useForm<LoginInput>({
        defaultValues: {
            loginId: "",
            password: ""
        },
        resolver: zodResolver(loginInputSchema)
    });

    async function handleSubmit(input: LoginInput) {
        loginForm.clearErrors("root");

        try {
            await login.mutateAsync(input);
            loginForm.reset();
            await navigate({ to: "/me" });
        } catch {
            loginForm.setError("root", {
                message: "Invalid ID or password."
            });
        }
    }

    return (
        <Card className="mx-auto max-w-xl">
            <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>Use your ID and password.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={loginForm.handleSubmit(handleSubmit)}>
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
                            <LogInIcon data-icon="inline-start" />
                            Sign in
                        </Button>
                        <CardDescription>Try admin/admin or user/user.</CardDescription>
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline">
                    <Link to="/signup">
                        <UserPlusIcon data-icon="inline-start" />
                        Create account
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
