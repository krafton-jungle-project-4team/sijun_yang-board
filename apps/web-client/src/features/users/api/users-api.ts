import { userOptionSchema } from "@nmm/shared";
import { z } from "zod";

import { getJson, type RequestOptions } from "../../../shared/api/http-client";

const usersSchema = z.array(userOptionSchema);

export const usersApi = {
    listUsers(options?: RequestOptions) {
        return getJson("users", usersSchema, options);
    }
};
