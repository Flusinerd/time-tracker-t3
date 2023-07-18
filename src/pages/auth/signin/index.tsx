import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { getServerSession } from "next-auth";
import { getProviders, signIn } from "next-auth/react";
import { authOptions } from "../../../server/auth";
import Card from "../../../components/card";

export default function Signin({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center py-2">
        <Card>
          <h1 className="text-4xl font-bold">Sign in</h1>
          <ul className="mt-auto">
            <li>
              <button
                onClick={() => void signIn(providers.google.id)}
                className="btn btn-secondary btn-outline w-full"
              >
                Sign in with Google
              </button>
            </li>
          </ul>
        </Card>
      </main>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers: {
    google: {
      id: string;
    };
  } | null = await getProviders();

  if (!providers) {
    throw new Error("No providers found");
  }

  return {
    props: { providers: providers ?? [] },
  };
}
