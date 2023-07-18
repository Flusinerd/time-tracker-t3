import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure
} from "~/server/api/trpc";

export const projectsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.project.findMany();
  }),
  create: protectedProcedure.input(
    z.object({
      name: z.string()
    })
  ).mutation(({ ctx, input }) => {
    return ctx.prisma.project.create({
      data: input
    });
  }),
  delete: protectedProcedure.input(z.string()).mutation(
    ({ ctx, input }) => {
      return ctx.prisma.project.delete({
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
    return ctx.prisma.project.update({
      where: {
        id: input.id
      },
      data: {
        name: input.name
      }
    });
  })
});
