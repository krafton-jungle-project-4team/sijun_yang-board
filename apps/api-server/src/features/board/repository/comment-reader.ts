import type { Comment } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { listCommentsByPostId } from "@/features/board/database/__generated__/board.queries";

/**
 * comment response에 필요한 DB 필드만 담은 board read record이다.
 *
 * CommentReader가 list query 결과를 shared Comment contract로 변환할 때 사용한다.
 * mutation policy용 snapshot이 아니므로 권한 판단에 필요한 최소 target과 혼용하지 않는다.
 */
interface CommentRecord {
    id: number;
    postId: number;
    authorId: number;
    authorName: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 특정 post의 comment response를 PgTyped query로 읽는다.
 *
 * board query service가 client에 반환할 comment list를 필요로 할 때 사용한다.
 * repository boundary를 벗어나기 전에 DB record를 shared comment contract로 변환한다.
 */
@Injectable()
export class CommentReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async listByPostId(postId: number): Promise<Comment[]> {
        const comments = await this.db.query(listCommentsByPostId, { postId }).multiple();

        return comments.map(toComment);
    }
}

function toComment(comment: CommentRecord): Comment {
    return {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        authorName: comment.authorName,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
    };
}
