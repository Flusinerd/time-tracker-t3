import Head from "next/head";
import TimeTrackingStartStop from "../../components/time-trackings/time-tracking-start";
import TimeTrackingTable from "../../components/time-trackings/time-tracking-table";
import { api } from "../../utils/api";
import { useSession } from "next-auth/react";

const TimeTrackingsPage = () => {
  useSession({
    required: true,
  });
  const tasksQuery = api.tasks.getAll.useQuery();
  const projectsQuery = api.projects.getAll.useQuery();
  const runningTimeTrackingQuery = api.timeTrackings.getRunning.useQuery();

  const getOwnTimeTrackingsQuery = api.timeTrackings.getOwn.useQuery();

  return (
    <>
      <Head>
        <title>Time Trackings</title>
        <meta name="description" content="Time Trackings" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Time Trackings" />
        <meta property="og:description" content="Time Trackings" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://timetracker.jan-krueger.eu/" />
        <meta property="og:image" content="/og-image.png" />
      </Head>
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
    </>
  );
};

export default TimeTrackingsPage;
