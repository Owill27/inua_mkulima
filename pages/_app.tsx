import AuthProvider from "@/providers/Auth";
import "@/styles/globals.css";
import { swrFetcher } from "@/utils/swr";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SWRConfig } from "swr";
import { Poppins } from "next/font/google";

const poppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Choose weights you need
  variable: "--font-body", // Custom CSS variable for Tailwind
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={poppinsFont.variable}>
      <SWRConfig value={{ fetcher: swrFetcher }}>
        <Head>
          <title>Inua Mkulima</title>
        </Head>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </SWRConfig>
    </div>
  );
}
