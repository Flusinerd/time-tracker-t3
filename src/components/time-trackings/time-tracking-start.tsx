import { useEffect, useState } from "react";
import { type RouterOutputs, api } from "../../utils/api";

type Projects = RouterOutputs["projects"]["getAll"];
type Tasks = RouterOutputs["tasks"]["getAll"];
type TimeTracking = RouterOutputs["timeTrackings"]["getRunning"];

interface TimeTrackingStartStopProps {
  projects: Projects;
  tasks: Tasks;
  runningTimeTracking: TimeTracking;
}

const TimeTrackingStartStop = ({
  projects,
  tasks,
  runningTimeTracking,
}: TimeTrackingStartStopProps): JSX.Element => {
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [description, setDescription] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (runningTimeTracking) {
      const { projectId, taskId, description } = runningTimeTracking;
      setIsTracking(!runningTimeTracking.end);
      setProjectId(projectId ?? "");
      setTaskId(taskId ?? "");
      setDescription((description as string) ?? "");
    } else {
      setIsTracking(false);
      setProjectId("");
      setTaskId("");
      setDescription("");
    }
  }, [runningTimeTracking]);

  const utils = api.useContext();
  const stopTimeTrackingMutation = api.timeTrackings.stop.useMutation({
    onMutate: async ({ projectId, taskId }) => {
      await utils.timeTrackings.getRunning.cancel();
      const existing = utils.timeTrackings.getRunning.getData();
      utils.timeTrackings.getRunning.setData(undefined, () => ({
        createdAt: new Date(),
        description: "",
        projectId: projectId,
        taskId: taskId,
        end: new Date(),
        id: existing?.id ?? "new",
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

  const startTimeTrackingMutation = api.timeTrackings.start.useMutation({
    onMutate: async ({ projectId, taskId, description }) => {
      await utils.timeTrackings.getRunning.cancel();
      const start = new Date();
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
    },
    onSettled: async () => {
      await utils.timeTrackings.getRunning.invalidate();
      await utils.timeTrackings.getOwn.invalidate();
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    switch (e.target.name) {
      case "project":
        setProjectId(e.target.value);
        break;
      case "task":
        setTaskId(e.target.value);
        break;
      case "description":
        setDescription(e.target.value);
        break;
    }
  };

  return (
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
          {projects.map((project) => (
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
          {tasks.map((task) => (
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
  );
};

export default TimeTrackingStartStop;
