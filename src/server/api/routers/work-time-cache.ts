import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workTimeCacheRouter = createTRPCRouter({
  getForUser: protectedProcedure.query(async ({ctx}) => {
    const { user } = ctx.session;
    const workTimeEntries = await ctx.prisma.workTimeCache.findMany({
      where: {
        userId: user.id
      },
      orderBy: [
        {
          year: 'desc'
        },
        {
          month: 'desc'
        }
      ]
    })

    return workTimeEntries;
  })
})