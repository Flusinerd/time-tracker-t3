import { WorkTimeCache } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { api } from "../../utils/api";
import dayjs from "dayjs";

export default function Dashboard() {
  const { data } = useSession({
    required: true,
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const utils = api.useContext();
  const workTimeQuery = api.workTimeCache.getForUser.useQuery();

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="Dashboard" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="Dashboard" />
        <meta property="og:description" content="Dashboard" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://timetracker.jan-krueger.eu/" />
        <meta property="og:image" content="/og-image.png" />
      </Head>
      <h1 className="gradient-text text-4xl font-bold">Dashboard</h1>
      <section>
        {workTimeQuery.isLoading && <p>Loading...</p>}
        {workTimeQuery.data && CurrentMonth(workTimeQuery.data)}
      </section>
    </>
  );
}

function CalculateUebertrag(data: WorkTimeCache[]) {
  // Include all months except the current one
  const months = data.filter(
    (workTime) =>
      workTime.year !== new Date().getFullYear() ||
      workTime.month !== new Date().getMonth() + 1
  );

  const totalRequired = months.reduce(
    (acc, curr) => acc + curr.requiredInSec,
    0
  );
  const totalActual = months.reduce((acc, curr) => acc + curr.actualInSec, 0);

  const totalRequiredDuration = dayjs.duration(totalRequired, "seconds");
  const totalActualDuration = dayjs.duration(totalActual, "seconds");

  const uebertrag = totalActualDuration.subtract(totalRequiredDuration);

  return uebertrag;
}

function CurrentMonth(data: WorkTimeCache[]) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthData = data.filter(
    (workTime) =>
      workTime.year === currentYear && workTime.month === currentMonth
  )[0];

  if (data.length === 0 || !currentMonthData) {
    return <p>No data for the current month</p>;
  }

  const worked = dayjs.duration(currentMonthData.actualInSec, "seconds");
  const required = dayjs.duration(currentMonthData.requiredInSec, "seconds");
  const uebertrag = CalculateUebertrag(data);
  const remaining = required.subtract(worked).add(uebertrag);

  return (
    <>
      <div className="mt-4">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th className="text-center">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="font-bold">Transfer:</span>
              </td>
              <td className="text-center">
                {uebertrag.asMilliseconds() === 0
                  ? "-"
                  : uebertrag.format("HH:mm:ss")}
              </td>
            </tr>
            <tr>
              <td>
                <span className="font-bold">Worked:</span>
              </td>
              <td className="text-center">
                {worked.asMilliseconds() === 0
                  ? "-"
                  : worked.format("HH:mm:ss")}
              </td>
            </tr>
            <tr>
              <td>
                <span className="font-bold">Required:</span>
              </td>
              <td className="text-center">
                {required.asMilliseconds() === 0
                  ? "-"
                  : required.format("HH:mm:ss")}
              </td>
            </tr>
            <tr className="">
              <td>
                <span className="font-bold">Remaining:</span>
              </td>
              <td className="text-center text-primary font-bold">
                {remaining.asMilliseconds() === 0
                  ? "-"
                  : remaining.format("HH:mm:ss")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
