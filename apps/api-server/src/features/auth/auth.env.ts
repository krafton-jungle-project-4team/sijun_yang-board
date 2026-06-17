import { serverEnv } from "@/infra/env";

export const authEnv = {
    sessionCookieName: serverEnv.SESSION_COOKIE_NAME
};
