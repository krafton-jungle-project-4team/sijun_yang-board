import type { AuthClaims } from "@/features/auth";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { createPostInputSchema, numericIdParamSchema, postListQuerySchema, updatePostInputSchema } from "@nmm/shared";

import { AuthGuard, CurrentAuth } from "@/features/auth";
import { BoardCommandService, BoardQueryService } from "@/features/board/service";

/**
 * post list, detail, creation, update, deletion HTTP route를 처리한다.
 *
 * post endpoint의 request parsing boundary로 사용한다.
 * authorization과 mutation rule은 controller branch가 아니라 board service와 domain helper에 둔다.
 */
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
    @UseGuards(AuthGuard)
    async createPost(@CurrentAuth() auth: AuthClaims, @Body() body: unknown) {
        const input = createPostInputSchema.parse(body);

        return this.boardCommand.createPost(auth, input);
    }

    @Patch(":postId")
    @UseGuards(AuthGuard)
    async updatePost(@CurrentAuth() auth: AuthClaims, @Param("postId") postId: string, @Body() body: unknown) {
        const input = updatePostInputSchema.parse(body);

        return this.boardCommand.updatePost(auth, numericIdParamSchema.parse(postId), input);
    }

    @Delete(":postId")
    @UseGuards(AuthGuard)
    async deletePost(@CurrentAuth() auth: AuthClaims, @Param("postId") postId: string) {
        return this.boardCommand.deletePost(auth, numericIdParamSchema.parse(postId));
    }
}
