import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { listCommentsByPostId } from "@/features/board/database/__generated__/board.queries";
import type { CommentSnapshot } from "@/features/board/domain";

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
