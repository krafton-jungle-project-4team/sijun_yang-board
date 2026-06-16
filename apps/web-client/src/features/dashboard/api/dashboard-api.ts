import { dashboardSchema } from "@nmm/shared";

import { getJson, type RequestOptions } from "../../../shared/api/http-client";

export const dashboardApi = {
    getDashboard(options?: RequestOptions) {
        return getJson("dashboard", dashboardSchema, options);
    }
};
