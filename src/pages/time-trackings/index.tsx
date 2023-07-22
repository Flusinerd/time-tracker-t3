import TimeTrackingStartStop from "../../components/time-trackings/time-tracking-start";
import TimeTrackingTable from "../../components/time-trackings/time-tracking-table";
import { api } from "../../utils/api";

const TimeTrackingsPage = () => {
  const tasksQuery = api.tasks.getAll.useQuery();
  const projectsQuery = api.projects.getAll.useQuery();
  const runningTimeTrackingQuery = api.timeTrackings.getRunning.useQuery();

  const getOwnTimeTrackingsQuery = api.timeTrackings.getOwn.useQuery();

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
      <TimeTrackingStartStop
        projects={projectsQuery.data ?? []}
        tasks={tasksQuery.data ?? []}
        runningTimeTracking={runningTimeTrackingQuery.data ?? null}
      />
      <TimeTrackingTable
        projects={projectsQuery.data ?? []}
        tasks={tasksQuery.data ?? []}
        timeTrackings={getOwnTimeTrackingsQuery.data ?? []}
      />
    </div>
  );
};

export default TimeTrackingsPage;
