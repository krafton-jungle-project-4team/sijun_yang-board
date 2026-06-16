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
import { z } from "zod";

import { getJson, patchJson, postJson, type RequestOptions } from "../../../shared/api/http-client";
import { serializeProjectListQuery } from "../model/project-search";

const tasksSchema = z.array(taskSummarySchema);

export const projectsApi = {
    listProjects(query: ProjectListQuery, options?: RequestOptions) {
        return getJson("projects", projectListResultSchema, {
            ...options,
            searchParams: serializeProjectListQuery(query)
        });
    },
    getProject(projectId: number, options?: RequestOptions) {
        return getJson(`projects/${projectId}`, projectDetailSchema, options);
    },
    createProject(input: CreateProjectInput) {
        return postJson("projects", idCommandResultSchema, input);
    },
    updateProject(projectId: number, input: UpdateProjectInput) {
        return patchJson(`projects/${projectId}`, idCommandResultSchema, input);
    },
    listProjectTasks(projectId: number, options?: RequestOptions) {
        return getJson(`projects/${projectId}/tasks`, tasksSchema, options);
    },
    createTask(projectId: number, input: CreateTaskInput) {
        return postJson(`projects/${projectId}/tasks`, idCommandResultSchema, input);
    },
    getTask(taskId: number, options?: RequestOptions) {
        return getJson(`tasks/${taskId}`, taskDetailSchema, options);
    },
    updateTask(taskId: number, input: UpdateTaskInput) {
        return patchJson(`tasks/${taskId}`, idCommandResultSchema, input);
    }
};
