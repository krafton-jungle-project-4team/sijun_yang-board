import { zodResolver } from "@hookform/resolvers/zod";
import { createApprovalRequestInputSchema, type CreateApprovalRequestInput, type ProjectSummary } from "@nmm/shared";
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

type RequestFormProps = {
    pending: boolean;
    projects: ProjectSummary[];
    onCancel?: () => void;
    onSubmit: (input: CreateApprovalRequestInput) => void | Promise<void>;
};

export function RequestForm({ pending, projects, onCancel, onSubmit }: RequestFormProps) {
    const form = useForm<CreateApprovalRequestInput>({
        defaultValues: {
            projectId: projects[0]?.id,
            title: "",
            description: ""
        },
        resolver: zodResolver(createApprovalRequestInputSchema)
    });
    const projectRegister = form.register("projectId", {
        setValueAs: Number
    });

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit(values);
    });

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <Field data-invalid={Boolean(form.formState.errors.projectId)}>
                    <FieldLabel htmlFor="request-project">Project</FieldLabel>
                    <NativeSelect
                        id="request-project"
                        aria-invalid={Boolean(form.formState.errors.projectId)}
                        {...projectRegister}
                    >
                        {projects.map((project) => (
                            <NativeSelectOption key={project.id} value={String(project.id)}>
                                {project.name}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                    {form.formState.errors.projectId ? (
                        <FieldError>{form.formState.errors.projectId.message}</FieldError>
                    ) : null}
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.title)}>
                    <FieldLabel htmlFor="request-title">Title</FieldLabel>
                    <Input
                        id="request-title"
                        aria-invalid={Boolean(form.formState.errors.title)}
                        {...form.register("title")}
                    />
                    {form.formState.errors.title ? (
                        <FieldError>{form.formState.errors.title.message}</FieldError>
                    ) : null}
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.description)}>
                    <FieldLabel htmlFor="request-description">Description</FieldLabel>
                    <Textarea
                        id="request-description"
                        aria-invalid={Boolean(form.formState.errors.description)}
                        {...form.register("description")}
                    />
                    {form.formState.errors.description ? (
                        <FieldError>{form.formState.errors.description.message}</FieldError>
                    ) : null}
                </Field>
                <ButtonGroup className="self-end">
                    {onCancel ? (
                        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
                            Cancel
                        </Button>
                    ) : null}
                    <Button type="submit" disabled={pending || projects.length === 0}>
                        {pending ? "Submitting..." : "Submit request"}
                    </Button>
                </ButtonGroup>
            </FieldGroup>
        </form>
    );
}
