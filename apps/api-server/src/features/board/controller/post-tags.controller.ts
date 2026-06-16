import { Controller, Get } from "@nestjs/common";

import { BoardQueryService } from "../service";

@Controller("post-tags")
export class PostTagsController {
    constructor(private readonly boardQuery: BoardQueryService) {}

    @Get()
    async listTags() {
        return this.boardQuery.listTags();
    }
}
