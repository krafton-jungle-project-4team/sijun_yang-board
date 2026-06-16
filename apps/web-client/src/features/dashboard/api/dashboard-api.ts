import { dashboardSchema } from "@nmm/shared";
import type { Options } from "ky";

import { getJson } from "../../../shared/api/http-client";

export const dashboardApi = {
    getDashboard(options?: Options) {
        return getJson("dashboard", dashboardSchema, options);
    }
};
