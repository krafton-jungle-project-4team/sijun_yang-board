import { zodResolver } from "@hookform/resolvers/zod";
import type { CreatePostInput } from "@nmm/shared";
import { Button, Field, FieldError, Input, Label, Textarea } from "@nmm/ui/components";
import { useForm } from "react-hook-form";
import { z } from "zod";

type PostFormValues = {
    title: string;
    content: string;
    tagsText: string;
};

type PostFormProps = {
    initialValue?: Partial<CreatePostInput>;
    pending: boolean;
    submitLabel: string;
    onSubmit: (input: CreatePostInput) => void | Promise<void>;
};

const postFormSchema = z.object({
    title: z.string().trim().min(1).max(120),
    content: z.string().trim().min(1).max(10000),
    tagsText: z.string()
});

export function PostForm({ initialValue, pending, submitLabel, onSubmit }: PostFormProps) {
    const form = useForm<PostFormValues>({
        defaultValues: {
            title: initialValue?.title ?? "",
            content: initialValue?.content ?? "",
            tagsText: initialValue?.tags?.join(", ") ?? ""
        },
        resolver: zodResolver(postFormSchema)
    });

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit({
            title: values.title,
            content: values.content,
            tags: values.tagsText
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
        });
    });

    return (
        <form className="form-stack" onSubmit={handleSubmit}>
            <Field>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title ? <FieldError>{form.formState.errors.title.message}</FieldError> : null}
            </Field>
            <Field>
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" {...form.register("content")} />
                {form.formState.errors.content ? (
                    <FieldError>{form.formState.errors.content.message}</FieldError>
                ) : null}
            </Field>
            <Field>
                <Label htmlFor="tagsText">Tags</Label>
                <Input id="tagsText" placeholder="notice, intro" {...form.register("tagsText")} />
            </Field>
            <div className="button-row">
                <Button disabled={pending} type="submit">
                    {pending ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
