import type { AuthClaims } from "@/features/auth";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { createPostInputSchema, numericIdParamSchema, postListQuerySchema, updatePostInputSchema } from "@nmm/shared";

import { AuthenticatedUserGuard, CurrentAuth, OptionalAuthGuard } from "@/features/auth";
import { BoardCommandService, BoardQueryService } from "@/features/board/service";

@Controller("posts")
export class PostsController {
    constructor(
        private readonly boardQuery: BoardQueryService,
        private readonly boardCommand: BoardCommandService
    ) {}

    @Get()
    @UseGuards(OptionalAuthGuard)
    async listPosts(@Query() query: unknown, @CurrentAuth() auth?: AuthClaims) {
        return this.boardQuery.listPosts(postListQuerySchema.parse(query), auth);
    }

    @Get(":postId")
    async getPost(@Param("postId") postId: string) {
        return this.boardQuery.getPost(numericIdParamSchema.parse(postId));
    }

    @Post()
    @UseGuards(AuthenticatedUserGuard)
    async createPost(@CurrentAuth() auth: AuthClaims, @Body() body: unknown) {
        const input = createPostInputSchema.parse(body);

        return this.boardCommand.createPost(auth, input);
    }

    @Patch(":postId")
    @UseGuards(AuthenticatedUserGuard)
    async updatePost(@CurrentAuth() auth: AuthClaims, @Param("postId") postId: string, @Body() body: unknown) {
        const input = updatePostInputSchema.parse(body);

        return this.boardCommand.updatePost(auth, numericIdParamSchema.parse(postId), input);
    }

    @Delete(":postId")
    @UseGuards(AuthenticatedUserGuard)
    async deletePost(@CurrentAuth() auth: AuthClaims, @Param("postId") postId: string) {
        return this.boardCommand.deletePost(auth, numericIdParamSchema.parse(postId));
    }
}
