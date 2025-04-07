import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.9)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          },
        }}
      />
    </>
  );
}
