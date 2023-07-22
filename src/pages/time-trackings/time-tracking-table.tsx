// TimeTrackingTable.tsx
import React from "react";
import TimeTrackingRow from "./time-tracking-row";
import type { RouterOutputs } from "../../utils/api";

type TimeTrackings = RouterOutputs["timeTrackings"]["getOwn"];
type Projects = RouterOutputs["projects"]["getAll"];
type Tasks = RouterOutputs["tasks"]["getAll"];

interface TimeTrackingTableProps {
  timeTrackings: TimeTrackings;
  projects: Projects;
  tasks: Tasks;
  editTimeTrackingId: string;
  setEditTimeTrackingId: React.Dispatch<React.SetStateAction<string>>;
  editTimeTrackingProjectId: string;
  setEditTimeTrackingProjectId: React.Dispatch<React.SetStateAction<string>>;
  editTimeTrackingTaskId: string;
  setEditTimeTrackingTaskId: React.Dispatch<React.SetStateAction<string>>;
  editTimeTrackingDate: string;
  setEditTimeTrackingDate: React.Dispatch<React.SetStateAction<string>>;
  editTimeTrackingStart: string;
  setEditTimeTrackingStart: React.Dispatch<React.SetStateAction<string>>;
  editTimeTrackingEnd: string;
  setEditTimeTrackingEnd: React.Dispatch<React.SetStateAction<string>>;
}

const TimeTrackingTable: React.FC<TimeTrackingTableProps> = ({
  timeTrackings,
  projects,
  tasks,
  editTimeTrackingId,
  setEditTimeTrackingId,
  editTimeTrackingProjectId,
  setEditTimeTrackingProjectId,
  editTimeTrackingTaskId,
  setEditTimeTrackingTaskId,
  editTimeTrackingDate,
  setEditTimeTrackingDate,
  editTimeTrackingStart,
  setEditTimeTrackingStart,
  editTimeTrackingEnd,
  setEditTimeTrackingEnd,
}) => {
  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>Date</th>
          <th>Project</th>
          <th>Task</th>
          <th>Start</th>
          <th>End</th>
          <th>Duration</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {timeTrackings.map((timeTracking) => (
          <TimeTrackingRow
            key={timeTracking.id}
            timeTracking={timeTracking}
            projects={projects}
            tasks={tasks}
            editTimeTrackingId={editTimeTrackingId}
            setEditTimeTrackingId={setEditTimeTrackingId}
            editTimeTrackingProjectId={editTimeTrackingProjectId}
            setEditTimeTrackingProjectId={setEditTimeTrackingProjectId}
            editTimeTrackingTaskId={editTimeTrackingTaskId}
            setEditTimeTrackingTaskId={setEditTimeTrackingTaskId}
            editTimeTrackingDate={editTimeTrackingDate}
            setEditTimeTrackingDate={setEditTimeTrackingDate}
            editTimeTrackingStart={editTimeTrackingStart}
            setEditTimeTrackingStart={setEditTimeTrackingStart}
            editTimeTrackingEnd={editTimeTrackingEnd}
            setEditTimeTrackingEnd={setEditTimeTrackingEnd}
          />
        ))}
      </tbody>
    </table>
  );
};

export default TimeTrackingTable;