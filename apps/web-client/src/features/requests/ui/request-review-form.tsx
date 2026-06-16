import { zodResolver } from "@hookform/resolvers/zod";
import { reviewApprovalRequestInputSchema, type ReviewApprovalRequestInput } from "@nmm/shared";
import { Button, ButtonGroup, Field, FieldError, FieldGroup, FieldLabel, Textarea } from "@nmm/ui/components";
import { Check, X } from "lucide-react";
import { useForm } from "react-hook-form";

type RequestReviewFormProps = {
    pending: boolean;
    onApprove: (input: ReviewApprovalRequestInput) => void | Promise<void>;
    onReject: (input: ReviewApprovalRequestInput) => void | Promise<void>;
};

export function RequestReviewForm({ pending, onApprove, onReject }: RequestReviewFormProps) {
    const form = useForm<ReviewApprovalRequestInput>({
        defaultValues: {
            reviewComment: ""
        },
        resolver: zodResolver(reviewApprovalRequestInputSchema)
    });

    const handleApproveClick = form.handleSubmit(async (values) => {
        await onApprove(values);
    });
    const handleRejectClick = form.handleSubmit(async (values) => {
        await onReject(values);
    });

    return (
        <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.reviewComment)}>
                <FieldLabel htmlFor="review-comment">Review comment</FieldLabel>
                <Textarea
                    id="review-comment"
                    aria-invalid={Boolean(form.formState.errors.reviewComment)}
                    {...form.register("reviewComment")}
                />
                {form.formState.errors.reviewComment ? (
                    <FieldError>{form.formState.errors.reviewComment.message}</FieldError>
                ) : null}
            </Field>
            <ButtonGroup className="self-end">
                <Button type="button" variant="outline" disabled={pending} onClick={handleRejectClick}>
                    <X />
                    Reject
                </Button>
                <Button type="button" disabled={pending} onClick={handleApproveClick}>
                    <Check />
                    Approve
                </Button>
            </ButtonGroup>
        </FieldGroup>
    );
}
