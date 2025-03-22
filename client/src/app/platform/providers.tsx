"use client";

import { WagmiProvider, cookieToInitialState } from "wagmi";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, createStorage, cookieStorage } from 'wagmi';
import { Chain } from '@rainbow-me/rainbowkit';
import { avalanche, avalancheFuji } from 'wagmi/chains';

// Hardcoded WalletConnect project ID
const projectId = "c9c5d37c2e1e03b0c14a4c0c4b4e8d4a";

const queryClient = new QueryClient();

const supportedChains: Chain[] = [avalanche, avalancheFuji];

export const config = getDefaultConfig({
  appName: "Beantown Showdown",
  projectId,
  chains: supportedChains as any,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: supportedChains.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {})
});

interface Props {
  children: React.ReactNode;
  cookie?: string;
}

export default function Providers({ children, cookie }: Props) {
  const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}