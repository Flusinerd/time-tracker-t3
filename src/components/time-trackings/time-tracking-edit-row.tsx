import { useEffect, useState } from "react";
import { type RouterOutputs } from "../../utils/api";
import { getEditDuration, getEndDate, getStartDate } from "./get-duration";
import dayjs from "dayjs";

type TimeTracking = RouterOutputs["timeTrackings"]["getOwn"][0];
type TimeTrackingWithDuration = TimeTracking & { duration: string };
type Projects = RouterOutputs["projects"]["getAll"];
type Tasks = RouterOutputs["tasks"]["getAll"];

interface TimeTrackingEditRowProps {
  timeTracking: TimeTrackingWithDuration;
  projects: Projects;
  tasks: Tasks;
  onSaved: (timeTracking: TimeTracking) => void;
  onCancel: () => void;
}

const TimeTrackingEditRow = ({
  timeTracking,
  tasks,
  projects,
  onSaved,
  onCancel,
}: TimeTrackingEditRowProps): JSX.Element => {
  const [editTimeTrackingDate, setEditTimeTrackingDate] = useState("");
  const [editTimeTrackingProjectId, setEditTimeTrackingProjectId] =
    useState("");
  const [editTimeTrackingTaskId, setEditTimeTrackingTaskId] = useState("");
  const [editTimeTrackingDescription, setEditTimeTrackingDescription] =
    useState("");
  const [editTimeTrackingStart, setEditTimeTrackingStart] = useState("");
  const [editTimeTrackingEnd, setEditTimeTrackingEnd] = useState("");

  useEffect(() => {
    const startDayjs = dayjs(timeTracking.start);
    const endDayjs = timeTracking.end ? dayjs(timeTracking.end) : null;
    setEditTimeTrackingDate(startDayjs.format("YYYY-MM-DD"));
    setEditTimeTrackingProjectId(timeTracking.projectId ?? "");
    setEditTimeTrackingTaskId(timeTracking.taskId ?? "");
    setEditTimeTrackingDescription(timeTracking.description ?? "");
    setEditTimeTrackingStart(startDayjs.format("HH:mm:ss"));
    setEditTimeTrackingEnd(endDayjs?.format("HH:mm:ss") ?? "");
  }, [
    timeTracking.start,
    timeTracking.end,
    timeTracking.projectId,
    timeTracking.taskId,
    timeTracking.description,
  ]);

  const handleSave = () => {
    const newTimeTracking: TimeTracking = {
      ...timeTracking,
      projectId: editTimeTrackingProjectId,
      taskId: editTimeTrackingTaskId,
      description: editTimeTrackingDescription,
      start: getStartDate(editTimeTrackingStart, editTimeTrackingDate),
      end: getEndDate(
        editTimeTrackingEnd,
        editTimeTrackingDate,
        editTimeTrackingStart
      ),
    };
    onSaved(newTimeTracking);
  };

  return (
    <tr key={timeTracking.id}>
      <td>
        <input
          type="date"
          className="input input-bordered input-xs"
          name="date"
          value={editTimeTrackingDate}
          onChange={(e) => setEditTimeTrackingDate(e.target.value)}
        />
      </td>
      <td>
        <select
          className="select select-bordered select-xs"
          name="project"
          id="project-select"
          value={editTimeTrackingProjectId}
          onChange={(e) => setEditTimeTrackingProjectId(e.target.value)}
        >
          <option disabled value={""}>
            Please select a Project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </td>
      <td>
        <select
          className="select select-bordered select-xs"
          name="task"
          id="task-select"
          value={editTimeTrackingTaskId}
          onChange={(e) => setEditTimeTrackingTaskId(e.target.value)}
        >
          <option disabled value={""}>
            Please select a Task
          </option>
          {tasks?.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          type="text"
          className="input input-bordered input-xs"
          placeholder="Implemented login functionality for Project X"
          name="description"
          value={editTimeTrackingDescription}
          onChange={(e) => setEditTimeTrackingDescription(e.target.value)}
          id="description-input"
        ></input>
      </td>
      <td>
        <input
          type="time"
          className="input input-bordered input-xs"
          name="start"
          step={1}
          value={editTimeTrackingStart}
          onChange={(e) => setEditTimeTrackingStart(e.target.value)}
        ></input>
      </td>
      <td>
        <input
          type="time"
          className="input input-bordered input-xs"
          name="end"
          step={1}
          value={editTimeTrackingEnd}
          onChange={(e) => setEditTimeTrackingEnd(e.target.value)}
        ></input>
      </td>
      <td>
        {getEditDuration(
          editTimeTrackingStart,
          editTimeTrackingEnd,
          editTimeTrackingDate
        )}
      </td>
      <td className="">
        <button
          className="btn btn-error btn-xs mr-2"
          onClick={() => onCancel()}
        >
          Cancel
        </button>
        <button className="btn btn-primary btn-xs" onClick={() => handleSave()}>
          Save
        </button>
      </td>
    </tr>
  );
};

export default TimeTrackingEditRow;
