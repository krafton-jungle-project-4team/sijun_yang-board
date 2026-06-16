import { zodResolver } from "@hookform/resolvers/zod";
import { createPostInputSchema, type CreatePostInput } from "@nmm/shared";
import { Button, ButtonGroup, Field, FieldError, FieldGroup, FieldLabel, Input, Textarea } from "@nmm/ui/components";
import { useForm } from "react-hook-form";

type PostFormProps = {
    initialValue?: Partial<CreatePostInput>;
    pending: boolean;
    submitLabel: string;
    onCancel?: () => void;
    onSubmit: (input: CreatePostInput) => void | Promise<void>;
};

export function PostForm({ initialValue, pending, submitLabel, onCancel, onSubmit }: PostFormProps) {
    const form = useForm<CreatePostInput>({
        defaultValues: {
            title: initialValue?.title ?? "",
            content: initialValue?.content ?? ""
        },
        resolver: zodResolver(createPostInputSchema)
    });

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit(values);
    });

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input id="title" {...form.register("title")} />
                    {form.formState.errors.title ? (
                        <FieldError>{form.formState.errors.title.message}</FieldError>
                    ) : null}
                </Field>
                <Field>
                    <FieldLabel htmlFor="content">Content</FieldLabel>
                    <Textarea id="content" {...form.register("content")} />
                    {form.formState.errors.content ? (
                        <FieldError>{form.formState.errors.content.message}</FieldError>
                    ) : null}
                </Field>
                <ButtonGroup className="self-end">
                    {onCancel ? (
                        <Button disabled={pending} type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    ) : null}
                    <Button disabled={pending} type="submit">
                        {pending ? "Saving..." : submitLabel}
                    </Button>
                </ButtonGroup>
            </FieldGroup>
        </form>
    );
}
