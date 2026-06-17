import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentInputSchema, type Comment, type CreateCommentInput, type User } from "@nmm/shared";
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
    Separator,
    Textarea
} from "@nmm/ui/components";
import { Check, Pencil, Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useController, useForm, type Control, type UseFormSetError } from "react-hook-form";

import {
    useCreateComment,
    useDeleteComment,
    useSuspenseComments,
    useUpdateComment
} from "@/features/posts/hooks/use-posts";
import { isSignedInUser } from "@/features/auth/model/current-user";
import { canManageComment } from "@/features/posts/model/post-permissions";

type PostCommentsProps = {
    currentUser: User | null | undefined;
    postId: number;
};

const EMPTY_COMMENTS: Comment[] = [];
const commentDateFormatter = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
});

export function PostComments({ currentUser, postId }: PostCommentsProps) {
    const comments = useSuspenseComments(postId).data ?? EMPTY_COMMENTS;

    return (
        <section className="grid gap-4">
            <Separator />
            <CardHeader className="px-0">
                <CardTitle>Comments</CardTitle>
                <Badge variant="secondary">{comments.length}</Badge>
            </CardHeader>

            <CommentComposer currentUser={currentUser} postId={postId} />

            <div className="grid gap-4">
                {comments.map((comment) => (
                    <PostCommentItem key={comment.id} comment={comment} currentUser={currentUser} postId={postId} />
                ))}
                {comments.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardDescription>No comments yet.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : null}
            </div>
        </section>
    );
}

function CommentComposer({ currentUser, postId }: PostCommentsProps) {
    const form = useForm<CreateCommentInput>({
        resolver: zodResolver(createCommentInputSchema),
        defaultValues: {
            content: ""
        },
        mode: "onChange"
    });
    const contentValue = form.watch("content");
    const createComment = useCreateComment(postId);
    const canCreateComment = isSignedInUser(currentUser);

    function handleSubmit(values: CreateCommentInput) {
        const data = toTrimmedCommentData(values, form.setError);

        if (!data) {
            return;
        }

        createComment.mutate(data, {
            onSuccess: handleCreateCommentSuccess
        });
    }

    function handleCreateCommentSuccess() {
        form.reset();
    }

    if (currentUser === undefined) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Checking account...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!canCreateComment) {
        return (
            <Card>
                <CardHeader>
                    <CardDescription>Sign in to comment.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
                <CommentContentField
                    control={form.control}
                    id="comment-content"
                    label="Comment"
                    placeholder="Comment"
                    disabled={createComment.isPending}
                />
                <ButtonGroup className="self-end">
                    <Button type="submit" disabled={createComment.isPending || contentValue.trim().length === 0}>
                        <Send />
                        Add
                    </Button>
                </ButtonGroup>
            </FieldGroup>
        </form>
    );
}

type PostCommentItemProps = {
    comment: Comment;
    currentUser: User | null | undefined;
    postId: number;
};

function PostCommentItem({ comment, currentUser, postId }: PostCommentItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const updateComment = useUpdateComment(postId, comment.id);
    const deleteComment = useDeleteComment(postId, comment.id);
    const canManageCurrentComment = canManageComment(currentUser, comment);

    function handleEditClick() {
        setIsEditing(true);
    }

    function handleCancelClick() {
        setIsEditing(false);
    }

    function handleUpdateSubmit(values: CreateCommentInput) {
        updateComment.mutate(values, {
            onSuccess: handleCommentMutationSuccess
        });
    }

    function handleDeleteClick() {
        deleteComment.mutate();
    }

    function handleCommentMutationSuccess() {
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <PostCommentEditForm
                comment={comment}
                isPending={updateComment.isPending}
                onCancel={handleCancelClick}
                onSubmit={handleUpdateSubmit}
            />
        );
    }

    return (
        <Card className="gap-0 py-0">
            <CardContent className="grid gap-2 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="grid gap-1">
                        <span className="text-sm font-medium">{comment.authorName}</span>
                        <Badge variant="outline">{formatCommentDate(comment.createdAt)}</Badge>
                    </div>
                    {canManageCurrentComment ? (
                        <ButtonGroup>
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Edit comment"
                                onClick={handleEditClick}
                            >
                                <Pencil />
                            </Button>
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Delete comment"
                                disabled={deleteComment.isPending}
                                onClick={handleDeleteClick}
                            >
                                <Trash2 />
                            </Button>
                        </ButtonGroup>
                    ) : null}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6">{comment.content}</p>
            </CardContent>
        </Card>
    );
}

type PostCommentEditFormProps = {
    comment: Comment;
    isPending: boolean;
    onCancel: () => void;
    onSubmit: (values: CreateCommentInput) => void;
};

function PostCommentEditForm({ comment, isPending, onCancel, onSubmit }: PostCommentEditFormProps) {
    const form = useForm<CreateCommentInput>({
        resolver: zodResolver(createCommentInputSchema),
        defaultValues: {
            content: comment.content
        },
        mode: "onChange"
    });
    const contentValue = form.watch("content");

    function handleSubmit(values: CreateCommentInput) {
        const data = toTrimmedCommentData(values, form.setError);

        if (!data) {
            return;
        }

        onSubmit(data);
    }

    return (
        <Card className="gap-0 py-0">
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CardContent className="p-3">
                    <FieldGroup>
                        <CommentContentField
                            control={form.control}
                            id="comment-edit-content"
                            label="Edit comment"
                            disabled={isPending}
                        />
                        <ButtonGroup className="self-end">
                            <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
                                <X />
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending || contentValue.trim().length === 0}>
                                <Check />
                                Save
                            </Button>
                        </ButtonGroup>
                    </FieldGroup>
                </CardContent>
            </form>
        </Card>
    );
}

type CommentContentFieldProps = {
    control: Control<CreateCommentInput>;
    id: string;
    label: string;
    disabled: boolean;
    placeholder?: string;
};

function CommentContentField({ control, id, label, disabled, placeholder }: CommentContentFieldProps) {
    const { field, fieldState } = useController({
        control,
        name: "content"
    });

    return (
        <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id} className="sr-only">
                {label}
            </FieldLabel>
            <Textarea
                {...field}
                id={id}
                required
                minLength={1}
                placeholder={placeholder}
                aria-invalid={fieldState.invalid}
                disabled={disabled}
            />
            {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
        </Field>
    );
}

function toTrimmedCommentData(
    values: CreateCommentInput,
    setError: UseFormSetError<CreateCommentInput>
): CreateCommentInput | null {
    const content = values.content.trim();

    if (!content) {
        setError("content", {
            type: "manual",
            message: "Comment is required."
        });
        return null;
    }

    return { content };
}

function formatCommentDate(value: string) {
    return commentDateFormatter.format(new Date(value));
}
