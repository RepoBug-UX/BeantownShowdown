'use client';

import { WagmiConfig, createConfig } from 'wagmi';
import { avalanche } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { walletConnect } from '@wagmi/connectors';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'glacier-starter-kit';

const config = createConfig({
  chains: [avalanche],
  transports: {
    [avalanche.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({ 
      projectId: WALLET_CONNECT_PROJECT_ID,
      showQrModal: true,
    }),
  ],
});

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
} 