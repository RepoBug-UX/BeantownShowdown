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

export default function BasicWallet() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState("nfts");

  useEffect(() => {
    if (address) {
    }
  }, [address]);

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Snowball</h1>
        <div className="flex items-center space-x-2">
          <ConnectButton />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <main className="flex-grow">
          <div className="mb-4">
            <nav className="flex space-x-4" aria-label="Tabs"></nav>
          </div>
        </main>
      </div>
    </div>
  );
}
