import { useEffect, useMemo, useState } from "react";
import { api, type RouterOutputs } from "../../utils/api";
import { getDurationString } from "./get-duration";
import TimeTrackingEditRow from "./time-tracking-edit-row";
import TimeTrackingTableViewRow from "./time-tracking-table-view-row";
import { useAutoAnimate } from '@formkit/auto-animate/react'

type TimeTrackings = RouterOutputs["timeTrackings"]["getOwn"];
type TimeTracking = TimeTrackings[0];
type Projects = RouterOutputs["projects"]["getAll"];
type Task = RouterOutputs["tasks"]["getAll"];
type TimeTrackingWithDuration = TimeTracking & { duration: string };

interface TimeTrackingTableProps {
  timeTrackings: TimeTrackings;
  projects: Projects;
  tasks: Task;
}

const TimeTrackingTable = ({
  timeTrackings,
  projects,
  tasks,
}: TimeTrackingTableProps): JSX.Element => {
  const timeTrackingsWithDuration = useMemo(
    () =>
      timeTrackings.map((timeTracking) => ({
        ...timeTracking,
        duration: getDurationString(timeTracking.start, timeTracking.end),
      })),
    [timeTrackings]
  );

  const [editTimeTrackingId, setEditTimeTrackingId] = useState("");
  const [timeTrackingsState, setTimeTrackingsState] = useState<
    TimeTrackingWithDuration[]
  >(timeTrackingsWithDuration);
  const [animationParent] = useAutoAnimate();

  useEffect(() => {
    setTimeTrackingsState(timeTrackingsWithDuration);
  }, [timeTrackingsWithDuration]);

  const utils = api.useContext();

  const updateTimeTrackingMutation = api.timeTrackings.update.useMutation({
    onMutate: async ({ id, projectId, taskId, description, start, end }) => {
      await utils.timeTrackings.getOwn.cancel();
      const previousTimeTrackings = utils.timeTrackings.getOwn.getData();
      const existingTimeTracking = previousTimeTrackings?.find(
        (timeTracking) => timeTracking.id === id
      );

      // If it was existing, and it was running, then we need to update the running time tracking
      if (existingTimeTracking && existingTimeTracking.end === null && end) {
        await utils.timeTrackings.getRunning.cancel();
        utils.timeTrackings.getRunning.setData(undefined, () => {
          return (undefined);
        });
      }

      // Update the time tracking in the cache
      utils.timeTrackings.getOwn.setData(undefined, (data) => {
        return (
          data?.map((timeTracking) => {
            if (timeTracking.id === id) {
              return {
                ...timeTracking,
                projectId: projectId,
                taskId: taskId,
                description: description ?? null,
                start: start,
                end: end,
              };
            } else {
              return timeTracking;
            }
          }) ?? []
        );
      });
    },
    onSettled: async () => {
      await utils.timeTrackings.getOwn.invalidate();
      await utils.timeTrackings.getRunning.invalidate();
    },
  });

  const handleUpdate = (timeTracking: TimeTracking) => {
    if (!timeTracking.projectId || !timeTracking.taskId) {
      return;
    }
    updateTimeTrackingMutation.mutate({
      id: timeTracking.id,
      projectId: timeTracking.projectId,
      taskId: timeTracking.taskId,
      description: timeTracking.description ?? undefined,
      start: timeTracking.start,
      end: timeTracking.end,
    });
    setEditTimeTrackingId("");
  };

  const handleEdit = (timeTracking: TimeTracking) => {
    setEditTimeTrackingId(timeTracking.id);
  };

  useEffect(() => {
    const handle = setInterval(() => {
      // Update the duration every second
      setTimeTrackingsState(
        timeTrackingsState.map((timeTracking) => {
          timeTracking.duration = getDurationString(
            timeTracking.start,
            timeTracking.end
          );
          return timeTracking;
        })
      );
    }, 1000);
    return () => clearInterval(handle);
  });

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Project</th>
          <th>Task</th>
          <th>Description</th>
          <th>Start</th>
          <th>End</th>
          <th>Duration</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody ref={animationParent}>
        {timeTrackingsState.map((timeTracking) => {
          if (timeTracking.id !== editTimeTrackingId) {
            return (
              <TimeTrackingTableViewRow
                key={timeTracking.id}
                onEdit={handleEdit}
                timeTracking={timeTracking}
              />
            );
          } else {
            return (
              <TimeTrackingEditRow
                key={timeTracking.id}
                timeTracking={timeTracking}
                projects={projects}
                tasks={tasks}
                onSaved={handleUpdate}
                onCancel={() => setEditTimeTrackingId("")}
              />
            );
          }
        })}
      </tbody>
    </table>
  );
};

export default TimeTrackingTable;
