import { userSchema } from "@nmm/shared";

import { getJson, patchJson, postJson } from "../../../shared/api/http-client";

export const authApi = {
    getMe() {
        return getJson("account/me", userSchema);
    },
    completeSignup(displayName: string) {
        return postJson("account/complete-signup", userSchema, { displayName });
    },
    updateMe(displayName: string) {
        return patchJson("account/me", userSchema, { displayName });
    }
};
