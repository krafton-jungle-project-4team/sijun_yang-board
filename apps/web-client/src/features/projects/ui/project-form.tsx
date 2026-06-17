import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectInputSchema, type CreateProjectInput, type UserOption } from "@nmm/shared";
import {
    Button,
    ButtonGroup,
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    Input,
    NativeSelect,
    NativeSelectOption,
    Textarea
} from "@nmm/ui/components";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { projectStatusLabels } from "@/features/projects/model/project-labels";

const projectStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "ARCHIVED"] as const;

type ProjectFormProps = {
    initialValue?: Partial<CreateProjectInput>;
    pending: boolean;
    submitLabel: string;
    users: UserOption[];
    onCancel?: () => void;
    onSubmit: (input: CreateProjectInput) => void | Promise<void>;
};

type ProjectFormValues = z.input<typeof createProjectInputSchema>;

export function ProjectForm({ initialValue, pending, submitLabel, users, onCancel, onSubmit }: ProjectFormProps) {
    const form = useForm<ProjectFormValues, unknown, CreateProjectInput>({
        defaultValues: {
            name: initialValue?.name ?? "",
            description: initialValue?.description ?? "",
            status: initialValue?.status ?? "PLANNED",
            ownerId: initialValue?.ownerId
        },
        resolver: zodResolver(createProjectInputSchema)
    });
    const ownerRegister = form.register("ownerId", {
        setValueAs: toOptionalNumber
    });

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit(values);
    });

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <Field data-invalid={Boolean(form.formState.errors.name)}>
                    <FieldLabel htmlFor="project-name">Name</FieldLabel>
                    <Input
                        id="project-name"
                        aria-invalid={Boolean(form.formState.errors.name)}
                        {...form.register("name")}
                    />
                    {form.formState.errors.name ? <FieldError>{form.formState.errors.name.message}</FieldError> : null}
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.description)}>
                    <FieldLabel htmlFor="project-description">Description</FieldLabel>
                    <Textarea
                        id="project-description"
                        aria-invalid={Boolean(form.formState.errors.description)}
                        {...form.register("description")}
                    />
                    {form.formState.errors.description ? (
                        <FieldError>{form.formState.errors.description.message}</FieldError>
                    ) : null}
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.status)}>
                    <FieldLabel htmlFor="project-status">Status</FieldLabel>
                    <NativeSelect
                        id="project-status"
                        aria-invalid={Boolean(form.formState.errors.status)}
                        {...form.register("status")}
                    >
                        {projectStatuses.map((status) => (
                            <NativeSelectOption key={status} value={status}>
                                {projectStatusLabels[status]}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                    {form.formState.errors.status ? (
                        <FieldError>{form.formState.errors.status.message}</FieldError>
                    ) : null}
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.ownerId)}>
                    <FieldLabel htmlFor="project-owner">Owner</FieldLabel>
                    <NativeSelect
                        id="project-owner"
                        aria-invalid={Boolean(form.formState.errors.ownerId)}
                        {...ownerRegister}
                    >
                        <NativeSelectOption value="">Creator</NativeSelectOption>
                        {users.map((user) => (
                            <NativeSelectOption key={user.id} value={String(user.id)}>
                                {user.displayName}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                    {form.formState.errors.ownerId ? (
                        <FieldError>{form.formState.errors.ownerId.message}</FieldError>
                    ) : null}
                </Field>
                <ButtonGroup className="self-end">
                    {onCancel ? (
                        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
                            Cancel
                        </Button>
                    ) : null}
                    <Button type="submit" disabled={pending}>
                        {pending ? "Saving..." : submitLabel}
                    </Button>
                </ButtonGroup>
            </FieldGroup>
        </form>
    );
}

function toOptionalNumber(value: unknown) {
    if (value === "" || value === null || value === undefined) {
        return undefined;
    }

    return Number(value);
}
