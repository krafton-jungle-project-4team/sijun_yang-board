import type { LoginInput } from "@nmm/shared";
import { idCommandResultSchema, userSchema } from "@nmm/shared";
import type { Options } from "ky";

import { getJson, patchJson, postJson } from "../../../shared/api/http-client";

export const authApi = {
    getMe(options?: Options) {
        return getJson("account/me", userSchema, options);
    },
    login(input: LoginInput) {
        return postJson("account/login", userSchema, input);
    },
    completeSignup(displayName: string) {
        return postJson("account/complete-signup", userSchema, { displayName });
    },
    updateMe(displayName: string) {
        return patchJson("account/me", userSchema, { displayName });
    },
    logout() {
        return postJson("account/logout", idCommandResultSchema);
    }
};
