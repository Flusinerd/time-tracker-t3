import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import FullScreenLayout from "../layouts/full-screen";

export default function Home() {
  const { status } = useSession();
  return (
    <>
      <style global jsx>{`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100%;
        }
         {
          height: 100%;
        }
      `}</style>
      <Head>
        <title>Timetracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex h-full flex-col items-center gap-4 p-4">
        <h1 className="gradient-text font-bold text-6xl">
          Welcome to THDS Timetracker
        </h1>
        {status === "authenticated" && (
          <Link className="btn btn-primary mb-auto mt-auto" href={"/dashboard"}>
            <p className="text-xl"> Go to dashboard</p>
          </Link>
        )}

        {status === "loading" && <p className="text-xl"> Loading...</p>}

        {status === "unauthenticated" && (
          <Link
            className="btn btn-primary mb-auto mt-auto"
            href={"/auth/signin"}
          >
            <p className="text-xl"> Please sign in to continue</p>
          </Link>
        )}
      </main>
    </>
  );
}

Home.getLayout = (page: React.ReactNode) => <FullScreenLayout>{page}</FullScreenLayout>;