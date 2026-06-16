import { z } from "zod";

export const userRoleSchema = z.enum(["USER", "ADMIN"]);
export const userStatusSchema = z.enum(["ACTIVE", "SUSPENDED"]);

export const userSchema = z.object({
    id: z.number().int().positive(),
    email: z.string().email(),
    displayName: z.string().min(1).max(80),
    role: userRoleSchema,
    status: userStatusSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

export const currentUserSchema = userSchema.nullable();

export const authClaimsSchema = z.object({
    userId: z.number().int().positive(),
    sessionId: z.string().min(1),
    role: userRoleSchema,
    status: userStatusSchema
});

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

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type User = z.infer<typeof userSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;
export type AuthClaims = z.infer<typeof authClaimsSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type SignupInput = z.infer<typeof signupInputSchema>;
export type UpdateMeInput = z.infer<typeof updateMeInputSchema>;
