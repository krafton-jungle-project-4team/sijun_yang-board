/** Types generated for queries found in "src/features/operations/database/operations.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'ListUsers' parameters type */
export type IListUsersParams = void;

/** 'ListUsers' return type */
export interface IListUsersResult {
  displayName: string;
  email: string;
  id: number;
  role: string;
}

/** 'ListUsers' query type */
export interface IListUsersQuery {
  params: IListUsersParams;
  result: IListUsersResult;
}

const listUsersIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    id,\n    email,\n    display_name AS \"displayName\",\n    role\nFROM \"user\"\nWHERE is_anonymous = false\nORDER BY display_name ASC                                                                         "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     email,
 *     display_name AS "displayName",
 *     role
 * FROM "user"
 * WHERE is_anonymous = false
 * ORDER BY display_name ASC                                                                         
 * ```
 */
export const listUsers = new PreparedQuery<IListUsersParams,IListUsersResult>(listUsersIR);


/** 'ListProjects' parameters type */
export interface IListProjectsParams {
  limit?: number | null | void;
  offset?: number | null | void;
  search?: string | null | void;
  sort?: string | null | void;
  status?: string | null | void;
}

/** 'ListProjects' return type */
export interface IListProjectsResult {
  createdAt: Date;
  createdById: number;
  createdByName: string;
  description: string;
  id: number;
  name: string;
  openTaskCount: number | null;
  ownerId: number;
  ownerName: string;
  pendingRequestCount: number | null;
  status: string;
  taskCount: number | null;
  updatedAt: Date;
}

/** 'ListProjects' query type */
export interface IListProjectsQuery {
  params: IListProjectsParams;
  result: IListProjectsResult;
}

const listProjectsIR: any = {"usedParamSet":{"search":true,"status":true,"sort":true,"limit":true,"offset":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":844,"b":850},{"a":889,"b":895},{"a":940,"b":946}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":969,"b":975},{"a":1005,"b":1011}]},{"name":"sort","required":false,"transform":{"type":"scalar"},"locs":[{"a":1043,"b":1047},{"a":1104,"b":1108}]},{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":1187,"b":1192}]},{"name":"offset","required":false,"transform":{"type":"scalar"},"locs":[{"a":1207,"b":1213}]}],"statement":"SELECT\n    p.id,\n    p.name,\n    p.description,\n    p.status,\n    p.owner_id AS \"ownerId\",\n    owner.display_name AS \"ownerName\",\n    p.created_by_id AS \"createdById\",\n    creator.display_name AS \"createdByName\",\n    p.created_at AS \"createdAt\",\n    p.updated_at AS \"updatedAt\",\n    (\n        SELECT count(*)::int4\n        FROM tasks t\n        WHERE t.project_id = p.id\n    ) AS \"taskCount\",\n    (\n        SELECT count(*)::int4\n        FROM tasks t\n        WHERE t.project_id = p.id\n          AND t.status <> 'DONE'\n    ) AS \"openTaskCount\",\n    (\n        SELECT count(*)::int4\n        FROM approval_requests ar\n        WHERE ar.project_id = p.id\n          AND ar.status = 'PENDING'\n    ) AS \"pendingRequestCount\"\nFROM projects p\nINNER JOIN \"user\" owner ON owner.id = p.owner_id\nINNER JOIN \"user\" creator ON creator.id = p.created_by_id\nWHERE (:search::text IS NULL OR p.name ILIKE '%' || :search::text || '%' OR p.description ILIKE '%' || :search::text || '%')\n  AND (:status::text IS NULL OR p.status = :status::text)\nORDER BY\n    CASE WHEN :sort = 'name' THEN p.name END ASC NULLS LAST,\n    CASE WHEN :sort = 'oldest' THEN p.created_at END ASC NULLS LAST,\n    p.created_at DESC\nLIMIT :limit::int4\nOFFSET :offset::int4                                                          "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     p.id,
 *     p.name,
 *     p.description,
 *     p.status,
 *     p.owner_id AS "ownerId",
 *     owner.display_name AS "ownerName",
 *     p.created_by_id AS "createdById",
 *     creator.display_name AS "createdByName",
 *     p.created_at AS "createdAt",
 *     p.updated_at AS "updatedAt",
 *     (
 *         SELECT count(*)::int4
 *         FROM tasks t
 *         WHERE t.project_id = p.id
 *     ) AS "taskCount",
 *     (
 *         SELECT count(*)::int4
 *         FROM tasks t
 *         WHERE t.project_id = p.id
 *           AND t.status <> 'DONE'
 *     ) AS "openTaskCount",
 *     (
 *         SELECT count(*)::int4
 *         FROM approval_requests ar
 *         WHERE ar.project_id = p.id
 *           AND ar.status = 'PENDING'
 *     ) AS "pendingRequestCount"
 * FROM projects p
 * INNER JOIN "user" owner ON owner.id = p.owner_id
 * INNER JOIN "user" creator ON creator.id = p.created_by_id
 * WHERE (:search::text IS NULL OR p.name ILIKE '%' || :search::text || '%' OR p.description ILIKE '%' || :search::text || '%')
 *   AND (:status::text IS NULL OR p.status = :status::text)
 * ORDER BY
 *     CASE WHEN :sort = 'name' THEN p.name END ASC NULLS LAST,
 *     CASE WHEN :sort = 'oldest' THEN p.created_at END ASC NULLS LAST,
 *     p.created_at DESC
 * LIMIT :limit::int4
 * OFFSET :offset::int4                                                          
 * ```
 */
export const listProjects = new PreparedQuery<IListProjectsParams,IListProjectsResult>(listProjectsIR);


/** 'CountProjects' parameters type */
export interface ICountProjectsParams {
  search?: string | null | void;
  status?: string | null | void;
}

/** 'CountProjects' return type */
export interface ICountProjectsResult {
  total: number | null;
}

/** 'CountProjects' query type */
export interface ICountProjectsQuery {
  params: ICountProjectsParams;
  result: ICountProjectsResult;
}

const countProjectsIR: any = {"usedParamSet":{"search":true,"status":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":54,"b":60},{"a":99,"b":105},{"a":150,"b":156}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":179,"b":185},{"a":215,"b":221}]}],"statement":"SELECT count(*)::int4 AS total\nFROM projects p\nWHERE (:search::text IS NULL OR p.name ILIKE '%' || :search::text || '%' OR p.description ILIKE '%' || :search::text || '%')\n  AND (:status::text IS NULL OR p.status = :status::text)                                                                               "};

