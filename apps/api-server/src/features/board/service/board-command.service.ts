import type {
    CreateCommentInput,
    CreatePostInput,
    IdCommandResult,
    UpdateCommentInput,
    UpdatePostInput
} from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import type { AuthClaims } from "@/features/auth";
import { boardErrors } from "@/features/board/board-errors";
import { CommentDomain, PostDomain } from "@/features/board/domain";
import { CommentWriter, PostWriter } from "@/features/board/repository";

@Injectable()
export class BoardCommandService {
    constructor(
        private readonly postWriter: PostWriter,
        private readonly commentWriter: CommentWriter
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async createPost(auth: AuthClaims, input: CreatePostInput): Promise<IdCommandResult> {
        const id = await this.postWriter.create(auth.userId, input);

        return { id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async updatePost(auth: AuthClaims, postId: number, input: UpdatePostInput): Promise<IdCommandResult> {
        const result = await this.postWriter.update({
            postId,
            input,
            actorId: auth.userId,
            actorRole: auth.role
        });

        if (!result) {
            throw boardErrors.postNotFound();
        }

        if (!PostDomain.canMutate(result.post, auth) || !result.changedId) {
            throw boardErrors.mutationForbidden();
        }

        return { id: result.changedId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async deletePost(auth: AuthClaims, postId: number): Promise<IdCommandResult> {
        const result = await this.postWriter.delete({
            postId,
            actorId: auth.userId,
            actorRole: auth.role
        });

        if (!result) {
            throw boardErrors.postNotFound();
        }

        if (!PostDomain.canMutate(result.post, auth) || !result.changedId) {
            throw boardErrors.mutationForbidden();
        }

        return { id: result.changedId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async createComment(auth: AuthClaims, postId: number, input: CreateCommentInput): Promise<IdCommandResult> {
        const comment = await this.commentWriter.create(auth.userId, postId, input);

        if (!comment) {
            throw boardErrors.postNotFound();
        }

        return { id: comment.id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async updateComment(auth: AuthClaims, commentId: number, input: UpdateCommentInput): Promise<IdCommandResult> {
        const result = await this.commentWriter.update({
            commentId,
            input,
            actorId: auth.userId,
            actorRole: auth.role
        });

        if (!result) {
            throw boardErrors.commentNotFound();
        }

        if (!CommentDomain.canMutate(result.comment, auth) || !result.changedId) {
            throw boardErrors.mutationForbidden();
        }

        return { id: result.changedId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async deleteComment(auth: AuthClaims, commentId: number): Promise<IdCommandResult> {
        const result = await this.commentWriter.delete({
            commentId,
            actorId: auth.userId,
            actorRole: auth.role
        });

        if (!result) {
            throw boardErrors.commentNotFound();
        }

        if (!CommentDomain.canMutate(result.comment, auth) || !result.changedId) {
            throw boardErrors.mutationForbidden();
        }

        return { id: result.changedId };
    }
}
