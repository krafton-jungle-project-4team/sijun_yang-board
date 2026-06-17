import type { AuthClaims } from "@/features/auth";
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { createCommentInputSchema, numericIdParamSchema, updateCommentInputSchema } from "@nmm/shared";

import { AuthGuard, CurrentAuth } from "@/features/auth";
import { BoardCommandService, BoardQueryService } from "@/features/board/service";

/**
 * comment list, creation, update, deletion HTTP route를 처리한다.
 *
 * post에 연결된 comment endpoint의 request parsing boundary로 사용한다.
 * comment ownership과 deletion rule은 board service와 domain helper에 둔다.
 */
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
