import { useSession } from "next-auth/react";
import Head from "next/head";

export default function Dashboard() {
  useSession({
    required: true,
  });

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
    </>
  );
}
