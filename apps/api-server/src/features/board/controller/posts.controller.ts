import type { AuthClaims } from "@nmm/shared";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { createPostInputSchema, numericIdParamSchema, postListQuerySchema, updatePostInputSchema } from "@nmm/shared";

import { ActiveAccountGuard, CurrentAuth, SessionUserGuard } from "../../auth";
import { BoardCommandService, BoardQueryService } from "../service";

@Controller("posts")
export class PostsController {
    constructor(
        private readonly boardQuery: BoardQueryService,
        private readonly boardCommand: BoardCommandService
    ) {}

    @Get()
    async listPosts(@Query() query: unknown) {
        return this.boardQuery.listPosts(postListQuerySchema.parse(query));
    }

    @Get(":postId")
    async getPost(@Param("postId") postId: string) {
        return this.boardQuery.getPost(numericIdParamSchema.parse(postId));
    }

    @Post()
    @UseGuards(SessionUserGuard, ActiveAccountGuard)
    async createPost(@CurrentAuth() auth: AuthClaims, @Body() body: unknown) {
        const input = createPostInputSchema.parse(body);

        return this.boardCommand.createPost(auth, input);
    }

    @Patch(":postId")
    @UseGuards(SessionUserGuard, ActiveAccountGuard)
    async updatePost(@CurrentAuth() auth: AuthClaims, @Param("postId") postId: string, @Body() body: unknown) {
        const input = updatePostInputSchema.parse(body);

        return this.boardCommand.updatePost(auth, numericIdParamSchema.parse(postId), input);
    }

    @Delete(":postId")
    @UseGuards(SessionUserGuard, ActiveAccountGuard)
    async deletePost(@CurrentAuth() auth: AuthClaims, @Param("postId") postId: string) {
        return this.boardCommand.deletePost(auth, numericIdParamSchema.parse(postId));
    }
}
