import type { CreatePostInput, UpdatePostInput } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import {
    createPost,
    deletePost,
    incrementPostView,
    updatePost
} from "@/features/board/database/__generated__/board.queries";
import type { PostMutationResult } from "@/features/board/domain";

@Injectable()
export class PostWriter {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async create(authorId: number, input: CreatePostInput): Promise<number> {
        const post = await this.db
            .query(createPost, {
                title: input.title,
                content: input.content,
                authorId
            })
            .single();

        return post.id;
    }

    async update(params: {
        postId: number;
        input: UpdatePostInput;
        actorId: number;
        actorRole: string;
    }): Promise<PostMutationResult | null> {
        const post = await this.db
            .query(updatePost, {
                postId: params.postId,
                title: params.input.title ?? null,
                content: params.input.content ?? null,
                actorId: params.actorId,
                actorRole: params.actorRole
            })
            .singleOrNull();

        return post
            ? {
                  post: { id: post.id, authorId: post.authorId },
                  changedId: post.updatedId
              }
            : null;
    }

    async delete(params: { postId: number; actorId: number; actorRole: string }): Promise<PostMutationResult | null> {
        const post = await this.db
            .query(deletePost, {
                postId: params.postId,
                actorId: params.actorId,
                actorRole: params.actorRole
            })
            .singleOrNull();

        return post
            ? {
                  post: { id: post.id, authorId: post.authorId },
                  changedId: post.deletedId
              }
            : null;
    }

    async incrementView(postId: number): Promise<void> {
        await this.db.query(incrementPostView, { postId }).multiple();
    }
}
