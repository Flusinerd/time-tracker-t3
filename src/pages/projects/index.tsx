import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRef, useState } from "react";
import { api } from "../../utils/api";

const ProjectsPage = () => {
  const [name, setName] = useState("");
  useSession({
    required: true,
  });

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const newNameRef = useRef<HTMLInputElement>(null);

  const handleEditClick = (projectId: string) => {
    setEditingProjectId(projectId);
  };

  const handleCancelClick = () => {
    setEditingProjectId(null);
  };

  const handleSaveClick = (projectId: string, newName: string) => {
    updateProject.mutate({ id: projectId, name: newName });
    setEditingProjectId(null);
  };

  const utils = api.useContext();
  const projectQuery = api.projects.getAll.useQuery();
  const createProject = api.projects.create.useMutation({
    onMutate: async (project) => {
      await utils.projects.getAll.cancel();
      utils.projects.getAll.setData(undefined, (prev) => {
        const newProject = {
          ...project,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return prev ? [...prev, newProject] : [newProject];
      });
    },
    onSettled: async () => {
      await utils.projects.getAll.invalidate();
    },
  });
  const deleteProject = api.projects.delete.useMutation({
    onMutate: async (id) => {
      await utils.projects.getAll.cancel();
      utils.projects.getAll.setData(undefined, (prev) => {
        return prev?.filter((project) => project.id !== id);
      });
    },
    onSettled: async () => {
      await utils.projects.getAll.invalidate();
    },
  });
  const updateProject = api.projects.update.useMutation({
    onMutate: async (project) => {
      await utils.projects.getAll.cancel();
      utils.projects.getAll.setData(undefined, (prev) => {
        return prev?.map((prevProject) =>
          prevProject.id === project.id
            ? { ...prevProject, ...project, updatedAt: new Date() }
            : prevProject
        );
      });
    },
    onSettled: async () => {
      await utils.projects.getAll.invalidate();
    },
  });

  return (
    <>
      <Head>
        <title>Projects</title>
        <meta name="description" content="Projects" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Projects" />
        <meta property="og:description" content="Projects" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://timetracker.jan-krueger.eu/" />
        <meta property="og:image" content="/og-image.png" />
      </Head>
      <div className="flex flex-col gap-4">
        <h1 className="gradient-text ml-3 pb-2 text-4xl font-bold">Projects</h1>
        <table className="table mt-8">
          <thead>
            <tr>
              <th>Project</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Input Row */}
            <tr>
              <td>
                <input
                  type="text"
                  className="input input-bordered input-primary input-sm"
                  placeholder="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </td>
              <td></td>
              <td></td>
              <td>
                <button
                  className="btn btn-primary btn-xs"
                  onClick={() => createProject.mutate({ name })}
                >
                  Create
                </button>
              </td>
            </tr>
            {projectQuery.data?.map((project) => (
              <tr key={project.id}>
                <td>
                  {editingProjectId === project.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveClick(
                          project.id,
                          newNameRef.current?.value ?? ""
                        );
                      }}
                    >
                      <input
                        type="text"
                        className="input input-bordered input-primary input-sm"
                        name="name"
                        defaultValue={project.name}
                        autoFocus
                        ref={newNameRef}
                      />
                    </form>
                  ) : (
                    project.name
                  )}
                </td>
                <td>{project.createdAt.toLocaleDateString()}</td>
                <td>{project.updatedAt.toLocaleDateString()}</td>
                <td className="flex gap-2">
                  {editingProjectId === project.id ? (
                    <>
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() =>
                          handleSaveClick(
                            project.id,
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
                        onClick={() => handleEditClick(project.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-error btn-xs"
                        onClick={() => deleteProject.mutate(project.id)}
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

export default ProjectsPage;
