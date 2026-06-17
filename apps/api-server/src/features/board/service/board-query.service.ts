import type { Comment, PostDetail, PostListQuery, PostListResult } from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { boardErrors } from "@/features/board/board-errors";
import { CommentDomain, PostDomain } from "@/features/board/domain";
import { CommentReader, PostReader, PostWriter } from "@/features/board/repository";

@Injectable()
export class BoardQueryService {
    constructor(
        private readonly postReader: PostReader,
        private readonly postWriter: PostWriter,
        private readonly commentReader: CommentReader
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async listPosts(query: PostListQuery): Promise<PostListResult> {
        const page = await this.postReader.list(query);

        return {
            items: page.items.map(PostDomain.toSummary),
            page: page.page,
            pageSize: page.pageSize,
            total: page.total
        };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getPost(postId: number): Promise<PostDetail> {
        await this.postWriter.incrementView(postId);

        const post = await this.postReader.findById(postId);

        if (!post) {
            throw boardErrors.postNotFound();
        }

        return PostDomain.toDetail(post);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listComments(postId: number): Promise<Comment[]> {
        const comments = await this.commentReader.listByPostId(postId);

        return comments.map(CommentDomain.toComment);
    }
}
