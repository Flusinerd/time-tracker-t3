import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const timeTrackingsRouter = createTRPCRouter({
  start: protectedProcedure.input(
    z.object({
      taskId: z.string().cuid(),
      projectId: z.string().cuid(),
      description: z.string().optional(),
    }),
  ).mutation(async ({ ctx, input }) => {
    const { taskId, projectId } = input;
    const { id: userId } = ctx.session.user;
    const now = new Date();
    const currentTracking = await ctx.prisma.timeTracking.findFirst({
      where: {
        userId,
        end: null,
      },
    });

    if (currentTracking) {
      throw new Error("You already have a running time tracking");
    }

    return ctx.prisma.timeTracking.create({
      data: {
        start: now,
        userId,
        taskId,
        description: input.description,
        projectId,
      },
    });
  }),
  stop: protectedProcedure
    .input(z.object({
      taskId: z.string().cuid(),
      projectId: z.string().cuid(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.session.user;
      const now = new Date();
      const currentTracking = await ctx.prisma.timeTracking.findFirst({
        where: {
          userId,
          end: null,
        },
      });

      if (!currentTracking) {
        throw new Error("You don't have a running time tracking");
      }

      return ctx.prisma.timeTracking.update({
        where: {
          id: currentTracking.id,
        },
        data: {
          end: now,
          taskId: input.taskId,
          projectId: input.projectId,
          description: input.description,
        },
      });
    }),
  getRunning: protectedProcedure.query(async ({ ctx }) => {
    const { id: userId } = ctx.session.user;
    const currentTracking = await ctx.prisma.timeTracking.findFirst({
      where: {
        userId,
        end: null,
      },
    });

    return currentTracking;
  }),
  getOwn: protectedProcedure.query(async ({ ctx }) => {
    const { id: userId } = ctx.session.user;
    const timeTrackings = await ctx.prisma.timeTracking.findMany({
      where: {
        userId,
      },
      include: {
        Project: true,
        Task: true,
      },
      orderBy: {
        start: "desc",
      }
    });

    return timeTrackings;
  }),
  delete: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.session.user;
      const timeTracking = await ctx.prisma.timeTracking.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!timeTracking) {
        throw new Error("Time tracking not found");
      }

      return ctx.prisma.timeTracking.delete({
        where: {
          id: input.id,
        },
      });
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      description: z.string().optional(),
      projectId: z.string().cuid(),
      taskId: z.string().cuid(),
      start: z.date(),
      end: z.date().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.session.user;
      const timeTracking = await ctx.prisma.timeTracking.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!timeTracking) {
        throw new Error("Time tracking not found");
      }

      return ctx.prisma.timeTracking.update({
        where: {
          id: input.id,
        },
        data: {
          description: input.description,
          projectId: input.projectId,
          taskId: input.taskId,
          start: input.start,
          end: input.end,
        },
      });
    }),
});