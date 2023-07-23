import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRef, useState } from "react";
import { api } from "../../utils/api";

const TasksPage = () => {
  const [name, setName] = useState("");

  useSession({
    required: true,
  });

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const newNameRef = useRef<HTMLInputElement>(null);

  const handleEditClick = (projectId: string) => {
    setEditingTaskId(projectId);
  };

  const handleCancelClick = () => {
    setEditingTaskId(null);
  };

  const handleSaveClick = (projectId: string, newName: string) => {
    updateTask.mutate({ id: projectId, name: newName });
    setEditingTaskId(null);
  };

  const utils = api.useContext();
  const tasksQuery = api.tasks.getAll.useQuery();
  const createTask = api.tasks.create.useMutation({
    onMutate: async (task) => {
      await utils.tasks.getAll.cancel();
      utils.tasks.getAll.setData(undefined, (prev) => {
        const newProject = {
          ...task,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return prev ? [...prev, newProject] : [newProject];
      });
    },
    onSettled: async () => {
      await utils.tasks.getAll.invalidate();
    },
  });
  const deleteTask = api.tasks.delete.useMutation({
    onMutate: async (id) => {
      await utils.tasks.getAll.cancel();
      utils.tasks.getAll.setData(undefined, (prev) => {
        return prev?.filter((project) => project.id !== id);
      });
    },
    onSettled: async () => {
      await utils.tasks.getAll.invalidate();
    },
  });
  const updateTask = api.tasks.update.useMutation({
    onMutate: async (task) => {
      await utils.tasks.getAll.cancel();
      utils.tasks.getAll.setData(undefined, (prev) => {
        return prev?.map((prevProject) =>
          prevProject.id === task.id
            ? { ...prevProject, ...task, updatedAt: new Date() }
            : prevProject
        );
      });
    },
    onSettled: async () => {
      await utils.tasks.getAll.invalidate();
    },
  });

  return (
    <>
      <Head>
        <title>Tasks</title>
        <meta name="description" content="Tasks" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Tasks" />
        <meta property="og:description" content="Tasks" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://timetracker.jan-krueger.eu/" />
        <meta property="og:image" content="/og-image.png" />
      </Head>
      <div className="flex flex-col gap-4">
        <h1 className="gradient-text ml-3 text-4xl font-bold">Tasks</h1>
        <table className="table mt-8">
          <thead>
            <tr>
              <th>Task</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  type="text"
                  className="input input-bordered input-primary input-sm"
                  placeholder="Task Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </td>
              <td></td>
              <td></td>
              <td>
                <button
                  className="btn btn-primary btn-xs"
                  onClick={() => createTask.mutate({ name })}
                >
                  Create
                </button>
              </td>
            </tr>
            {tasksQuery.data?.map((task) => (
              <tr key={task.id}>
                <td>
                  {editingTaskId === task.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveClick(
                          task.id,
                          newNameRef.current?.value ?? ""
                        );
                      }}
                    >
                      <input
                        type="text"
                        className="input input-bordered input-primary input-sm"
                        name="name"
                        defaultValue={task.name}
                        autoFocus
                        ref={newNameRef}
                      />
                    </form>
                  ) : (
                    task.name
                  )}
                </td>
                <td>{task.createdAt.toLocaleDateString()}</td>
                <td>{task.updatedAt.toLocaleDateString()}</td>
                <td className="flex gap-2">
                  {editingTaskId === task.id ? (
                    <>
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() =>
                          handleSaveClick(
                            task.id,
                            newNameRef.current?.value ?? ""
                          )
                        }
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-error btn-xs"
                        onClick={() => handleCancelClick()}
                      >
                        Discard
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => handleEditClick(task.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-error btn-xs"
                        onClick={() => deleteTask.mutate(task.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TasksPage;
