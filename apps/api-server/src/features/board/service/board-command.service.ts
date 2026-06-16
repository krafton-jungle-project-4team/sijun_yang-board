import type {
    AuthClaims,
    CreateCommentInput,
    CreatePostInput,
    IdCommandResult,
    UpdateCommentInput,
    UpdatePostInput
} from "@nmm/shared";
import { InjectTransaction, Transactional, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { boardMutationForbiddenError, commentNotFoundError, postNotFoundError } from "../board-errors";
import {
    createComment,
    createPost,
    deleteComment,
    deletePost,
    updateComment,
    updatePost
} from "../database/__generated__/board.queries";

@Injectable()
export class BoardCommandService {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async createPost(auth: AuthClaims, input: CreatePostInput): Promise<IdCommandResult> {
        const post = await this.db
            .query(createPost, {
                title: input.title,
                content: input.content,
                authorId: auth.userId
            })
            .single();

        return { id: post.id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async updatePost(auth: AuthClaims, postId: number, input: UpdatePostInput): Promise<IdCommandResult> {
        const post = await this.db
            .query(updatePost, {
                postId,
                title: input.title ?? null,
                content: input.content ?? null,
                actorId: auth.userId,
                actorRole: auth.role
            })
            .singleOrNull();

        if (!post) {
            throw postNotFoundError();
        }

        if (!post.updatedId) {
            throw boardMutationForbiddenError();
        }

        return { id: post.updatedId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async deletePost(auth: AuthClaims, postId: number): Promise<IdCommandResult> {
        const post = await this.db
            .query(deletePost, {
                postId,
                actorId: auth.userId,
                actorRole: auth.role
            })
            .singleOrNull();

        if (!post) {
            throw postNotFoundError();
        }

        if (!post.deletedId) {
            throw boardMutationForbiddenError();
        }

        return { id: post.deletedId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async createComment(auth: AuthClaims, postId: number, input: CreateCommentInput): Promise<IdCommandResult> {
        const comment = await this.db
            .query(createComment, {
                postId,
                authorId: auth.userId,
                content: input.content
            })
            .singleOrNull();

        if (!comment) {
            throw postNotFoundError();
        }

        return { id: comment.commentId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async updateComment(auth: AuthClaims, commentId: number, input: UpdateCommentInput): Promise<IdCommandResult> {
        const comment = await this.db
            .query(updateComment, {
                commentId,
                content: input.content,
                actorId: auth.userId,
                actorRole: auth.role
            })
            .singleOrNull();

        if (!comment) {
            throw commentNotFoundError();
        }

        if (!comment.updatedId) {
            throw boardMutationForbiddenError();
        }

        return { id: comment.updatedId };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async deleteComment(auth: AuthClaims, commentId: number): Promise<IdCommandResult> {
        const comment = await this.db
            .query(deleteComment, {
                commentId,
                actorId: auth.userId,
                actorRole: auth.role
            })
            .singleOrNull();

        if (!comment) {
            throw commentNotFoundError();
        }

        if (!comment.deletedId) {
            throw boardMutationForbiddenError();
        }

        return { id: comment.deletedId };
    }
}
