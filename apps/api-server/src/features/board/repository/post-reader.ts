import type { PostDetail, PostListQuery, PostSummary } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import type { Page } from "@/infra/domain/page";
import { PgTypedTransactionalAdapter } from "@/infra/database";
import { countPosts, getPostById, listPosts } from "@/features/board/database/__generated__/board.queries";

interface PostRecord {
    id: number;
    title: string;
    content: string;
    authorId: number;
    authorName: string;
    commentCount: number | null;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * post list와 detail response를 PgTyped query로 읽는다.
 *
 * service가 client에 반환할 board post data를 필요로 할 때 사용한다.
 * repository boundary를 벗어나기 전에 DB record를 shared post contract로 변환한다.
 */
@Injectable()
export class PostReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async list(query: PostListQuery): Promise<Page<PostSummary>> {
        const filters = {
            search: query.search ?? null
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
            items: posts.map(toPostSummary),
            page: query.page,
            pageSize: query.pageSize,
            total: total.total ?? 0
        };
    }

    async findById(postId: number): Promise<PostDetail | null> {
        const post = await this.db.query(getPostById, { postId }).singleOrNull();

        return post ? toPostDetail(post) : null;
    }
}

function toPostSummary(post: PostRecord): PostSummary {
    return {
        id: post.id,
        title: post.title,
        excerpt: createExcerpt(post.content),
        authorId: post.authorId,
        authorName: post.authorName,
        commentCount: post.commentCount ?? 0,
        viewCount: post.viewCount,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString()
    };
}

function toPostDetail(post: PostRecord): PostDetail {
    return {
        ...toPostSummary(post),
        content: post.content
    };
}

function createExcerpt(content: string) {
    return content.length > 160 ? `${content.slice(0, 157)}...` : content;
}