/**
 * Query generated from SQL:
 * ```
 * SELECT count(*)::int4 AS total
 * FROM projects p
 * WHERE (:search::text IS NULL OR p.name ILIKE '%' || :search::text || '%' OR p.description ILIKE '%' || :search::text || '%')
 *   AND (:status::text IS NULL OR p.status = :status::text)                                                                               
 * ```
 */
export const countProjects = new PreparedQuery<ICountProjectsParams,ICountProjectsResult>(countProjectsIR);


/** 'GetProjectById' parameters type */
export interface IGetProjectByIdParams {
  projectId?: number | null | void;
}

/** 'GetProjectById' return type */
export interface IGetProjectByIdResult {
  createdAt: Date;
  createdById: number;
  createdByName: string;
  description: string;
  id: number;
  name: string;
  openTaskCount: number | null;
  ownerId: number;
  ownerName: string;
  pendingRequestCount: number | null;
  status: string;
  taskCount: number | null;
  updatedAt: Date;
}

/** 'GetProjectById' query type */
export interface IGetProjectByIdQuery {
  params: IGetProjectByIdParams;
  result: IGetProjectByIdResult;
}

const getProjectByIdIR: any = {"usedParamSet":{"projectId":true},"params":[{"name":"projectId","required":false,"transform":{"type":"scalar"},"locs":[{"a":850,"b":859}]}],"statement":"SELECT\n    p.id,\n    p.name,\n    p.description,\n    p.status,\n    p.owner_id AS \"ownerId\",\n    owner.display_name AS \"ownerName\",\n    p.created_by_id AS \"createdById\",\n    creator.display_name AS \"createdByName\",\n    p.created_at AS \"createdAt\",\n    p.updated_at AS \"updatedAt\",\n    (\n        SELECT count(*)::int4\n        FROM tasks t\n        WHERE t.project_id = p.id\n    ) AS \"taskCount\",\n    (\n        SELECT count(*)::int4\n        FROM tasks t\n        WHERE t.project_id = p.id\n          AND t.status <> 'DONE'\n    ) AS \"openTaskCount\",\n    (\n        SELECT count(*)::int4\n        FROM approval_requests ar\n        WHERE ar.project_id = p.id\n          AND ar.status = 'PENDING'\n    ) AS \"pendingRequestCount\"\nFROM projects p\nINNER JOIN \"user\" owner ON owner.id = p.owner_id\nINNER JOIN \"user\" creator ON creator.id = p.created_by_id\nWHERE p.id = :projectId::int4                                                      "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     p.id,
 *     p.name,
 *     p.description,
 *     p.status,
 *     p.owner_id AS "ownerId",
 *     owner.display_name AS "ownerName",
 *     p.created_by_id AS "createdById",
 *     creator.display_name AS "createdByName",
 *     p.created_at AS "createdAt",
 *     p.updated_at AS "updatedAt",
 *     (
 *         SELECT count(*)::int4
 *         FROM tasks t
 *         WHERE t.project_id = p.id
 *     ) AS "taskCount",
 *     (
 *         SELECT count(*)::int4
 *         FROM tasks t
 *         WHERE t.project_id = p.id
 *           AND t.status <> 'DONE'
 *     ) AS "openTaskCount",
 *     (
 *         SELECT count(*)::int4
 *         FROM approval_requests ar
 *         WHERE ar.project_id = p.id
 *           AND ar.status = 'PENDING'
 *     ) AS "pendingRequestCount"
 * FROM projects p
 * INNER JOIN "user" owner ON owner.id = p.owner_id
 * INNER JOIN "user" creator ON creator.id = p.created_by_id
 * WHERE p.id = :projectId::int4                                                      
 * ```
 */
export const getProjectById = new PreparedQuery<IGetProjectByIdParams,IGetProjectByIdResult>(getProjectByIdIR);


/** 'CreateProject' parameters type */
export interface ICreateProjectParams {
  createdById?: number | null | void;
  description?: string | null | void;
  name?: string | null | void;
  ownerId?: number | null | void;
  status?: string | null | void;
}

/** 'CreateProject' return type */
export interface ICreateProjectResult {
  id: number;
}

/** 'CreateProject' query type */
export interface ICreateProjectQuery {
  params: ICreateProjectParams;
  result: ICreateProjectResult;
}

const createProjectIR: any = {"usedParamSet":{"name":true,"description":true,"status":true,"ownerId":true,"createdById":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":82,"b":86}]},{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":89,"b":100}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":103,"b":109}]},{"name":"ownerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":121,"b":128}]},{"name":"createdById","required":false,"transform":{"type":"scalar"},"locs":[{"a":137,"b":148},{"a":158,"b":169}]}],"statement":"INSERT INTO projects (name, description, status, owner_id, created_by_id)\nVALUES (:name, :description, :status, COALESCE(:ownerId::int4, :createdById::int4), :createdById::int4)\nRETURNING id                                              "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO projects (name, description, status, owner_id, created_by_id)
 * VALUES (:name, :description, :status, COALESCE(:ownerId::int4, :createdById::int4), :createdById::int4)
 * RETURNING id                                              
 * ```
 */
export const createProject = new PreparedQuery<ICreateProjectParams,ICreateProjectResult>(createProjectIR);


/** 'UpdateProject' parameters type */
export interface IUpdateProjectParams {
  description?: string | null | void;
  name?: string | null | void;
  ownerId?: number | null | void;
  projectId?: number | null | void;
  status?: string | null | void;
}

/** 'UpdateProject' return type */
export interface IUpdateProjectResult {
  id: number;
}

/** 'UpdateProject' query type */
export interface IUpdateProjectQuery {
  params: IUpdateProjectParams;
  result: IUpdateProjectResult;
}

const updateProjectIR: any = {"usedParamSet":{"name":true,"description":true,"status":true,"ownerId":true,"projectId":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":40,"b":44}]},{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":81,"b":92}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":131,"b":137}]},{"name":"ownerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":173,"b":180}]},{"name":"projectId","required":false,"transform":{"type":"scalar"},"locs":[{"a":228,"b":237}]}],"statement":"UPDATE projects\nSET\n    name = COALESCE(:name, name),\n    description = COALESCE(:description, description),\n    status = COALESCE(:status, status),\n    owner_id = COALESCE(:ownerId, owner_id),\n    updated_at = now()\nWHERE id = :projectId::int4\nRETURNING id                                                               "};

/**
 * Query generated from SQL:
 * ```
 * UPDATE projects
 * SET
 *     name = COALESCE(:name, name),
 *     description = COALESCE(:description, description),
 *     status = COALESCE(:status, status),
 *     owner_id = COALESCE(:ownerId, owner_id),
 *     updated_at = now()
 * WHERE id = :projectId::int4
 * RETURNING id                                                               
 * ```
 */
export const updateProject = new PreparedQuery<IUpdateProjectParams,IUpdateProjectResult>(updateProjectIR);


/** 'ListTasksByProjectId' parameters type */
export interface IListTasksByProjectIdParams {
  projectId?: number | null | void;
}

/** 'ListTasksByProjectId' return type */
export interface IListTasksByProjectIdResult {
  assigneeId: number | null;
  assigneeName: string;
  createdAt: Date;
  createdById: number;
  createdByName: string;
  description: string;
  id: number;
  priority: string;
  projectId: number;
  projectName: string;
  status: string;
  title: string;
  updatedAt: Date;
}

/** 'ListTasksByProjectId' query type */
export interface IListTasksByProjectIdQuery {
  params: IListTasksByProjectIdParams;
  result: IListTasksByProjectIdResult;
}

const listTasksByProjectIdIR: any = {"usedParamSet":{"projectId":true},"params":[{"name":"projectId","required":false,"transform":{"type":"scalar"},"locs":[{"a":563,"b":572}]}],"statement":"SELECT\n    t.id,\n    t.project_id AS \"projectId\",\n    p.name AS \"projectName\",\n    t.title,\n    t.description,\n    t.status,\n    t.priority,\n    t.assignee_id AS \"assigneeId\",\n    assignee.display_name AS \"assigneeName\",\n    t.created_by_id AS \"createdById\",\n    creator.display_name AS \"createdByName\",\n    t.created_at AS \"createdAt\",\n    t.updated_at AS \"updatedAt\"\nFROM tasks t\nINNER JOIN projects p ON p.id = t.project_id\nINNER JOIN \"user\" creator ON creator.id = t.created_by_id\nLEFT JOIN \"user\" assignee ON assignee.id = t.assignee_id\nWHERE t.project_id = :projectId::int4\nORDER BY\n    CASE t.status WHEN 'IN_PROGRESS' THEN 1 WHEN 'TODO' THEN 2 ELSE 3 END ASC,\n    CASE t.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC,\n    t.created_at DESC                                                                "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     t.id,
 *     t.project_id AS "projectId",
 *     p.name AS "projectName",
 *     t.title,
 *     t.description,
 *     t.status,
 *     t.priority,
 *     t.assignee_id AS "assigneeId",
 *     assignee.display_name AS "assigneeName",
 *     t.created_by_id AS "createdById",
 *     creator.display_name AS "createdByName",
 *     t.created_at AS "createdAt",
 *     t.updated_at AS "updatedAt"
 * FROM tasks t
 * INNER JOIN projects p ON p.id = t.project_id
 * INNER JOIN "user" creator ON creator.id = t.created_by_id
 * LEFT JOIN "user" assignee ON assignee.id = t.assignee_id
 * WHERE t.project_id = :projectId::int4
 * ORDER BY
 *     CASE t.status WHEN 'IN_PROGRESS' THEN 1 WHEN 'TODO' THEN 2 ELSE 3 END ASC,
 *     CASE t.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC,
 *     t.created_at DESC                                                                
 * ```
 */
export const listTasksByProjectId = new PreparedQuery<IListTasksByProjectIdParams,IListTasksByProjectIdResult>(listTasksByProjectIdIR);


/** 'GetTaskById' parameters type */
export interface IGetTaskByIdParams {
  taskId?: number | null | void;
}

/** 'GetTaskById' return type */
export interface IGetTaskByIdResult {
  assigneeId: number | null;
  assigneeName: string;
  createdAt: Date;
  createdById: number;
  createdByName: string;
  description: string;
  id: number;
  priority: string;
  projectId: number;
  projectName: string;
  status: string;
  title: string;
  updatedAt: Date;
}

/** 'GetTaskById' query type */
export interface IGetTaskByIdQuery {
  params: IGetTaskByIdParams;
  result: IGetTaskByIdResult;
}

const getTaskByIdIR: any = {"usedParamSet":{"taskId":true},"params":[{"name":"taskId","required":false,"transform":{"type":"scalar"},"locs":[{"a":555,"b":561}]}],"statement":"SELECT\n    t.id,\n    t.project_id AS \"projectId\",\n    p.name AS \"projectName\",\n    t.title,\n    t.description,\n    t.status,\n    t.priority,\n    t.assignee_id AS \"assigneeId\",\n    assignee.display_name AS \"assigneeName\",\n    t.created_by_id AS \"createdById\",\n    creator.display_name AS \"createdByName\",\n    t.created_at AS \"createdAt\",\n    t.updated_at AS \"updatedAt\"\nFROM tasks t\nINNER JOIN projects p ON p.id = t.project_id\nINNER JOIN \"user\" creator ON creator.id = t.created_by_id\nLEFT JOIN \"user\" assignee ON assignee.id = t.assignee_id\nWHERE t.id = :taskId::int4                                                                 "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     t.id,
 *     t.project_id AS "projectId",
 *     p.name AS "projectName",
 *     t.title,
 *     t.description,
 *     t.status,
 *     t.priority,
 *     t.assignee_id AS "assigneeId",
 *     assignee.display_name AS "assigneeName",
 *     t.created_by_id AS "createdById",
 *     creator.display_name AS "createdByName",
 *     t.created_at AS "createdAt",
 *     t.updated_at AS "updatedAt"
 * FROM tasks t
 * INNER JOIN projects p ON p.id = t.project_id
 * INNER JOIN "user" creator ON creator.id = t.created_by_id
 * LEFT JOIN "user" assignee ON assignee.id = t.assignee_id
 * WHERE t.id = :taskId::int4                                                                 
 * ```
 */
export const getTaskById = new PreparedQuery<IGetTaskByIdParams,IGetTaskByIdResult>(getTaskByIdIR);


/** 'CreateTask' parameters type */
export interface ICreateTaskParams {
  assigneeId?: number | null | void;
  createdById?: number | null | void;
  description?: string | null | void;
  priority?: string | null | void;
  projectId?: number | null | void;
  status?: string | null | void;
  title?: string | null | void;
}

/** 'CreateTask' return type */
export interface ICreateTaskResult {
  projectId: number;
  taskId: number;
}

/** 'CreateTask' query type */
export interface ICreateTaskQuery {
  params: ICreateTaskParams;
  result: ICreateTaskResult;
}

const createTaskIR: any = {"usedParamSet":{"projectId":true,"title":true,"description":true,"status":true,"priority":true,"assigneeId":true,"createdById":true},"params":[{"name":"projectId","required":false,"transform":{"type":"scalar"},"locs":[{"a":72,"b":81}]},{"name":"title","required":false,"transform":{"type":"scalar"},"locs":[{"a":241,"b":246}]},{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":249,"b":260}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":263,"b":269}]},{"name":"priority","required":false,"transform":{"type":"scalar"},"locs":[{"a":272,"b":280}]},{"name":"assigneeId","required":false,"transform":{"type":"scalar"},"locs":[{"a":283,"b":293}]},{"name":"createdById","required":false,"transform":{"type":"scalar"},"locs":[{"a":302,"b":313}]}],"statement":"WITH target_project AS (\n    SELECT id\n    FROM projects\n    WHERE id = :projectId::int4\n),\ncreated_task AS (\n    INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, created_by_id)\n    SELECT target_project.id, :title, :description, :status, :priority, :assigneeId::int4, :createdById::int4\n    FROM target_project\n    RETURNING id\n)\nSELECT\n    target_project.id AS \"projectId\",\n    created_task.id AS \"taskId\"\nFROM target_project\nLEFT JOIN created_task ON true                                                                "};

/**
 * Query generated from SQL:
 * ```
 * WITH target_project AS (
 *     SELECT id
 *     FROM projects
 *     WHERE id = :projectId::int4
 * ),
 * created_task AS (
 *     INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, created_by_id)
 *     SELECT target_project.id, :title, :description, :status, :priority, :assigneeId::int4, :createdById::int4
 *     FROM target_project
 *     RETURNING id
 * )
 * SELECT
 *     target_project.id AS "projectId",
 *     created_task.id AS "taskId"
 * FROM target_project
 * LEFT JOIN created_task ON true                                                                
 * ```
 */
export const createTask = new PreparedQuery<ICreateTaskParams,ICreateTaskResult>(createTaskIR);


/** 'UpdateTask' parameters type */
export interface IUpdateTaskParams {
  actorId?: number | null | void;
  actorRole?: string | null | void;
  adminFieldPatch?: boolean | null | void;
  assigneeId?: number | null | void;
  description?: string | null | void;
  priority?: string | null | void;
  replaceAssignee?: boolean | null | void;
  status?: string | null | void;
  taskId?: number | null | void;
  title?: string | null | void;
}

/** 'UpdateTask' return type */
export interface IUpdateTaskResult {
  assigneeId: number | null;
  id: number;
  updatedId: number;
}

/** 'UpdateTask' query type */
export interface IUpdateTaskQuery {
  params: IUpdateTaskParams;
  result: IUpdateTaskResult;
}

const updateTaskIR: any = {"usedParamSet":{"taskId":true,"title":true,"description":true,"status":true,"priority":true,"replaceAssignee":true,"assigneeId":true,"actorRole":true,"actorId":true,"adminFieldPatch":true},"params":[{"name":"taskId","required":false,"transform":{"type":"scalar"},"locs":[{"a":79,"b":85}]},{"name":"title","required":false,"transform":{"type":"scalar"},"locs":[{"a":166,"b":171}]},{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":215,"b":226}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":271,"b":277},{"a":662,"b":668}]},{"name":"priority","required":false,"transform":{"type":"scalar"},"locs":[{"a":319,"b":327}]},{"name":"replaceAssignee","required":false,"transform":{"type":"scalar"},"locs":[{"a":375,"b":390}]},{"name":"assigneeId","required":false,"transform":{"type":"scalar"},"locs":[{"a":403,"b":413}]},{"name":"actorRole","required":false,"transform":{"type":"scalar"},"locs":[{"a":547,"b":556}]},{"name":"actorId","required":false,"transform":{"type":"scalar"},"locs":[{"a":629,"b":636}]},{"name":"adminFieldPatch","required":false,"transform":{"type":"scalar"},"locs":[{"a":710,"b":725}]}],"statement":"WITH target_task AS (\n    SELECT id, assignee_id\n    FROM tasks\n    WHERE id = :taskId::int4\n),\nupdated_task AS (\n    UPDATE tasks t\n    SET\n        title = COALESCE(:title, t.title),\n        description = COALESCE(:description, t.description),\n        status = COALESCE(:status, t.status),\n        priority = COALESCE(:priority, t.priority),\n        assignee_id = CASE WHEN :replaceAssignee::bool THEN :assigneeId::int4 ELSE t.assignee_id END,\n        updated_at = now()\n    FROM target_task\n    WHERE t.id = target_task.id\n      AND (\n          :actorRole::text = 'ADMIN'\n          OR (\n              target_task.assignee_id = :actorId::int4\n              AND :status::text IS NOT NULL\n              AND NOT :adminFieldPatch::bool\n          )\n      )\n    RETURNING t.id\n)\nSELECT\n    target_task.id,\n    target_task.assignee_id AS \"assigneeId\",\n    updated_task.id AS \"updatedId\"\nFROM target_task\nLEFT JOIN updated_task ON true                                                                         "};

