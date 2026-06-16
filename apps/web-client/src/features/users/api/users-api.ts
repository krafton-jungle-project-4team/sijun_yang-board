import { userOptionSchema } from "@nmm/shared";
import type { Options } from "ky";
import { z } from "zod";

import { getJson } from "../../../shared/api/http-client";

const usersSchema = z.array(userOptionSchema);

export const usersApi = {
    listUsers(options?: Options) {
        return getJson("users", usersSchema, options);
    }
};
