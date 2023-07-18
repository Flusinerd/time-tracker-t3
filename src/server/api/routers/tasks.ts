import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const tasksRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.task.findMany();
  }
  ),
  create: protectedProcedure.input(
    z.object({
      name: z.string(),
    })
  ).mutation(({ ctx, input }) => {
    return ctx.prisma.task.create({
      data: input
    });
  }
  ),
  delete: protectedProcedure.input(z.string()).mutation(
    ({ ctx, input }) => {
      return ctx.prisma.task.delete({
        where: {
          id: input
        }
      });
    }
  ),
  update: protectedProcedure.input(
    z.object({
      id: z.string(),
      name: z.string()
    })
  ).mutation(({ ctx, input }) => {
    return ctx.prisma.task.update({
      where: {
        id: input.id
      },
      data: {
        name: input.name
      }
    });
  }
  )
});