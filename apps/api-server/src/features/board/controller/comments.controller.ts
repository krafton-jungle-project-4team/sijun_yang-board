import type { AuthClaims } from "@/features/auth";
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { createCommentInputSchema, numericIdParamSchema, updateCommentInputSchema } from "@nmm/shared";

import { AuthGuard, CurrentAuth } from "@/features/auth";
import { BoardCommandService, BoardQueryService } from "@/features/board/service";

@Controller()
export class CommentsController {
    constructor(
        private readonly boardQuery: BoardQueryService,
        private readonly boardCommand: BoardCommandService
    ) {}

    @Get("posts/:postId/comments")
    async listComments(@Param("postId") postId: string) {
        return this.boardQuery.listComments(numericIdParamSchema.parse(postId));
    }

    @Post("posts/:postId/comments")
    @UseGuards(AuthGuard)
    async createComment(@CurrentAuth() auth: AuthClaims, @Param("postId") postId: string, @Body() body: unknown) {
        const input = createCommentInputSchema.parse(body);

        return this.boardCommand.createComment(auth, numericIdParamSchema.parse(postId), input);
    }

    @Patch("comments/:commentId")
    @UseGuards(AuthGuard)
    async updateComment(@CurrentAuth() auth: AuthClaims, @Param("commentId") commentId: string, @Body() body: unknown) {
        const input = updateCommentInputSchema.parse(body);

        return this.boardCommand.updateComment(auth, numericIdParamSchema.parse(commentId), input);
    }

    @Delete("comments/:commentId")
    @UseGuards(AuthGuard)
    async deleteComment(@CurrentAuth() auth: AuthClaims, @Param("commentId") commentId: string) {
        return this.boardCommand.deleteComment(auth, numericIdParamSchema.parse(commentId));
    }
}
