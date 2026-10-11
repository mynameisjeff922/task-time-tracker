// Pages Router: _app wraps every page in the pages/ folder (like layout.tsx does for app/).
import type { AppProps } from "next/app";
import Head from "next/head";
import { Inter } from "next/font/google";
import Nav from "@/components/nav";
import UserMenu from "@/components/user-menu";
import type { SafeUser } from "@/lib/types";
import "@/app/globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps<{ title?: string; user?: Pick<SafeUser, "name" | "email"> }>) {
  return (
    <div className={`${inter.variable} flex min-h-screen flex-col font-sans antialiased`}>
      <Head>
        {/* Pages return a `title` prop, mirroring the App Router's title template */}
        <title>{pageProps.title ? `${pageProps.title} | Task Time Tracker` : "Task Time Tracker"}</title>
      </Head>
      <Nav userMenu={pageProps.user && <UserMenu user={pageProps.user} />} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
