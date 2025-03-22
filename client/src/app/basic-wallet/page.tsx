"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Erc1155TokenBalance,
  Erc20TokenBalance,
  TransactionDetails,
} from "@avalabs/avacloud-sdk/models/components";
import { Erc721TokenBalance } from "@avalabs/avacloud-sdk/models/components/erc721tokenbalance";

// Add this interface to extend TransactionDetails with the properties you need
interface ExtendedTransactionDetails extends TransactionDetails {
  hash?: string;
  status?: string;
  value?: string;
}

export default function BasicWallet() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("tokens");
  const [tokens, setTokens] = useState<Erc20TokenBalance[]>([]);
  const [nfts, setNfts] = useState<Erc721TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<ExtendedTransactionDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [address]);

  const renderTabContent = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please connect your wallet to view your assets
            </p>
          </div>
          <ConnectButton />
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "tokens":
        return (
          <div className="grid gap-4">
            {tokens.length > 0 ? (
              tokens.map((token, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                      {token.symbol?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{token.name || "Unknown Token"}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{token.balance || "0"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No tokens found</p>
              </div>
            )}
          </div>
        );
      case "nfts":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.length > 0 ? (
              nfts.map((nft, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-400">NFT Image</span>
                  </div>
                  <h3 className="font-medium">{nft.name || "Unnamed NFT"}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">#{nft.tokenId}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No NFTs found</p>
              </div>
            )}
          </div>
        );
      case "transactions":
        return (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <div key={index} className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium truncate">{tx.hash}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date().toLocaleDateString()} • {tx.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{tx.value || "0"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="flex justify-between items-center mb-8 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold">Snowball Wallet</h1>
        </div>
        <ConnectButton />
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <main className="flex-grow">
          <div className="mb-6">
            <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("tokens")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "tokens"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Tokens
              </button>
              <button
                onClick={() => setActiveTab("nfts")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "nfts"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                NFTs
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "transactions"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Transactions
              </button>
            </nav>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 capitalize">{activeTab}</h2>
            {renderTabContent()}
          </div>
        </main>
        
        {isConnected && (
          <aside className="lg:w-80 bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-2">Network</h3>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Avalanche</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
