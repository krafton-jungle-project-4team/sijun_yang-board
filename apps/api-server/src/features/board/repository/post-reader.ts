import type { AuthClaims, PostListQuery } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import type { Page } from "../../../infra/domain/page";
import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { countPosts, getPostById, listPosts } from "../database/__generated__/board.queries";
import type { PostSnapshot } from "../domain";

@Injectable()
export class PostReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async list(query: PostListQuery, auth?: AuthClaims): Promise<Page<PostSnapshot>> {
        const filters = {
            search: query.search ?? null,
            authorId: query.view === "mine" ? (auth?.userId ?? -1) : null
        };
        const posts = await this.db
            .query(listPosts, {
                ...filters,
                sort: query.sort,
                limit: query.pageSize,
                offset: (query.page - 1) * query.pageSize
            })
            .multiple();
        const total = await this.db.query(countPosts, filters).single();

        return {
            items: posts.map(toPostSnapshot),
            page: query.page,
            pageSize: query.pageSize,
            total: total.total ?? 0
        };
    }

    async findById(postId: number): Promise<PostSnapshot | null> {
        const post = await this.db.query(getPostById, { postId }).singleOrNull();

        return post ? toPostSnapshot(post) : null;
    }
}

function toPostSnapshot(post: {
    id: number;
    title: string;
    content: string;
    authorId: number;
    authorName: string;
    commentCount: number | null;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}) {
    return {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        authorName: post.authorName,
        commentCount: post.commentCount ?? 0,
        viewCount: post.viewCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
    };
}
