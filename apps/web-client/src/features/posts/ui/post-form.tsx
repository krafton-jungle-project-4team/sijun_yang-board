import { zodResolver } from "@hookform/resolvers/zod";
import type { CreatePostInput, Tag } from "@nmm/shared";
import {
    Button,
    ButtonGroup,
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    Input,
    Textarea,
    ToggleGroup,
    ToggleGroupItem
} from "@nmm/ui/components";
import { useForm } from "react-hook-form";
import { z } from "zod";

type PostFormValues = {
    title: string;
    content: string;
    tagsText: string;
};

type PostFormProps = {
    availableTags?: Tag[];
    initialValue?: Partial<CreatePostInput>;
    pending: boolean;
    submitLabel: string;
    onCancel?: () => void;
    onSubmit: (input: CreatePostInput) => void | Promise<void>;
};

const postFormSchema = z.object({
    title: z.string().trim().min(1).max(120),
    content: z.string().trim().min(1).max(10000),
    tagsText: z.string().refine((value) => parseTagsText(value).length <= 5, "Up to 5 tags are allowed.")
});

export function PostForm({
    availableTags = [],
    initialValue,
    pending,
    submitLabel,
    onCancel,
    onSubmit
}: PostFormProps) {
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
            tags: parseTagsText(values.tagsText)
        });
    });
    const selectedTags = parseTagsText(form.watch("tagsText"));

    function handleTagSuggestionsChange(nextTags: string[]) {
        form.setValue("tagsText", nextTags.join(", "), {
            shouldDirty: true,
            shouldValidate: true
        });
    }

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
                <Field>
                    <FieldLabel htmlFor="tagsText">Tags</FieldLabel>
                    <Input id="tagsText" placeholder="notice, intro" {...form.register("tagsText")} />
                    {form.formState.errors.tagsText ? (
                        <FieldError>{form.formState.errors.tagsText.message}</FieldError>
                    ) : null}
                </Field>
                <PostTagSuggestions
                    availableTags={availableTags}
                    disabled={pending}
                    selectedTags={selectedTags}
                    onValueChange={handleTagSuggestionsChange}
                />
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

type PostTagSuggestionsProps = {
    availableTags: Tag[];
    disabled: boolean;
    selectedTags: string[];
    onValueChange: (tagNames: string[]) => void;
};

function PostTagSuggestions({ availableTags, disabled, selectedTags, onValueChange }: PostTagSuggestionsProps) {
    if (availableTags.length === 0) {
        return null;
    }

    return (
        <ToggleGroup type="multiple" className="flex-wrap" value={selectedTags} onValueChange={onValueChange}>
            {availableTags.map((tag) => (
                <ToggleGroupItem key={tag.id} value={tag.name} variant="outline" disabled={disabled}>
                    {tag.name}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}

function parseTagsText(value: string) {
    return [
        ...new Set(
            value
                .split(",")
                .map((tag) => tag.trim().toLowerCase())
                .filter(Boolean)
        )
    ];
}
