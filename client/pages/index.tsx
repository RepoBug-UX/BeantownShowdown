import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import dynamic from "next/dynamic";

// Dynamically import the Web3Provider to avoid server-side errors
const ConnectButton = dynamic(
  () => import("@avalabs/builderkit").then((mod) => mod.ConnectButton),
  { ssr: false }
);
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Snowball</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${geistSans.variable} ${geistMono.variable}`}>
        <main>
          <ConnectButton showConnectedWallet={true} checkWrongNetwork={true} />
        </main>
      </div>
    </>
  );
}
