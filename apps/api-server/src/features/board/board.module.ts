import { Module } from "@nestjs/common";

import { AuthModule } from "@/features/auth";
import { CommentsController } from "./controller/comments.controller";
import { PostsController } from "./controller/posts.controller";
import { CommentReader, CommentWriter, PostReader, PostWriter } from "./repository";
import { BoardCommandService, BoardQueryService } from "./service";

/**
 * board feature의 controller, service, repository를 연결한다.
 *
 * auth-aware board 동작이 필요한 post와 comment route에서 사용한다.
 * board 의존성은 AuthModule이 export한 auth boundary를 통해서만 연결한다.
 */
@Module({
    imports: [AuthModule],
    controllers: [PostsController, CommentsController],
    providers: [BoardQueryService, BoardCommandService, PostReader, PostWriter, CommentReader, CommentWriter]
})
export class BoardModule {}
