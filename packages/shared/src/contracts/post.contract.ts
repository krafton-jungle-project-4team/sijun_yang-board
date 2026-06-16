import { z } from "zod";

export const numericIdParamSchema = z.coerce.number().int().positive();

export const postSortSchema = z.enum(["latest", "popular"]).default("latest");
export const postViewSchema = z.enum(["all", "mine"]).default("all");

export const postListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
    sort: postSortSchema,
    view: postViewSchema,
    tag: z.string().trim().min(1).max(40).optional(),
    search: z.string().trim().min(1).max(120).optional()
});

export const tagSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(40)
});

export const postSummarySchema = z.object({
    id: z.number().int().positive(),
    title: z.string().min(1),
    excerpt: z.string(),
    authorId: z.number().int().positive(),
    authorName: z.string().min(1),
    commentCount: z.number().int().nonnegative(),
    viewCount: z.number().int().nonnegative(),
    tags: z.array(tagSchema),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

export const postDetailSchema = postSummarySchema.extend({
    content: z.string().min(1)
});

export const postListResultSchema = z.object({
    items: z.array(postSummarySchema),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().nonnegative()
});

export const createPostInputSchema = z.object({
    title: z.string().trim().min(1).max(120),
    content: z.string().trim().min(1).max(10000),
    tags: z.array(z.string().trim().min(1).max(40)).max(5).default([])
});

export const updatePostInputSchema = createPostInputSchema
    .partial()
    .refine(
        (value) => value.title !== undefined || value.content !== undefined || value.tags !== undefined,
        "At least one post field is required."
    );

export const commentSchema = z.object({
    id: z.number().int().positive(),
    postId: z.number().int().positive(),
    authorId: z.number().int().positive(),
    authorName: z.string().min(1),
    content: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

export const createCommentInputSchema = z.object({
    content: z.string().trim().min(1).max(2000)
});

export const updateCommentInputSchema = createCommentInputSchema;

export type PostListQuery = z.infer<typeof postListQuerySchema>;
export type Tag = z.infer<typeof tagSchema>;
export type PostSummary = z.infer<typeof postSummarySchema>;
export type PostDetail = z.infer<typeof postDetailSchema>;
export type PostListResult = z.infer<typeof postListResultSchema>;
export type CreatePostInput = z.infer<typeof createPostInputSchema>;
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
