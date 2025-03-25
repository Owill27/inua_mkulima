import AuthProvider from "@/providers/Auth";
import "@/styles/globals.css";
import { swrFetcher } from "@/utils/swr";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SWRConfig } from "swr";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig value={{ fetcher: swrFetcher }}>
      <Head>
        <title>Inua Mkulima</title>
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </SWRConfig>
  );
}
