import type { ProjectListQuery, TaskDetail, TaskStatus, TaskSummary, UpdateTaskInput } from "@nmm/shared";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { projectsApi } from "@/features/projects/api/projects-api";

export const projectQueryKeys = {
    listPrefix: ["projects", "list"] as const,
    list: (query: ProjectListQuery) => [...projectQueryKeys.listPrefix, query] as const,
    detail: (projectId: number) => ["projects", "detail", projectId] as const,
    tasks: (projectId: number) => ["projects", "tasks", projectId] as const,
    taskDetail: (taskId: number) => ["tasks", "detail", taskId] as const
};

export function useProjects(query: ProjectListQuery) {
    return useQuery({
        queryKey: projectQueryKeys.list(query),
        queryFn: ({ signal }) => projectsApi.listProjects(query, { signal }),
        placeholderData: (previousData) => previousData
    });
}

export function useSuspenseProjects(query: ProjectListQuery) {
    return useSuspenseQuery({
        queryKey: projectQueryKeys.list(query),
        queryFn: ({ signal }) => projectsApi.listProjects(query, { signal })
    });
}

export function useSuspenseProject(projectId: number) {
    return useSuspenseQuery({
        queryKey: projectQueryKeys.detail(projectId),
        queryFn: ({ signal }) => projectsApi.getProject(projectId, { signal })
    });
}

export function useSuspenseProjectTasks(projectId: number) {
    return useSuspenseQuery({
        queryKey: projectQueryKeys.tasks(projectId),
        queryFn: ({ signal }) => projectsApi.listProjectTasks(projectId, { signal })
    });
}

export function useSuspenseTask(taskId: number) {
    return useSuspenseQuery({
        queryKey: projectQueryKeys.taskDetail(taskId),
        queryFn: ({ signal }) => projectsApi.getTask(taskId, { signal })
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: projectsApi.createProject,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}

export function useUpdateProject(projectId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: Parameters<typeof projectsApi.updateProject>[1]) =>
            projectsApi.updateProject(projectId, input),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}

export function useCreateTask(projectId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: Parameters<typeof projectsApi.createTask>[1]) => projectsApi.createTask(projectId, input),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.tasks(projectId) }),
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) }),
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}

export function useUpdateTask(projectId: number, taskId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateTaskInput) => projectsApi.updateTask(taskId, input),
        onMutate: async (input) => {
            if (!isTaskStatusOnlyPatch(input)) {
                return {};
            }

            await queryClient.cancelQueries({ queryKey: projectQueryKeys.tasks(projectId) });
            await queryClient.cancelQueries({ queryKey: projectQueryKeys.taskDetail(taskId) });

            const previousTasks = queryClient.getQueryData<TaskSummary[]>(projectQueryKeys.tasks(projectId));
            const previousTask = queryClient.getQueryData<TaskDetail>(projectQueryKeys.taskDetail(taskId));
            const updatedAt = new Date().toISOString();

            queryClient.setQueryData<TaskSummary[]>(projectQueryKeys.tasks(projectId), (currentTasks) =>
                currentTasks?.map((task) => updateTaskStatus(task, taskId, input.status, updatedAt))
            );
            queryClient.setQueryData<TaskDetail>(projectQueryKeys.taskDetail(taskId), (currentTask) =>
                currentTask ? updateTaskStatus(currentTask, taskId, input.status, updatedAt) : currentTask
            );

            return { previousTask, previousTasks };
        },
        onError: (_error, _input, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(projectQueryKeys.tasks(projectId), context.previousTasks);
            }

            if (context?.previousTask) {
                queryClient.setQueryData(projectQueryKeys.taskDetail(taskId), context.previousTask);
            }
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.tasks(projectId) }),
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(taskId) }),
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) }),
                queryClient.invalidateQueries({ queryKey: projectQueryKeys.listPrefix }),
                queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.detail })
            ]);
        }
    });
}

function isTaskStatusOnlyPatch(input: UpdateTaskInput): input is { status: TaskStatus } {
    return (
        input.status !== undefined &&
        input.title === undefined &&
        input.description === undefined &&
        input.priority === undefined &&
        input.assigneeId === undefined
    );
}

function updateTaskStatus<TTask extends TaskSummary>(
    task: TTask,
    taskId: number,
    status: TaskStatus,
    updatedAt: string
) {
    if (task.id !== taskId) {
        return task;
    }

    return {
        ...task,
        status,
        updatedAt
    };
}
