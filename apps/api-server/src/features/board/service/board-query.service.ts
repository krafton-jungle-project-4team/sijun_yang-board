import type { AuthClaims, Comment, PostDetail, PostListQuery, PostListResult } from "@nmm/shared";
import { InjectTransaction, Transactional, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { postNotFoundError } from "../board-errors";
import {
    countPosts,
    getPostById,
    incrementPostView,
    listCommentsByPostId,
    listPosts
} from "../database/__generated__/board.queries";
import { toCommentModel, toPostDetail, toPostSummary } from "./board-mappers";

@Injectable()
export class BoardQueryService {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async listPosts(query: PostListQuery, auth?: AuthClaims): Promise<PostListResult> {
        const filters = {
            search: query.search ?? null,
            authorId: query.view === "mine" ? (auth?.userId ?? -1) : null
        };
        const items = await this.db
            .query(listPosts, {
                ...filters,
                sort: query.sort,
                limit: query.pageSize,
                offset: (query.page - 1) * query.pageSize
            })
            .multiple();
        const total = await this.db.query(countPosts, filters).single();

        return {
            items: items.map(toPostSummary),
            page: query.page,
            pageSize: query.pageSize,
            total: total.total ?? 0
        };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getPost(postId: number): Promise<PostDetail> {
        await this.db.query(incrementPostView, { postId }).multiple();

        const post = await this.db.query(getPostById, { postId }).singleOrNull();

        if (!post) {
            throw postNotFoundError();
        }

        return toPostDetail(post);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listComments(postId: number): Promise<Comment[]> {
        const comments = await this.db.query(listCommentsByPostId, { postId }).multiple();

        return comments.map(toCommentModel);
    }
}