/**
 * Query generated from SQL:
 * ```
 * WITH target_task AS (
 *     SELECT id, assignee_id
 *     FROM tasks
 *     WHERE id = :taskId::int4
 * ),
 * updated_task AS (
 *     UPDATE tasks t
 *     SET
 *         title = COALESCE(:title, t.title),
 *         description = COALESCE(:description, t.description),
 *         status = COALESCE(:status, t.status),
 *         priority = COALESCE(:priority, t.priority),
 *         assignee_id = CASE WHEN :replaceAssignee::bool THEN :assigneeId::int4 ELSE t.assignee_id END,
 *         updated_at = now()
 *     FROM target_task
 *     WHERE t.id = target_task.id
 *       AND (
 *           :actorRole::text = 'ADMIN'
 *           OR (
 *               target_task.assignee_id = :actorId::int4
 *               AND :status::text IS NOT NULL
 *               AND NOT :adminFieldPatch::bool
 *           )
 *       )
 *     RETURNING t.id
 * )
 * SELECT
 *     target_task.id,
 *     target_task.assignee_id AS "assigneeId",
 *     updated_task.id AS "updatedId"
 * FROM target_task
 * LEFT JOIN updated_task ON true                                                                         
 * ```
 */
export const updateTask = new PreparedQuery<IUpdateTaskParams,IUpdateTaskResult>(updateTaskIR);


