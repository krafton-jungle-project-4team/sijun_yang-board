import type { TaskStatus } from "@nmm/shared";
import { ToggleGroup, ToggleGroupItem } from "@nmm/ui/components";

import { taskStatusLabels } from "@/features/projects/model/project-labels";

const taskStatuses = ["TODO", "IN_PROGRESS", "DONE"] as const;

type TaskStatusControlProps = {
    disabled: boolean;
    status: TaskStatus;
    onChange: (status: TaskStatus) => void;
};

export function TaskStatusControl({ disabled, status, onChange }: TaskStatusControlProps) {
    function handleValueChange(value: string) {
        if (!isTaskStatus(value)) {
            return;
        }

        onChange(value);
    }

    return (
        <ToggleGroup
            type="single"
            value={status}
            variant="outline"
            disabled={disabled}
            onValueChange={handleValueChange}
        >
            {taskStatuses.map((taskStatus) => (
                <ToggleGroupItem key={taskStatus} value={taskStatus}>
                    {taskStatusLabels[taskStatus]}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}

function isTaskStatus(value: string): value is TaskStatus {
    return taskStatuses.some((status) => status === value);
}
