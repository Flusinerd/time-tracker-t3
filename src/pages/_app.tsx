import type { NextPage } from "next";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import type { AppPropsType } from "next/dist/shared/lib/utils";
import type { ReactElement, ReactNode } from "react";
import "~/styles/globals.css";
import { api } from "~/utils/api";
import SidenavLayout from "../layouts/sidenav-layout";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppPropsWithLayout = AppPropsType<any, { session: Session | null }> & {
  Component: NextPageWithLayout
}


const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout || SidenavLayout;
  // Wrap the SessionProvider around the page

  return (
    <SessionProvider session={session}>
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
