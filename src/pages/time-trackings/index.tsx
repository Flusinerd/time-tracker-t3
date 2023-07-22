import { useEffect, useState } from "react";
import { type RouterOutputs, api } from "../../utils/api";
import dayjs from "dayjs";

const TimeTrackingsPage = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [description, setDescription] = useState("");
  const [editTimeTrackingId, setEditTimeTrackingId] = useState("");
  const [editTimeTrackingProjectId, setEditTimeTrackingProjectId] =
    useState("");
  const [editTimeTrackingTaskId, setEditTimeTrackingTaskId] = useState("");
  const [editTimeTrackingDescription, setEditTimeTrackingDescription] =
    useState("");
  const [editTimeTrackingStart, setEditTimeTrackingStart] = useState("");
  const [editTimeTrackingEnd, setEditTimeTrackingEnd] = useState("");
  const [editTimeTrackingDate, setEditTimeTrackingDate] = useState("");
  const [timeTrackings, setTimeTrackings] = useState<
    Array<RouterOutputs["timeTrackings"]["getOwn"][0] & { duration: string }>
  >([]);

  const utils = api.useContext();

  const tasksQuery = api.tasks.getAll.useQuery();
  const projectsQuery = api.projects.getAll.useQuery();
  const runningTimeTrackingQuery = api.timeTrackings.getRunning.useQuery();
  const startTimeTrackingMutation = api.timeTrackings.start.useMutation({
    onMutate: async ({ projectId, taskId, description }) => {
      await utils.timeTrackings.getRunning.cancel();
      const project = projectsQuery.data?.find(
        (project) => project.id === projectId
      );
      const start = new Date();
      const task = tasksQuery.data?.find((task) => task.id === taskId);
      utils.timeTrackings.getRunning.setData(undefined, () => ({
        createdAt: new Date(),
        description: description ?? "",
        projectId: projectId,
        taskId: taskId,
        end: null,
        id: "new",
        start,
        updatedAt: new Date(),
        userId: "",
      }));
      if (!project || !task) {
        return;
      }
      await utils.timeTrackings.getOwn.cancel();
      utils.timeTrackings.getOwn.setData(undefined, (data) => {
        const created: RouterOutputs["timeTrackings"]["getOwn"][0] = {
          createdAt: new Date(),
          description: description ?? "",
          projectId: projectId,
          taskId: taskId,
          Project: project,
          Task: task,
          end: null,
          id: "new123",
          start,
          updatedAt: new Date(),
          userId: "",
        };
        return [
          created,
          ...(data ?? []),
        ] as RouterOutputs["timeTrackings"]["getOwn"];
      });
    },
    onSettled: async () => {
      await utils.timeTrackings.getRunning.invalidate();
      await utils.timeTrackings.getOwn.invalidate();
    },
  });
  const stopTimeTrackingMutation = api.timeTrackings.stop.useMutation({
    onMutate: async ({ projectId, taskId }) => {
      await utils.timeTrackings.getRunning.cancel();
      utils.timeTrackings.getRunning.setData(undefined, () => ({
        createdAt: new Date(),
        description: "",
        projectId: projectId,
        taskId: taskId,
        end: new Date(),
        id: "new123",
        start: new Date(),
        updatedAt: new Date(),
        userId: "",
      }));
      await utils.timeTrackings.getOwn.cancel();
    },
    onSettled: async () => {
      await utils.timeTrackings.getRunning.invalidate();
      await utils.timeTrackings.getOwn.invalidate();
    },
  });

  const deleteTimeTrackingMutation = api.timeTrackings.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.timeTrackings.getOwn.cancel();
      // Remove the deleted time tracking from the cache
      utils.timeTrackings.getOwn.setData(undefined, (data) => {
        if (data) {
          return data.filter((timeTracking) => timeTracking.id !== id);
        }
      });
    },
    onSettled: async () => {
      await utils.timeTrackings.getOwn.invalidate();
    },
  });

  const updateTimeTrackingMutation = api.timeTrackings.update.useMutation({
    onMutate: async ({ id, projectId, taskId, description, start, end }) => {
      await utils.timeTrackings.getOwn.cancel();
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
    },
  });

  const getOwnTimeTrackingsQuery = api.timeTrackings.getOwn.useQuery();

  useEffect(() => {
    const data = runningTimeTrackingQuery.data;
    if (data) {
      const { projectId, taskId, description } = data;
      console.log("data", data);
      setIsTracking(!data.end);
      setProjectId(projectId ?? "");
      setTaskId(taskId ?? "");
      setDescription((description as string) ?? "");
    }
  }, [runningTimeTrackingQuery.data]);

  useEffect(() => {
    // Get the time trackings of the user
    if (getOwnTimeTrackingsQuery.data) {
      const data = getOwnTimeTrackingsQuery.data;
      setTimeTrackings(
        data.map((timeTracking) => {
          return {
            ...timeTracking,
            duration: getDurationString(timeTracking.start, timeTracking.end),
          };
        })
      );
    }
  }, [getOwnTimeTrackingsQuery.data]);

  // Update the duration of all time trackings, that have no end date every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTrackings((timeTrackings) => {
        return timeTrackings.map((timeTracking) => {
          if (!timeTracking.end) {
            return {
              ...timeTracking,
              duration: getDurationString(timeTracking.start, null),
            };
          } else {
            return timeTracking;
          }
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "project") {
      setProjectId(value);
    } else if (name === "task") {
      setTaskId(value);
    } else if (name === "description") {
      setDescription(value);
    } else {
      console.log("Error: Unknown input name");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <style jsx>{`
        td {
          vertical-align: middle;
        }
      `}</style>
      <h1 className="gradient-text ml-3 pb-1 text-4xl font-bold">
        Time Trackings
      </h1>
      <form
        className="flex items-end gap-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="form-control">
          <label className="label" htmlFor="project-select">
            Project
          </label>
          <select
            className="select select-bordered"
            name="project"
            id="project-select"
            value={projectId}
            onChange={(e) => handleInputChange(e)}
          >
            <option disabled value={""}>
              Please select a Project
            </option>
            {projectsQuery.data?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control">
          <label className="label" htmlFor="task-select">
            Task
          </label>
          <select
            className="select select-bordered"
            name="task"
            id="task-select"
            value={taskId}
            onChange={(e) => handleInputChange(e)}
          >
            <option disabled value={""}>
              Please select a Task
            </option>
            {tasksQuery.data?.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control">
          <label className="label" htmlFor="description-input">
            Description
          </label>
          <input
            type="text"
            className="input input-bordered"
            placeholder="Implemented login functionality for Project X"
            name="description"
            value={description}
            onChange={(e) => handleInputChange(e)}
            id="description-input"
          ></input>
        </div>
        {isTracking ? (
          <button
            className="btn btn-error btn-outline"
            onClick={() => {
              stopTimeTrackingMutation.mutate({
                projectId: projectId,
                taskId: taskId,
              });
            }}
            type="submit"
          >
            Stop tracking
          </button>
        ) : (
          <button
            type="submit"
            className="btn-outline-gradient btn"
            onClick={() => {
              startTimeTrackingMutation.mutate({
                projectId: projectId,
                taskId: taskId,
                description: description,
              });
            }}
            disabled={projectId === "" || taskId === ""}
          >
            <span className="gradient-text">Start tracking</span>
          </button>
        )}
      </form>
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
        <tbody>
          {timeTrackings.map((timeTracking) => {
            if (timeTracking.id !== editTimeTrackingId) {
              return (
                <tr key={timeTracking.id}>
                  <td suppressHydrationWarning>
                    {timeTracking.start.toLocaleDateString()}
                  </td>
                  <td>{timeTracking.Project?.name}</td>
                  <td>{timeTracking.Task?.name}</td>
                  <td>{timeTracking.description}</td>
                  <td suppressHydrationWarning>
                    {timeTracking.start.toLocaleTimeString()}
                  </td>
                  <td suppressHydrationWarning>
                    {timeTracking.end?.toLocaleTimeString() ?? "-"}
                  </td>
                  <td>{timeTracking.duration}</td>
                  <td className="">
                    <button
                      className="btn btn-error btn-xs mr-2"
                      onClick={() =>
                        deleteTimeTrackingMutation.mutate({
                          id: timeTracking.id,
                        })
                      }
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => {
                        setEditTimeTrackingId(timeTracking.id);
                        setEditTimeTrackingProjectId(
                          timeTracking.projectId ?? ""
                        );
                        setEditTimeTrackingTaskId(timeTracking.taskId ?? "");
                        setEditTimeTrackingDescription(
                          timeTracking.description ?? ""
                        );
                        setEditTimeTrackingStart(
                          timeTracking.start.toLocaleTimeString()
                        );
                        setEditTimeTrackingEnd(
                          timeTracking.end?.toLocaleTimeString() ?? ""
                        );
                        setEditTimeTrackingDate(
                          dayjs(timeTracking.start).format("YYYY-MM-DD")
                        );
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            } else {
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
                      onChange={(e) =>
                        setEditTimeTrackingProjectId(e.target.value)
                      }
                    >
                      <option disabled value={""}>
                        Please select a Project
                      </option>
                      {projectsQuery.data?.map((project) => (
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
                      onChange={(e) =>
                        setEditTimeTrackingTaskId(e.target.value)
                      }
                    >
                      <option disabled value={""}>
                        Please select a Task
                      </option>
                      {tasksQuery.data?.map((task) => (
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
                      onChange={(e) =>
                        setEditTimeTrackingDescription(e.target.value)
                      }
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
                      onClick={() => setEditTimeTrackingId("")}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => {
                        updateTimeTrackingMutation.mutate({
                          id: timeTracking.id,
                          projectId: editTimeTrackingProjectId,
                          taskId: editTimeTrackingTaskId,
                          description: editTimeTrackingDescription,
                          start: getStartDate(
                            editTimeTrackingStart,
                            editTimeTrackingDate
                          ),
                          end: getEndDate(
                            editTimeTrackingEnd,
                            editTimeTrackingDate,
                            editTimeTrackingStart
                          ),
                        });
                        setEditTimeTrackingId("");
                      }}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
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
  end: string,
  date: string
): JSX.Element => {
  const startDate = getStartDate(start, date);
  const endDate = getEndDate(end, date, start);
  return getDuration(startDate, endDate);
};

const getDurationString = (start: Date, end: Date | null): string => {
  if (!end) {
    end = new Date();
  }
  const startDayjs = dayjs(start);
  const endDayjs = dayjs(end);
  const duration = dayjs.duration(endDayjs.diff(startDayjs));
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  // return in format HH:MM:SS
  return `${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  }:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const getDuration = (start: Date, end: Date | null): JSX.Element => {
  if (!end) {
    end = new Date();
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

export default TimeTrackingsPage;
