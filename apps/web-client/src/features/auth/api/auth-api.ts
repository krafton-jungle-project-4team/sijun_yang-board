import type { LoginInput, SignupInput } from "@nmm/shared";
import { currentUserSchema, logoutResultSchema, userSchema } from "@nmm/shared";

import { getJson, patchJson, postJson, type RequestOptions } from "@/shared/api/http-client";

export const authApi = {
    getMe(options?: RequestOptions) {
        return getJson("account/me", currentUserSchema, options);
    },
    login(input: LoginInput) {
        return postJson("account/login", userSchema, input);
    },
    signup(input: SignupInput) {
        return postJson("account/signup", userSchema, input);
    },
    updateMe(displayName: string) {
        return patchJson("account/me", userSchema, { displayName });
    },
    logout() {
        return postJson("account/logout", logoutResultSchema);
    }
};
