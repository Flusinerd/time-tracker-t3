import { createTRPCRouter } from "~/server/api/trpc";
import { projectsRouter } from "./routers/projects";
import { tasksRouter } from "./routers/tasks";
import { timeTrackingsRouter } from "./routers/time-trackings";
import { workTimeCacheRouter } from "./routers/work-time-cache";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  projects: projectsRouter,
  tasks: tasksRouter,
  timeTrackings: timeTrackingsRouter,
  workTimeCache: workTimeCacheRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
