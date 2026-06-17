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

/**
 * post record를 쓰고 service policy check에 필요한 mutation summary를 반환한다.
 *
 * transaction 안에서 create, update, delete, view-count mutation이 필요할 때 사용한다.
 * authorization predicate는 SQL 또는 domain helper에 두고 service 검증에 필요한 ownership data만 반환한다.
 */
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