/** 'ListApprovalRequests' parameters type */
export interface IListApprovalRequestsParams {
  limit?: number | null | void;
  offset?: number | null | void;
  projectId?: number | null | void;
  search?: string | null | void;
  sort?: string | null | void;
  status?: string | null | void;
}

/** 'ListApprovalRequests' return type */
export interface IListApprovalRequestsResult {
  createdAt: Date;
  description: string;
  id: number;
  projectId: number;
  projectName: string;
  requesterId: number;
  requesterName: string;
  reviewComment: string | null;
  reviewedAt: Date | null;
  reviewerId: number | null;
  reviewerName: string;
  status: string;
  title: string;
  updatedAt: Date;
}

/** 'ListApprovalRequests' query type */
export interface IListApprovalRequestsQuery {
  params: IListApprovalRequestsParams;
  result: IListApprovalRequestsResult;
}

const listApprovalRequestsIR: any = {"usedParamSet":{"search":true,"projectId":true,"status":true,"sort":true,"limit":true,"offset":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":640,"b":646},{"a":687,"b":693},{"a":739,"b":745}]},{"name":"projectId","required":false,"transform":{"type":"scalar"},"locs":[{"a":768,"b":777},{"a":812,"b":821}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":837,"b":843},{"a":874,"b":880}]},{"name":"sort","required":false,"transform":{"type":"scalar"},"locs":[{"a":912,"b":916}]},{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":997,"b":1002}]},{"name":"offset","required":false,"transform":{"type":"scalar"},"locs":[{"a":1017,"b":1023}]}],"statement":"SELECT\n    ar.id,\n    ar.project_id AS \"projectId\",\n    p.name AS \"projectName\",\n    ar.title,\n    ar.description,\n    ar.status,\n    ar.requester_id AS \"requesterId\",\n    requester.display_name AS \"requesterName\",\n    ar.reviewer_id AS \"reviewerId\",\n    reviewer.display_name AS \"reviewerName\",\n    ar.reviewed_at AS \"reviewedAt\",\n    ar.review_comment AS \"reviewComment\",\n    ar.created_at AS \"createdAt\",\n    ar.updated_at AS \"updatedAt\"\nFROM approval_requests ar\nINNER JOIN projects p ON p.id = ar.project_id\nINNER JOIN \"user\" requester ON requester.id = ar.requester_id\nLEFT JOIN \"user\" reviewer ON reviewer.id = ar.reviewer_id\nWHERE (:search::text IS NULL OR ar.title ILIKE '%' || :search::text || '%' OR ar.description ILIKE '%' || :search::text || '%')\n  AND (:projectId::int4 IS NULL OR ar.project_id = :projectId::int4)\n  AND (:status::text IS NULL OR ar.status = :status::text)\nORDER BY\n    CASE WHEN :sort = 'oldest' THEN ar.created_at END ASC NULLS LAST,\n    ar.created_at DESC\nLIMIT :limit::int4\nOFFSET :offset::int4                                                                   "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ar.id,
 *     ar.project_id AS "projectId",
 *     p.name AS "projectName",
 *     ar.title,
 *     ar.description,
 *     ar.status,
 *     ar.requester_id AS "requesterId",
 *     requester.display_name AS "requesterName",
 *     ar.reviewer_id AS "reviewerId",
 *     reviewer.display_name AS "reviewerName",
 *     ar.reviewed_at AS "reviewedAt",
 *     ar.review_comment AS "reviewComment",
 *     ar.created_at AS "createdAt",
 *     ar.updated_at AS "updatedAt"
 * FROM approval_requests ar
 * INNER JOIN projects p ON p.id = ar.project_id
 * INNER JOIN "user" requester ON requester.id = ar.requester_id
 * LEFT JOIN "user" reviewer ON reviewer.id = ar.reviewer_id
 * WHERE (:search::text IS NULL OR ar.title ILIKE '%' || :search::text || '%' OR ar.description ILIKE '%' || :search::text || '%')
 *   AND (:projectId::int4 IS NULL OR ar.project_id = :projectId::int4)
 *   AND (:status::text IS NULL OR ar.status = :status::text)
 * ORDER BY
 *     CASE WHEN :sort = 'oldest' THEN ar.created_at END ASC NULLS LAST,
 *     ar.created_at DESC
 * LIMIT :limit::int4
 * OFFSET :offset::int4                                                                   
 * ```
 */
export const listApprovalRequests = new PreparedQuery<IListApprovalRequestsParams,IListApprovalRequestsResult>(listApprovalRequestsIR);


/** 'CountApprovalRequests' parameters type */
export interface ICountApprovalRequestsParams {
  projectId?: number | null | void;
  search?: string | null | void;
  status?: string | null | void;
}

/** 'CountApprovalRequests' return type */
export interface ICountApprovalRequestsResult {
  total: number | null;
}

/** 'CountApprovalRequests' query type */
export interface ICountApprovalRequestsQuery {
  params: ICountApprovalRequestsParams;
  result: ICountApprovalRequestsResult;
}

const countApprovalRequestsIR: any = {"usedParamSet":{"search":true,"projectId":true,"status":true},"params":[{"name":"search","required":false,"transform":{"type":"scalar"},"locs":[{"a":64,"b":70},{"a":111,"b":117},{"a":163,"b":169}]},{"name":"projectId","required":false,"transform":{"type":"scalar"},"locs":[{"a":192,"b":201},{"a":236,"b":245}]},{"name":"status","required":false,"transform":{"type":"scalar"},"locs":[{"a":261,"b":267},{"a":298,"b":304}]}],"statement":"SELECT count(*)::int4 AS total\nFROM approval_requests ar\nWHERE (:search::text IS NULL OR ar.title ILIKE '%' || :search::text || '%' OR ar.description ILIKE '%' || :search::text || '%')\n  AND (:projectId::int4 IS NULL OR ar.project_id = :projectId::int4)\n  AND (:status::text IS NULL OR ar.status = :status::text)                                                                            "};

/**
 * Query generated from SQL:
 * ```
 * SELECT count(*)::int4 AS total
 * FROM approval_requests ar
 * WHERE (:search::text IS NULL OR ar.title ILIKE '%' || :search::text || '%' OR ar.description ILIKE '%' || :search::text || '%')
 *   AND (:projectId::int4 IS NULL OR ar.project_id = :projectId::int4)
 *   AND (:status::text IS NULL OR ar.status = :status::text)                                                                            
 * ```
 */
export const countApprovalRequests = new PreparedQuery<ICountApprovalRequestsParams,ICountApprovalRequestsResult>(countApprovalRequestsIR);


/** 'GetApprovalRequestById' parameters type */
export interface IGetApprovalRequestByIdParams {
  requestId?: number | null | void;
}

/** 'GetApprovalRequestById' return type */
export interface IGetApprovalRequestByIdResult {
  createdAt: Date;
  description: string;
  id: number;
  projectId: number;
  projectName: string;
  requesterId: number;
  requesterName: string;
  reviewComment: string | null;
  reviewedAt: Date | null;
  reviewerId: number | null;
  reviewerName: string;
  status: string;
  title: string;
  updatedAt: Date;
}

/** 'GetApprovalRequestById' query type */
export interface IGetApprovalRequestByIdQuery {
  params: IGetApprovalRequestByIdParams;
  result: IGetApprovalRequestByIdResult;
}

const getApprovalRequestByIdIR: any = {"usedParamSet":{"requestId":true},"params":[{"name":"requestId","required":false,"transform":{"type":"scalar"},"locs":[{"a":647,"b":656}]}],"statement":"SELECT\n    ar.id,\n    ar.project_id AS \"projectId\",\n    p.name AS \"projectName\",\n    ar.title,\n    ar.description,\n    ar.status,\n    ar.requester_id AS \"requesterId\",\n    requester.display_name AS \"requesterName\",\n    ar.reviewer_id AS \"reviewerId\",\n    reviewer.display_name AS \"reviewerName\",\n    ar.reviewed_at AS \"reviewedAt\",\n    ar.review_comment AS \"reviewComment\",\n    ar.created_at AS \"createdAt\",\n    ar.updated_at AS \"updatedAt\"\nFROM approval_requests ar\nINNER JOIN projects p ON p.id = ar.project_id\nINNER JOIN \"user\" requester ON requester.id = ar.requester_id\nLEFT JOIN \"user\" reviewer ON reviewer.id = ar.reviewer_id\nWHERE ar.id = :requestId::int4                                                                         "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ar.id,
 *     ar.project_id AS "projectId",
 *     p.name AS "projectName",
 *     ar.title,
 *     ar.description,
 *     ar.status,
 *     ar.requester_id AS "requesterId",
 *     requester.display_name AS "requesterName",
 *     ar.reviewer_id AS "reviewerId",
 *     reviewer.display_name AS "reviewerName",
 *     ar.reviewed_at AS "reviewedAt",
 *     ar.review_comment AS "reviewComment",
 *     ar.created_at AS "createdAt",
 *     ar.updated_at AS "updatedAt"
 * FROM approval_requests ar
 * INNER JOIN projects p ON p.id = ar.project_id
 * INNER JOIN "user" requester ON requester.id = ar.requester_id
 * LEFT JOIN "user" reviewer ON reviewer.id = ar.reviewer_id
 * WHERE ar.id = :requestId::int4                                                                         
 * ```
 */
export const getApprovalRequestById = new PreparedQuery<IGetApprovalRequestByIdParams,IGetApprovalRequestByIdResult>(getApprovalRequestByIdIR);


/** 'CreateApprovalRequest' parameters type */
export interface ICreateApprovalRequestParams {
  description?: string | null | void;
  projectId?: number | null | void;
  requesterId?: number | null | void;
  title?: string | null | void;
}

/** 'CreateApprovalRequest' return type */
export interface ICreateApprovalRequestResult {
  projectId: number;
  requestId: number;
}

/** 'CreateApprovalRequest' query type */
export interface ICreateApprovalRequestQuery {
  params: ICreateApprovalRequestParams;
  result: ICreateApprovalRequestResult;
}

const createApprovalRequestIR: any = {"usedParamSet":{"projectId":true,"title":true,"description":true,"requesterId":true},"params":[{"name":"projectId","required":false,"transform":{"type":"scalar"},"locs":[{"a":72,"b":81}]},{"name":"title","required":false,"transform":{"type":"scalar"},"locs":[{"a":232,"b":237}]},{"name":"description","required":false,"transform":{"type":"scalar"},"locs":[{"a":240,"b":251}]},{"name":"requesterId","required":false,"transform":{"type":"scalar"},"locs":[{"a":265,"b":276}]}],"statement":"WITH target_project AS (\n    SELECT id\n    FROM projects\n    WHERE id = :projectId::int4\n),\ncreated_request AS (\n    INSERT INTO approval_requests (project_id, title, description, status, requester_id)\n    SELECT target_project.id, :title, :description, 'PENDING', :requesterId::int4\n    FROM target_project\n    RETURNING id\n)\nSELECT\n    target_project.id AS \"projectId\",\n    created_request.id AS \"requestId\"\nFROM target_project\nLEFT JOIN created_request ON true                                                      "};

/**
 * Query generated from SQL:
 * ```
 * WITH target_project AS (
 *     SELECT id
 *     FROM projects
 *     WHERE id = :projectId::int4
 * ),
 * created_request AS (
 *     INSERT INTO approval_requests (project_id, title, description, status, requester_id)
 *     SELECT target_project.id, :title, :description, 'PENDING', :requesterId::int4
 *     FROM target_project
 *     RETURNING id
 * )
 * SELECT
 *     target_project.id AS "projectId",
 *     created_request.id AS "requestId"
 * FROM target_project
 * LEFT JOIN created_request ON true                                                      
 * ```
 */
export const createApprovalRequest = new PreparedQuery<ICreateApprovalRequestParams,ICreateApprovalRequestResult>(createApprovalRequestIR);


/** 'ReviewApprovalRequest' parameters type */
export interface IReviewApprovalRequestParams {
  nextStatus?: string | null | void;
  requestId?: number | null | void;
  reviewComment?: string | null | void;
  reviewerId?: number | null | void;
}

/** 'ReviewApprovalRequest' return type */
export interface IReviewApprovalRequestResult {
  id: number;
  reviewedId: number;
  status: string;
}

/** 'ReviewApprovalRequest' query type */
export interface IReviewApprovalRequestQuery {
  params: IReviewApprovalRequestParams;
  result: IReviewApprovalRequestResult;
}

const reviewApprovalRequestIR: any = {"usedParamSet":{"requestId":true,"nextStatus":true,"reviewerId":true,"reviewComment":true},"params":[{"name":"requestId","required":false,"transform":{"type":"scalar"},"locs":[{"a":89,"b":98}]},{"name":"nextStatus","required":false,"transform":{"type":"scalar"},"locs":[{"a":188,"b":198}]},{"name":"reviewerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":223,"b":233}]},{"name":"reviewComment","required":false,"transform":{"type":"scalar"},"locs":[{"a":296,"b":309}]}],"statement":"WITH target_request AS (\n    SELECT id, status\n    FROM approval_requests\n    WHERE id = :requestId::int4\n),\nreviewed_request AS (\n    UPDATE approval_requests ar\n    SET\n        status = :nextStatus,\n        reviewer_id = :reviewerId::int4,\n        reviewed_at = now(),\n        review_comment = :reviewComment,\n        updated_at = now()\n    FROM target_request\n    WHERE ar.id = target_request.id\n      AND target_request.status = 'PENDING'\n    RETURNING ar.id\n)\nSELECT\n    target_request.id,\n    target_request.status,\n    reviewed_request.id AS \"reviewedId\"\nFROM target_request\nLEFT JOIN reviewed_request ON true                                             "};

