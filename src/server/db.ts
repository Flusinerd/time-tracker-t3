import { PrismaClient, type TimeTracking } from "@prisma/client";
import dayjs from "dayjs";
import timeZone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { env } from "~/env.mjs";

dayjs.extend(utc);
dayjs.extend(timeZone);

const GERMAN_TZ = "Europe/Berlin" as const;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Create a prisma extension that updates the WorkTimeCache table when a time tracking is created or updated
// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/using-prismaclient-with-typescript#prisma-client-hooks
export const prismaX = prisma.$extends({
  model: {
    timeTracking: {
      async aggregateAllForUserAndMonth(userId: string, month: number, year: number) {
        const startOfInterval = dayjs().tz(GERMAN_TZ).set("month", month - 1).set("year", year).startOf("month").toDate();
        const endOfInterval = dayjs().tz(GERMAN_TZ).set("month", month - 1).set("year", year).endOf("month").toDate();
        const result = await prisma.timeTracking.aggregate({
          _sum: {
            duration: true,
          },
          where: {
            userId,
            start: {
              gte: startOfInterval,
              lte: endOfInterval,
            },
          },
        });
        return result;
      }
    }
  },
  query: {
    timeTracking: {
      create: async ({ args, query }) => {
        const timeTracking = await query(args) as TimeTracking;
        await calculateWorkTime(timeTracking);
        return timeTracking;
      },
      update: async ({ args, query }) => {
        const timeTracking = await query(args) as TimeTracking;
        await calculateWorkTime(timeTracking);
        return timeTracking;
      },
      delete: async ({ args, query }) => {
        console.log('Deleting', args, query)
        const timeTracking = await query(args) as TimeTracking;
        await calculateWorkTime(timeTracking, 'deletion');
        return timeTracking;
      }
    }
  }
});

const calculateWorkTime = async (timeTracking: TimeTracking, mode: 'upsert' | 'deletion' = 'upsert') => {
  const { id, start, end, userId } = timeTracking;
  if (!end || !start || !userId || !id) {
    return;
  }
  const startDayjs = dayjs(start).tz(GERMAN_TZ);
  const month = startDayjs.month() + 1;
  const year = startDayjs.year();
  const endDayjs = dayjs(end).tz(GERMAN_TZ);
  const totalTime = endDayjs.diff(startDayjs, "second");
  if (mode === 'upsert') {
    await prisma.timeTracking.update({
      where: {
        id,
      },
      data: {
        duration: totalTime,
      },
    });
  }

  // Aggregate all time trackings for the month
  const { _sum } = await prismaX.timeTracking.aggregateAllForUserAndMonth(userId, month, year);
  const monthTotal = _sum.duration ?? 0;


  // Set the WorkTimeCache
  const existingWorkTimeCache = await prisma.workTimeCache.findFirst({
    where: {
      userId,
      month,
      year,
    },
  });

  if (existingWorkTimeCache) {
    await prisma.workTimeCache.update({
      where: {
        id: existingWorkTimeCache.id,
      },
      data: {
        actualInSec: monthTotal,
      },
    });
  } else {
    await prisma.workTimeCache.create({
      data: {
        userId,
        month,
        year,
        actualInSec: monthTotal,
        requiredInSec: 0,
      },
    });
  }
  return timeTracking;
};