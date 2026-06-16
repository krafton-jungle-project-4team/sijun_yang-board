import type { AuthClaims, Comment, PostDetail, PostListQuery, PostListResult, Tag } from "@nmm/shared";
import { InjectTransaction, Transactional, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { postNotFoundError } from "../board-errors";
import {
    countPosts,
    countPostTagLinks,
    getPostById,
    incrementPostView,
    listCommentsByPostId,
    listPosts,
    listTags,
    listTagsByPostIds
} from "../database/__generated__/board.queries";
import { toCommentModel, toPostDetail, toPostSummary, toTagModel } from "./board-mappers";

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
            tag: query.tag ?? null,
            authorId: query.view === "mine" && auth ? auth.userId : null
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
        const tagRows = await this.db.query(listTagsByPostIds, { postIds: items.map((item) => item.id) }).multiple();
        const tagsByPostId: Record<number, Tag[]> = {};

        for (const tagRow of tagRows) {
            const tags = tagsByPostId[tagRow.postId] ?? [];
            tags.push(toTagModel(tagRow));
            tagsByPostId[tagRow.postId] = tags;
        }

        return {
            items: items.map((item) => toPostSummary(item, tagsByPostId[item.id] ?? [])),
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

        const tagRows = await this.db.query(listTagsByPostIds, { postIds: [postId] }).multiple();

        return toPostDetail(post, tagRows.map(toTagModel));
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listComments(postId: number): Promise<Comment[]> {
        const comments = await this.db.query(listCommentsByPostId, { postId }).multiple();

        return comments.map(toCommentModel);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listTags(): Promise<Tag[]> {
        const tags = await this.db.query(listTags, undefined).multiple();

        return tags.map(toTagModel);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async hasPostTagLinks(postId: number): Promise<boolean> {
        const result = await this.db.query(countPostTagLinks, { postId }).single();

        return (result.total ?? 0) > 0;
    }
}