/**
 * Query generated from SQL:
 * ```
 * WITH target_request AS (
 *     SELECT id, status
 *     FROM approval_requests
 *     WHERE id = :requestId::int4
 * ),
 * reviewed_request AS (
 *     UPDATE approval_requests ar
 *     SET
 *         status = :nextStatus,
 *         reviewer_id = :reviewerId::int4,
 *         reviewed_at = now(),
 *         review_comment = :reviewComment,
 *         updated_at = now()
 *     FROM target_request
 *     WHERE ar.id = target_request.id
 *       AND target_request.status = 'PENDING'
 *     RETURNING ar.id
 * )
 * SELECT
 *     target_request.id,
 *     target_request.status,
 *     reviewed_request.id AS "reviewedId"
 * FROM target_request
 * LEFT JOIN reviewed_request ON true                                             
 * ```
 */
export const reviewApprovalRequest = new PreparedQuery<IReviewApprovalRequestParams,IReviewApprovalRequestResult>(reviewApprovalRequestIR);


/** 'GetDashboardCounts' parameters type */
export type IGetDashboardCountsParams = void;

/** 'GetDashboardCounts' return type */
export interface IGetDashboardCountsResult {
  activeProjectCount: number | null;
  inProgressTaskCount: number | null;
}

/** 'GetDashboardCounts' query type */
export interface IGetDashboardCountsQuery {
  params: IGetDashboardCountsParams;
  result: IGetDashboardCountsResult;
}

const getDashboardCountsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    (\n        SELECT count(*)::int4\n        FROM projects\n        WHERE status = 'ACTIVE'\n    ) AS \"activeProjectCount\",\n    (\n        SELECT count(*)::int4\n        FROM tasks\n        WHERE status = 'IN_PROGRESS'\n    ) AS \"inProgressTaskCount\"                                                            "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     (
 *         SELECT count(*)::int4
 *         FROM projects
 *         WHERE status = 'ACTIVE'
 *     ) AS "activeProjectCount",
 *     (
 *         SELECT count(*)::int4
 *         FROM tasks
 *         WHERE status = 'IN_PROGRESS'
 *     ) AS "inProgressTaskCount"                                                            
 * ```
 */
export const getDashboardCounts = new PreparedQuery<IGetDashboardCountsParams,IGetDashboardCountsResult>(getDashboardCountsIR);


/** 'ListDashboardMyTasks' parameters type */
export interface IListDashboardMyTasksParams {
  assigneeId?: number | null | void;
  limit?: number | null | void;
}

/** 'ListDashboardMyTasks' return type */
export interface IListDashboardMyTasksResult {
  assigneeId: number | null;
  assigneeName: string;
  createdAt: Date;
  createdById: number;
  createdByName: string;
  description: string;
  id: number;
  priority: string;
  projectId: number;
  projectName: string;
  status: string;
  title: string;
  updatedAt: Date;
}

/** 'ListDashboardMyTasks' query type */
export interface IListDashboardMyTasksQuery {
  params: IListDashboardMyTasksParams;
  result: IListDashboardMyTasksResult;
}

const listDashboardMyTasksIR: any = {"usedParamSet":{"assigneeId":true,"limit":true},"params":[{"name":"assigneeId","required":false,"transform":{"type":"scalar"},"locs":[{"a":564,"b":574}]},{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":799,"b":804}]}],"statement":"SELECT\n    t.id,\n    t.project_id AS \"projectId\",\n    p.name AS \"projectName\",\n    t.title,\n    t.description,\n    t.status,\n    t.priority,\n    t.assignee_id AS \"assigneeId\",\n    assignee.display_name AS \"assigneeName\",\n    t.created_by_id AS \"createdById\",\n    creator.display_name AS \"createdByName\",\n    t.created_at AS \"createdAt\",\n    t.updated_at AS \"updatedAt\"\nFROM tasks t\nINNER JOIN projects p ON p.id = t.project_id\nINNER JOIN \"user\" creator ON creator.id = t.created_by_id\nLEFT JOIN \"user\" assignee ON assignee.id = t.assignee_id\nWHERE t.assignee_id = :assigneeId::int4\n  AND t.status <> 'DONE'\nORDER BY\n    CASE t.status WHEN 'IN_PROGRESS' THEN 1 WHEN 'TODO' THEN 2 ELSE 3 END ASC,\n    CASE t.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC,\n    t.updated_at DESC\nLIMIT :limit::int4                                                                "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     t.id,
 *     t.project_id AS "projectId",
 *     p.name AS "projectName",
 *     t.title,
 *     t.description,
 *     t.status,
 *     t.priority,
 *     t.assignee_id AS "assigneeId",
 *     assignee.display_name AS "assigneeName",
 *     t.created_by_id AS "createdById",
 *     creator.display_name AS "createdByName",
 *     t.created_at AS "createdAt",
 *     t.updated_at AS "updatedAt"
 * FROM tasks t
 * INNER JOIN projects p ON p.id = t.project_id
 * INNER JOIN "user" creator ON creator.id = t.created_by_id
 * LEFT JOIN "user" assignee ON assignee.id = t.assignee_id
 * WHERE t.assignee_id = :assigneeId::int4
 *   AND t.status <> 'DONE'
 * ORDER BY
 *     CASE t.status WHEN 'IN_PROGRESS' THEN 1 WHEN 'TODO' THEN 2 ELSE 3 END ASC,
 *     CASE t.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC,
 *     t.updated_at DESC
 * LIMIT :limit::int4                                                                
 * ```
 */
