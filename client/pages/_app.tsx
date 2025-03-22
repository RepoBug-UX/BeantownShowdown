import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { avalanche, avalancheFuji } from "@wagmi/core/chains";
import "@/styles/globals.css";
import dynamic from "next/dynamic";

// Dynamically import the Web3Provider to avoid server-side errors
const Web3Provider = dynamic(
  () => import("@avalabs/builderkit").then((mod) => mod.Web3Provider),
  { ssr: false }
);

const chains = [avalanche, avalancheFuji];

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider appName="snowball" projectId="snowball" chains={chains}>
      <Component {...pageProps} />;
    </Web3Provider>
  );
}
