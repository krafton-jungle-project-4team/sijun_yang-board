import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskInputSchema, type CreateTaskInput, type UserOption } from "@nmm/shared";
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

import { taskPriorityLabels, taskStatusLabels } from "@/features/projects/model/project-labels";

const taskStatuses = ["TODO", "IN_PROGRESS", "DONE"] as const;
const taskPriorities = ["LOW", "MEDIUM", "HIGH"] as const;

type TaskFormProps = {
    pending: boolean;
    users: UserOption[];
    onSubmit: (input: CreateTaskInput) => void | Promise<void>;
};

type TaskFormValues = z.input<typeof createTaskInputSchema>;

export function TaskForm({ pending, users, onSubmit }: TaskFormProps) {
    const form = useForm<TaskFormValues, unknown, CreateTaskInput>({
        defaultValues: {
            title: "",
            description: "",
            status: "TODO",
            priority: "MEDIUM"
        },
        resolver: zodResolver(createTaskInputSchema)
    });
    const assigneeRegister = form.register("assigneeId", {
        setValueAs: toOptionalNumber
    });

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit(values);
        form.reset();
    });

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <Field data-invalid={Boolean(form.formState.errors.title)}>
                    <FieldLabel htmlFor="task-title">Task</FieldLabel>
                    <Input
                        id="task-title"
                        aria-invalid={Boolean(form.formState.errors.title)}
                        {...form.register("title")}
                    />
                    {form.formState.errors.title ? (
                        <FieldError>{form.formState.errors.title.message}</FieldError>
                    ) : null}
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.description)}>
                    <FieldLabel htmlFor="task-description">Description</FieldLabel>
                    <Textarea
                        id="task-description"
                        aria-invalid={Boolean(form.formState.errors.description)}
                        {...form.register("description")}
                    />
                    {form.formState.errors.description ? (
                        <FieldError>{form.formState.errors.description.message}</FieldError>
                    ) : null}
                </Field>
                <div className="grid gap-3 md:grid-cols-3">
                    <Field data-invalid={Boolean(form.formState.errors.status)}>
                        <FieldLabel htmlFor="task-status">Status</FieldLabel>
                        <NativeSelect
                            id="task-status"
                            aria-invalid={Boolean(form.formState.errors.status)}
                            {...form.register("status")}
                        >
                            {taskStatuses.map((status) => (
                                <NativeSelectOption key={status} value={status}>
                                    {taskStatusLabels[status]}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                        {form.formState.errors.status ? (
                            <FieldError>{form.formState.errors.status.message}</FieldError>
                        ) : null}
                    </Field>
                    <Field data-invalid={Boolean(form.formState.errors.priority)}>
                        <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
                        <NativeSelect
                            id="task-priority"
                            aria-invalid={Boolean(form.formState.errors.priority)}
                            {...form.register("priority")}
                        >
                            {taskPriorities.map((priority) => (
                                <NativeSelectOption key={priority} value={priority}>
                                    {taskPriorityLabels[priority]}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                        {form.formState.errors.priority ? (
                            <FieldError>{form.formState.errors.priority.message}</FieldError>
                        ) : null}
                    </Field>
                    <Field data-invalid={Boolean(form.formState.errors.assigneeId)}>
                        <FieldLabel htmlFor="task-assignee">Assignee</FieldLabel>
                        <NativeSelect
                            id="task-assignee"
                            aria-invalid={Boolean(form.formState.errors.assigneeId)}
                            {...assigneeRegister}
                        >
                            <NativeSelectOption value="">Unassigned</NativeSelectOption>
                            {users.map((user) => (
                                <NativeSelectOption key={user.id} value={String(user.id)}>
                                    {user.displayName}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                        {form.formState.errors.assigneeId ? (
                            <FieldError>{form.formState.errors.assigneeId.message}</FieldError>
                        ) : null}
                    </Field>
                </div>
                <ButtonGroup className="self-end">
                    <Button type="submit" disabled={pending}>
                        {pending ? "Saving..." : "Add task"}
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
