import { zodResolver } from "@hookform/resolvers/zod";
import type { CreatePostInput, Tag } from "@nmm/shared";
import { Button, Field, FieldError, FieldGroup, FieldLabel, Input, Textarea } from "@nmm/ui/components";
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

    function handleTagToggle(tagName: string) {
        const nextTags = selectedTags.includes(tagName)
            ? selectedTags.filter((selectedTag) => selectedTag !== tagName)
            : [...selectedTags, tagName];

        form.setValue("tagsText", nextTags.join(", "), {
            shouldDirty: true,
            shouldValidate: true
        });
    }

    return (
        <form className="form-stack" onSubmit={handleSubmit}>
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
                    onToggle={handleTagToggle}
                />
            </FieldGroup>
            <div className="button-row justify-end">
                {onCancel ? (
                    <Button disabled={pending} type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                ) : null}
                <Button disabled={pending} type="submit">
                    {pending ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}

type PostTagSuggestionsProps = {
    availableTags: Tag[];
    disabled: boolean;
    selectedTags: string[];
    onToggle: (tagName: string) => void;
};

function PostTagSuggestions({ availableTags, disabled, selectedTags, onToggle }: PostTagSuggestionsProps) {
    if (availableTags.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
                <PostTagToggle
                    key={tag.id}
                    disabled={disabled}
                    isSelected={selectedTags.includes(tag.name)}
                    tag={tag}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
}

type PostTagToggleProps = {
    disabled: boolean;
    isSelected: boolean;
    tag: Tag;
    onToggle: (tagName: string) => void;
};

function PostTagToggle({ disabled, isSelected, tag, onToggle }: PostTagToggleProps) {
    function handleClick() {
        onToggle(tag.name);
    }

    return (
        <Button
            type="button"
            size="sm"
            variant={isSelected ? "secondary" : "outline"}
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={handleClick}
        >
            {tag.name}
        </Button>
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
