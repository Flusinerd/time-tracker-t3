import { useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { api } from "../../utils/api";

const TasksPage = () => {
  const [name, setName] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  useSession({
    required: true,
  });

  const handleEditClick = (taskId: string) => {
    setEditingTaskId(taskId);
    const task = tasksQuery.data?.find((task) => task.id === taskId);
    if (task) {
      setNewName(task.name);
    }
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
    onSettled: async () => {
      await utils.tasks.getAll.invalidate();
    },
  });
  const deleteTask = api.tasks.delete.useMutation({
    onMutate: async (id) => {
      await utils.tasks.getAll.cancel();
      utils.tasks.getAll.setData(undefined, (prev) => {
        return prev?.filter((task) => task.id !== id);
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
        return prev?.map((prevTask) =>
          prevTask.id === task.id
            ? { ...prevTask, ...task, updatedAt: new Date() }
            : prevTask
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
        <form className="mr-4 flex items-end justify-between">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-primary"
              placeholder="Task Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button
            className="btn-outline-gradient btn"
            disabled={name.length === 0}
            onClick={() => createTask.mutate({ name })}
          >
            Create
          </button>
        </form>
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
            {tasksQuery.data?.map((task) => (
              <tr key={task.id}>
                <td>
                  {editingTaskId === task.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveClick(task.id, newName);
                      }}
                    >
                      <input
                        type="text"
                        className="input input-bordered input-primary input-sm"
                        name="name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                      />
                    </form>
                  ) : (
                    task.name
                  )}
                </td>
                <td suppressHydrationWarning>
                  {task.createdAt.toLocaleDateString()}
                </td>
                <td suppressHydrationWarning>
                  {task.updatedAt.toLocaleDateString()}
                </td>
                <td className="flex gap-2">
                  {editingTaskId === task.id ? (
                    <>
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => handleSaveClick(task.id, newName)}
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
