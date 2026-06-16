import { Module } from "@nestjs/common";

import { AuthModule } from "../auth";
import { CommentsController } from "./controller/comments.controller";
import { PostsController } from "./controller/posts.controller";
import { BoardCommandService, BoardQueryService } from "./service";

@Module({
    imports: [AuthModule],
    controllers: [PostsController, CommentsController],
    providers: [BoardQueryService, BoardCommandService]
})
export class BoardModule {}