export const listDashboardMyTasks = new PreparedQuery<IListDashboardMyTasksParams,IListDashboardMyTasksResult>(listDashboardMyTasksIR);


/** 'ListDashboardPendingRequests' parameters type */
export interface IListDashboardPendingRequestsParams {
  limit?: number | null | void;
}

/** 'ListDashboardPendingRequests' return type */
export interface IListDashboardPendingRequestsResult {
  createdAt: Date;
  description: string;
  id: number;
  projectId: number;
  projectName: string;
  requesterId: number;
  requesterName: string;
  reviewComment: string | null;
  reviewedAt: Date | null;
  reviewerId: number | null;
  reviewerName: string;
  status: string;
  title: string;
  updatedAt: Date;
}

/** 'ListDashboardPendingRequests' query type */
export interface IListDashboardPendingRequestsQuery {
  params: IListDashboardPendingRequestsParams;
  result: IListDashboardPendingRequestsResult;
}

const listDashboardPendingRequestsIR: any = {"usedParamSet":{"limit":true},"params":[{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":695,"b":700}]}],"statement":"SELECT\n    ar.id,\n    ar.project_id AS \"projectId\",\n    p.name AS \"projectName\",\n    ar.title,\n    ar.description,\n    ar.status,\n    ar.requester_id AS \"requesterId\",\n    requester.display_name AS \"requesterName\",\n    ar.reviewer_id AS \"reviewerId\",\n    reviewer.display_name AS \"reviewerName\",\n    ar.reviewed_at AS \"reviewedAt\",\n    ar.review_comment AS \"reviewComment\",\n    ar.created_at AS \"createdAt\",\n    ar.updated_at AS \"updatedAt\"\nFROM approval_requests ar\nINNER JOIN projects p ON p.id = ar.project_id\nINNER JOIN \"user\" requester ON requester.id = ar.requester_id\nLEFT JOIN \"user\" reviewer ON reviewer.id = ar.reviewer_id\nWHERE ar.status = 'PENDING'\nORDER BY ar.created_at DESC\nLIMIT :limit::int4                                                         "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     ar.id,
 *     ar.project_id AS "projectId",
 *     p.name AS "projectName",
 *     ar.title,
 *     ar.description,
 *     ar.status,
 *     ar.requester_id AS "requesterId",
 *     requester.display_name AS "requesterName",
 *     ar.reviewer_id AS "reviewerId",
 *     reviewer.display_name AS "reviewerName",
 *     ar.reviewed_at AS "reviewedAt",
 *     ar.review_comment AS "reviewComment",
 *     ar.created_at AS "createdAt",
 *     ar.updated_at AS "updatedAt"
 * FROM approval_requests ar
 * INNER JOIN projects p ON p.id = ar.project_id
 * INNER JOIN "user" requester ON requester.id = ar.requester_id
 * LEFT JOIN "user" reviewer ON reviewer.id = ar.reviewer_id
 * WHERE ar.status = 'PENDING'
 * ORDER BY ar.created_at DESC
 * LIMIT :limit::int4                                                         
 * ```
 */
export const listDashboardPendingRequests = new PreparedQuery<IListDashboardPendingRequestsParams,IListDashboardPendingRequestsResult>(listDashboardPendingRequestsIR);


/** 'ListDashboardRecentPosts' parameters type */
export interface IListDashboardRecentPostsParams {
  limit?: number | null | void;
}

/** 'ListDashboardRecentPosts' return type */
export interface IListDashboardRecentPostsResult {
  authorId: number;
  authorName: string;
  commentCount: number | null;
  content: string;
  createdAt: Date;
  id: number;
  title: string;
  updatedAt: Date;
  viewCount: number;
}

/** 'ListDashboardRecentPosts' query type */
export interface IListDashboardRecentPostsQuery {
  params: IListDashboardRecentPostsParams;
  result: IListDashboardRecentPostsResult;
}

const listDashboardRecentPostsIR: any = {"usedParamSet":{"limit":true},"params":[{"name":"limit","required":false,"transform":{"type":"scalar"},"locs":[{"a":414,"b":419}]}],"statement":"SELECT\n    p.id,\n    p.title,\n    p.content,\n    p.author_id AS \"authorId\",\n    u.display_name AS \"authorName\",\n    p.view_count AS \"viewCount\",\n    p.created_at AS \"createdAt\",\n    p.updated_at AS \"updatedAt\",\n    (\n        SELECT count(*)::int4\n        FROM comments c\n        WHERE c.post_id = p.id\n    ) AS \"commentCount\"\nFROM posts p\nINNER JOIN \"user\" u ON u.id = p.author_id\nORDER BY p.created_at DESC\nLIMIT :limit::int4"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     p.id,
 *     p.title,
 *     p.content,
 *     p.author_id AS "authorId",
 *     u.display_name AS "authorName",
 *     p.view_count AS "viewCount",
 *     p.created_at AS "createdAt",
 *     p.updated_at AS "updatedAt",
 *     (
 *         SELECT count(*)::int4
 *         FROM comments c
 *         WHERE c.post_id = p.id
 *     ) AS "commentCount"
 * FROM posts p
 * INNER JOIN "user" u ON u.id = p.author_id
 * ORDER BY p.created_at DESC
 * LIMIT :limit::int4
 * ```
 */
export const listDashboardRecentPosts = new PreparedQuery<IListDashboardRecentPostsParams,IListDashboardRecentPostsResult>(listDashboardRecentPostsIR);


