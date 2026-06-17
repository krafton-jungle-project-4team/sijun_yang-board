import type { Comment, PostDetail, PostListQuery, PostListResult } from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { boardErrors } from "@/features/board/board-errors";
import { CommentReader, PostReader, PostWriter } from "@/features/board/repository";

/**
 * board read use case와 read-side side effect를 조율한다.
 *
 * client에 반환할 post list, post detail, comment list에서 사용한다.
 * repository가 query execution에 집중하도록 문서화된 view-count 증가는 여기에서만 수행한다.
 */
@Injectable()
export class BoardQueryService {
    constructor(
        private readonly postReader: PostReader,
        private readonly postWriter: PostWriter,
        private readonly commentReader: CommentReader
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async listPosts(query: PostListQuery): Promise<PostListResult> {
        return this.postReader.list(query);
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getPost(postId: number): Promise<PostDetail> {
        await this.postWriter.incrementView(postId);

        const post = await this.postReader.findById(postId);

        if (!post) {
            throw boardErrors.postNotFound();
        }

        return post;
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async listComments(postId: number): Promise<Comment[]> {
        return this.commentReader.listByPostId(postId);
    }
}
