import { Module } from "@nestjs/common";

import { AuthModule } from "../auth";
import { CommentsController } from "./controller/comments.controller";
import { PostsController } from "./controller/posts.controller";
import { CommentReader, CommentWriter, PostReader, PostWriter } from "./repository";
import { BoardCommandService, BoardQueryService } from "./service";

@Module({
    imports: [AuthModule],
    controllers: [PostsController, CommentsController],
    providers: [BoardQueryService, BoardCommandService, PostReader, PostWriter, CommentReader, CommentWriter]
})
export class BoardModule {}
