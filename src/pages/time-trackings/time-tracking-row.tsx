import React, { useState } from "react";
import type { RouterOutputs } from "../../utils/api";
import dayjs from "dayjs";

type TimeTracking = RouterOutputs["timeTrackings"]["getOwn"][0];
type Projects = RouterOutputs["projects"]["getAll"]
type Tasks = RouterOutputs["tasks"]["getAll"]

interface TimeTrackingRowProps {
  timeTracking: TimeTracking;
  projects: Projects;
  tasks: Tasks;
  onUpdateTimeTracking: (id: string, data: Partial<TimeTracking>) => void;
}

const TimeTrackingRow: React.FC<TimeTrackingRowProps> = ({
  timeTracking,
  projects,
  tasks,
  onUpdateTimeTracking,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    projectId: timeTracking.projectId,
    taskId: timeTracking.taskId,
    description: timeTracking.description,
    start: timeTracking.start,
    end: timeTracking.end,
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    onUpdateTimeTracking(timeTracking.id, editData);
    setIsEditing(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (name === "date") {
      console.log(value)
      const startDate = getStartDate(editData.start.toLocaleTimeString(), value);
      console.log("startDate", startDate);
      const endDate = getEndDate(editData.end?.toLocaleTimeString() ?? "", value, editData.start.toLocaleTimeString());
      setEditData((prevData) => ({
        ...prevData,
        start: startDate,
        end: endDate,
      }));
    } else {
      setEditData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  if (isEditing) {
    return (
      <tr>
        <td>
          <input
            className="input input-bordered"
            type="date"
            name="date"
            value={dayjs(timeTracking.start).format("YYYY-MM-DD")}
            onChange={handleInputChange}
          />
        </td>
        <td>
          <select
            className="select select-bordered"
            name="projectId"
            value={editData.projectId ?? ""}
            onChange={handleInputChange}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </td>
        <td>
          <select
            className="select select-bordered"
            name="taskId"
            value={editData.taskId ?? ""}
            onChange={handleInputChange}
          >
            <option value="">Select a task</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </td>
        <td>
          <input
            className="input input-bordered"
            type="text"
            name="description"
            value={editData.description ?? ""}
            onChange={handleInputChange}
          />
        </td>
        <td>
          <input
            className="input input-bordered"
            type="time"
            name="start"
            value={editData.start.toLocaleTimeString()}
            onChange={handleInputChange}
          />
        </td>
        <td>
          <input
            className="input input-bordered"
            type="time"
            name="end"
            value={editData.end?.toLocaleTimeString() ?? ""}
            onChange={handleInputChange}
          />
        </td>
        <td>
          {getEditDuration(
            editData.start.toLocaleTimeString(),
            editData.end?.toLocaleTimeString(),
            dayjs(timeTracking.start).format("YYYY-MM-DD")
          )}
        </td>
        <td>
          <button className="btn btn-primary btn-xs" onClick={handleSaveClick}>
            Save
          </button>
          <button
            className="btn btn-error btn-xs ml-2"
            onClick={handleCancelClick}
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{timeTracking.Project?.name}</td>
      <td>{timeTracking.Task?.name}</td>
      <td>{timeTracking.description}</td>
      <td>{timeTracking.start.toLocaleTimeString()}</td>
      <td>{timeTracking.end?.toLocaleTimeString() ?? "-"}</td>
      <td>{getDuration(timeTracking.start, timeTracking.end)}</td>
      <td>
        <button className="btn btn-primary btn-xs" onClick={handleEditClick}>
          Edit
        </button>
      </td>
    </tr>
  );
};

const getStartDate = (start: string, date: string) => {
  return dayjs(`${date} ${start}`).toDate();
};

const getEndDate = (end: string, date: string, start: string) => {
  // End needs to be after start, it could be the next day
  return dayjs(`${date} ${end}`).isAfter(dayjs(`${date} ${start}`))
    ? dayjs(`${date} ${end}`).toDate()
    : dayjs(`${date} ${end}`).add(1, "day").toDate();
};

const getEditDuration = (
  start: string,
  end: string | undefined,
  date: string
): JSX.Element => {
  const startDate = getStartDate(start, date);
  if (!end) {
    return getDuration(startDate, null);
  }
  const endDate = getEndDate(end, date, start);
  return getDuration(startDate, endDate);
};

const getDuration = (start: Date, end: Date | null): JSX.Element => {
  if (!end) {
  }
  const startDayjs = dayjs(start);
  const endDayjs = dayjs(end);
  const duration = dayjs.duration(endDayjs.diff(startDayjs));
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  // return in format HH:MM:SS
  return (
    <span>
      {hours < 10 ? `0${hours}` : hours}:
      {minutes < 10 ? `0${minutes}` : minutes}:
      {seconds < 10 ? `0${seconds}` : seconds}
    </span>
  );
};

export default TimeTrackingRow;
