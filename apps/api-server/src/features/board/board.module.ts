import { Module } from "@nestjs/common";

import { CommentsController } from "./controller/comments.controller";
import { PostTagsController } from "./controller/post-tags.controller";
import { PostsController } from "./controller/posts.controller";
import { BoardCommandService, BoardQueryService } from "./service";

@Module({
    controllers: [PostsController, CommentsController, PostTagsController],
    providers: [BoardQueryService, BoardCommandService]
})
export class BoardModule {}
