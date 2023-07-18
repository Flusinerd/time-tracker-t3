import Nav from "../../components/nav";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { api } from "../../utils/api";

const ProjectsPage = () => {
  const [name, setName] = useState("");

  const { status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

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
      <div className="flex gap-4">
        <Nav></Nav>
        <main className="pt-4">
          <h1 className="ml-3 text-4xl font-bold">Projects</h1>
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
        </main>
      </div>
    </>
  );
};

export default ProjectsPage;
