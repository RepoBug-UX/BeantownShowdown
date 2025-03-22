"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Erc1155TokenBalance,
  Erc20TokenBalance,
  TransactionDetails,
} from "@avalabs/avacloud-sdk/models/components";
import { Erc721TokenBalance } from "@avalabs/avacloud-sdk/models/components/erc721tokenbalance";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Snowflake, Wallet, Search, Menu } from "lucide-react";
import Navbar from "@/app/components/Navbar";

// Add this interface to extend TransactionDetails with the properties you need
interface ExtendedTransactionDetails extends TransactionDetails {
  hash?: string;
  status?: string;
  value?: string;
}

// Define the Project interface
interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  raised: number;
  backersCount: number;
  deadline: string;
  status: string;
  image: string;
  creator?: string;
  milestones?: any[];
  updates?: any[];
}

export default function BasicWallet() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("tokens");
  const [tokens, setTokens] = useState<Erc20TokenBalance[]>([]);
  const [nfts, setNfts] = useState<Erc721TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<
    ExtendedTransactionDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [address]);

  useEffect(() => {
    // Fetch featured projects from the API
    const fetchFeaturedProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch projects: ${response.status} ${response.statusText}`
          );
        }
        const allProjects = await response.json();
        console.log("Fetched projects:", allProjects);

        // If we have projects, take the first 3 as featured
        if (Array.isArray(allProjects) && allProjects.length > 0) {
          setFeaturedProjects(allProjects.slice(0, 3));
        } else {
          console.log("No projects found or invalid response format");
          setFeaturedProjects([]);
        }
      } catch (err) {
        console.error("Error fetching featured projects:", err);
        setFeaturedProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  // Calculate days left until deadline
  const calculateDaysLeft = (deadline: string): number => {
    const now = new Date();
    const deadlineDate = new Date(deadline);

    // Make sure the deadline is in the future
    if (deadlineDate <= now) {
      return 0;
    }

    const diffTime = Math.abs(deadlineDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                      {token.symbol?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {token.name || "Unknown Token"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {token.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{token.balance || "0"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  No tokens found
                </p>
              </div>
            )}
          </div>
        );
      case "nfts":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.length > 0 ? (
              nfts.map((nft, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                >
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-400">NFT Image</span>
                  </div>
                  <h3 className="font-medium">{nft.name || "Unnamed NFT"}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    #{nft.tokenId}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  No NFTs found
                </p>
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
                <p className="text-gray-500 dark:text-gray-400">
                  No transactions found
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!showWallet) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar onMenuClick={() => setShowWallet(true)} />

        <main className="flex-grow container mx-auto px-4 py-12">
          <section className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Crowdfunding on Avalanche
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Fund innovative projects with blockchain simplicity
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/platform/create">
                <Button size="lg">Launch Project</Button>
              </Link>
              <Link href="/platform/explore">
                <Button variant="outline" size="lg">
                  <Search className="mr-2 h-5 w-5" /> Explore
                </Button>
              </Link>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Featured Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projectsLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600 text-lg">
                    Discovering featured projects...
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    We're finding the best projects for you
                  </p>

                  {/* Loading placeholder cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-gray-100 rounded-lg shadow-sm h-64 animate-pulse"
                      >
                        <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                        <div className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : featuredProjects.length > 0 ? (
                featuredProjects.map((project) => (
                  <Link
                    href={`/platform/project/${project._id}`}
                    key={project._id}
                  >
                    <Card className="border-0 shadow-sm h-full hover:shadow-md transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {project.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-gray-100 rounded-md mb-4 relative overflow-hidden">
                          {project.image ? (
                            <div className="w-full h-full">
                              {project.image.startsWith("data:") ? (
                                <img
                                  src={project.image}
                                  alt={project.title}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <Image
                                  src={project.image}
                                  alt={project.title}
                                  width={300}
                                  height={200}
                                  className="w-full h-full object-cover rounded-md"
                                  priority
                                />
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Snowflake className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <Progress
                          value={(project.raised / project.fundingGoal) * 100}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>${project.raised.toFixed(2)} raised</span>
                          <span>
                            {calculateDaysLeft(project.deadline)} days left
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={(e) => {
                            // Prevent the default link behavior so we can add our own click handler
                            e.stopPropagation();
                            // Navigate to the project page
                            window.location.href = `/platform/project/${project._id}`;
                          }}
                        >
                          Back this project
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">
                    No projects found
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        <footer className="border-t py-8 mt-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Snowflake className="h-5 w-5 text-gray-600" />
                <span className="text-lg font-semibold text-gray-800">
                  Snowball
                </span>
              </div>
              <nav className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Privacy
                </Link>
                <Link href="/faq" className="text-gray-600 hover:text-gray-800">
                  FAQ
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Contact
                </Link>
              </nav>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              © 2025 Snowball. All rights reserved. Powered by Avalanche
              Network.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="grid grid-cols-3 items-center mb-8 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button onClick={() => setShowWallet(false)} className="mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-left"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold">Snowball Wallet</h1>
        </div>
        <div className="flex justify-end">
          <ConnectButton />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <main className="flex-grow">
          <div className="mb-6">
            <nav
              className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg"
              aria-label="Tabs"
            >
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
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {activeTab}
            </h2>
            {renderTabContent()}
          </div>
        </main>

        {isConnected && (
          <aside className="lg:w-80 bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Address
              </p>
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
