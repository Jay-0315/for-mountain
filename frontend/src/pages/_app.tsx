import type { AppProps } from "next/app";
import "@/app/globals.css";
import ScrollProgressBar from "@/components/layout/ScrollProgressBar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ScrollProgressBar />
      <Component {...pageProps} />
    </>
  );
}
