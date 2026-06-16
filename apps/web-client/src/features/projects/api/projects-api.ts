import {
    idCommandResultSchema,
    projectDetailSchema,
    projectListResultSchema,
    taskDetailSchema,
    taskSummarySchema,
    type CreateProjectInput,
    type CreateTaskInput,
    type ProjectListQuery,
    type UpdateProjectInput,
    type UpdateTaskInput
} from "@nmm/shared";
import type { Options } from "ky";
import { z } from "zod";

import { getJson, patchJson, postJson } from "../../../shared/api/http-client";

const tasksSchema = z.array(taskSummarySchema);

export const projectsApi = {
    listProjects(query: ProjectListQuery, options?: Options) {
        return getJson("projects", projectListResultSchema, {
            ...options,
            searchParams: toProjectSearchParams(query)
        });
    },
    getProject(projectId: number, options?: Options) {
        return getJson(`projects/${projectId}`, projectDetailSchema, options);
    },
    createProject(input: CreateProjectInput) {
        return postJson("projects", idCommandResultSchema, input);
    },
    updateProject(projectId: number, input: UpdateProjectInput) {
        return patchJson(`projects/${projectId}`, idCommandResultSchema, input);
    },
    listProjectTasks(projectId: number, options?: Options) {
        return getJson(`projects/${projectId}/tasks`, tasksSchema, options);
    },
    createTask(projectId: number, input: CreateTaskInput) {
        return postJson(`projects/${projectId}/tasks`, idCommandResultSchema, input);
    },
    getTask(taskId: number, options?: Options) {
        return getJson(`tasks/${taskId}`, taskDetailSchema, options);
    },
    updateTask(taskId: number, input: UpdateTaskInput) {
        return patchJson(`tasks/${taskId}`, idCommandResultSchema, input);
    }
};

function toProjectSearchParams(query: ProjectListQuery) {
    const searchParams = new URLSearchParams({
        page: String(query.page),
        pageSize: String(query.pageSize),
        sort: query.sort,
        status: query.status
    });

    if (query.search) {
        searchParams.set("search", query.search);
    }

    return searchParams;
}
