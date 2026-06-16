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
import { type SignupInput, signupInputSchema } from "@nmm/shared";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogInIcon, UserPlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { useSignupMutation } from "../../features/auth/api/auth-queries";
import { ApiClientError } from "../../shared/api/http-client";

export function SignupPage() {
    const navigate = useNavigate();
    const signup = useSignupMutation();
    const signupForm = useForm<SignupInput>({
        defaultValues: {
            displayName: "",
            email: "",
            loginId: "",
            password: ""
        },
        resolver: zodResolver(signupInputSchema)
    });

    async function handleSubmit(input: SignupInput) {
        signupForm.clearErrors("root");

        try {
            await signup.mutateAsync(input);
            signupForm.reset();
            await navigate({ to: "/login" });
        } catch (error) {
            signupForm.setError("root", {
                message: getSignupErrorMessage(error)
            });
        }
    }

    return (
        <Card className="mx-auto max-w-xl">
            <CardHeader>
                <CardTitle>Create account</CardTitle>
                <CardDescription>Create an account, then sign in.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={signupForm.handleSubmit(handleSubmit)}>
                    <FieldGroup>
                        <Field data-invalid={Boolean(signupForm.formState.errors.loginId)}>
                            <FieldLabel htmlFor="signup-loginId">ID</FieldLabel>
                            <Input
                                id="signup-loginId"
                                autoComplete="username"
                                aria-invalid={Boolean(signupForm.formState.errors.loginId)}
                                {...signupForm.register("loginId")}
                            />
                            {signupForm.formState.errors.loginId ? (
                                <FieldError>{signupForm.formState.errors.loginId.message}</FieldError>
                            ) : null}
                        </Field>
                        <Field data-invalid={Boolean(signupForm.formState.errors.email)}>
                            <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                            <Input
                                id="signup-email"
                                type="email"
                                autoComplete="email"
                                aria-invalid={Boolean(signupForm.formState.errors.email)}
                                {...signupForm.register("email")}
                            />
                            {signupForm.formState.errors.email ? (
                                <FieldError>{signupForm.formState.errors.email.message}</FieldError>
                            ) : null}
                        </Field>
                        <Field data-invalid={Boolean(signupForm.formState.errors.displayName)}>
                            <FieldLabel htmlFor="signup-displayName">Display name</FieldLabel>
                            <Input
                                id="signup-displayName"
                                autoComplete="name"
                                aria-invalid={Boolean(signupForm.formState.errors.displayName)}
                                {...signupForm.register("displayName")}
                            />
                            {signupForm.formState.errors.displayName ? (
                                <FieldError>{signupForm.formState.errors.displayName.message}</FieldError>
                            ) : null}
                        </Field>
                        <Field data-invalid={Boolean(signupForm.formState.errors.password)}>
                            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                            <Input
                                id="signup-password"
                                type="password"
                                autoComplete="new-password"
                                aria-invalid={Boolean(signupForm.formState.errors.password)}
                                {...signupForm.register("password")}
                            />
                            {signupForm.formState.errors.password ? (
                                <FieldError>{signupForm.formState.errors.password.message}</FieldError>
                            ) : null}
                        </Field>
                        {signupForm.formState.errors.root ? (
                            <FieldError>{signupForm.formState.errors.root.message}</FieldError>
                        ) : null}
                        <Button type="submit" disabled={signup.isPending}>
                            <UserPlusIcon data-icon="inline-start" />
                            Create account
                        </Button>
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline">
                    <Link to="/login">
                        <LogInIcon data-icon="inline-start" />
                        Sign in
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function getSignupErrorMessage(error: unknown) {
    if (error instanceof ApiClientError && error.code === "ACCOUNT_ALREADY_EXISTS") {
        return "This ID or email is already in use.";
    }

    return "Could not create account.";
}
