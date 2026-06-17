import { z } from "zod";

export const userRoleSchema = z.enum(["USER", "ADMIN"]);

export const userSchema = z.object({
    id: z.number().int().positive(),
    email: z.string().email(),
    displayName: z.string().min(1).max(80),
    role: userRoleSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

export const currentUserSchema = userSchema.nullable();

export const loginInputSchema = z.object({
    loginId: z.string().trim().min(1).max(80),
    password: z.string().min(1).max(200)
});

export const signupInputSchema = z.object({
    loginId: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(255),
    displayName: z.string().trim().min(1).max(80),
    password: z.string().min(1).max(200)
});

export const updateMeInputSchema = z.object({
    displayName: z.string().trim().min(1).max(80).optional()
});

export const logoutResultSchema = z.object({
    success: z.literal(true)
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type SignupInput = z.infer<typeof signupInputSchema>;
export type UpdateMeInput = z.infer<typeof updateMeInputSchema>;
export type LogoutResult = z.infer<typeof logoutResultSchema>;
