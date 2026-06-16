import type { LoginInput, SignupInput } from "@nmm/shared";
import { currentUserSchema, idCommandResultSchema, userSchema } from "@nmm/shared";
import type { Options } from "ky";

import { getJson, patchJson, postJson } from "../../../shared/api/http-client";

export const authApi = {
    getMe(options?: Options) {
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
        return postJson("account/logout", idCommandResultSchema);
    }
};
