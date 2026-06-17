import type { CreateCommentInput, UpdateCommentInput } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { createComment, deleteComment, updateComment } from "@/features/board/database/__generated__/board.queries";
import type { CommentMutationResult } from "@/features/board/domain";

@Injectable()
export class CommentWriter {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async create(authorId: number, postId: number, input: CreateCommentInput): Promise<{ id: number } | null> {
        const comment = await this.db
            .query(createComment, {
                postId,
                authorId,
                content: input.content
            })
            .singleOrNull();

        return comment?.commentId ? { id: comment.commentId } : null;
    }

    async update(params: {
        commentId: number;
        input: UpdateCommentInput;
        actorId: number;
        actorRole: string;
    }): Promise<CommentMutationResult | null> {
        const comment = await this.db
            .query(updateComment, {
                commentId: params.commentId,
                content: params.input.content,
                actorId: params.actorId,
                actorRole: params.actorRole
            })
            .singleOrNull();

        return comment
            ? {
                  comment: { id: comment.id, authorId: comment.authorId },
                  changedId: comment.updatedId
              }
            : null;
    }

    async delete(params: {
        commentId: number;
        actorId: number;
        actorRole: string;
    }): Promise<CommentMutationResult | null> {
        const comment = await this.db
            .query(deleteComment, {
                commentId: params.commentId,
                actorId: params.actorId,
                actorRole: params.actorRole
            })
            .singleOrNull();

        return comment
            ? {
                  comment: { id: comment.id, authorId: comment.authorId },
                  changedId: comment.deletedId
              }
            : null;
    }
}
