import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { listCommentsByPostId } from "@/features/board/database/__generated__/board.queries";
import type { CommentSnapshot } from "@/features/board/domain";

/**
 * 특정 post의 comment snapshot을 PgTyped query로 읽는다.
 *
 * board query service가 response mapping용 comment list를 필요로 할 때 사용한다.
 * repository boundary를 벗어나기 전에 comment row를 domain snapshot으로 정규화한다.
 */
@Injectable()
export class CommentReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async listByPostId(postId: number): Promise<CommentSnapshot[]> {
        const comments = await this.db.query(listCommentsByPostId, { postId }).multiple();

        return comments.map((comment) => ({
            id: comment.id,
            postId: comment.postId,
            authorId: comment.authorId,
            authorName: comment.authorName,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        }));
    }
}
