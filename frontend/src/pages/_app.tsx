import type { AppProps } from "next/app";
import "@/app/globals.css";
import ScrollProgressBar from "@/components/layout/ScrollProgressBar";
import CustomCursor from "@/components/ui/CustomCursor";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ScrollProgressBar />
      <CustomCursor />
      <Component {...pageProps} />
    </>
  );
}
