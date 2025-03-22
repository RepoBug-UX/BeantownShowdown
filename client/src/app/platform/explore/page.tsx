"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, ChangeEvent } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Progress } from "@/app/components/ui/progress";
import { Snowflake, Search, Menu, Filter } from "lucide-react";

export default function ExplorePage() {
  const { isConnected } = useAccount();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mock project data
  const projects = [
    {
      id: 1,
      title: "Avalanche DeFi Hub",
      category: "Technology",
      description:
        "A comprehensive dashboard for DeFi applications on Avalanche",
      raised: 45000,
      goal: 100000,
      daysLeft: 15,
      backers: 230,
      image: "/images/defi.jpg",
    },
    {
      id: 2,
      title: "NFT Marketplace for Digital Artists",
      category: "Art",
      description:
        "Empowering digital artists through affordable NFT minting and sales",
      raised: 28000,
      goal: 50000,
      daysLeft: 22,
      backers: 156,
      image: "/images/art.jpg",
    },
    {
      id: 3,
      title: "GameFi Adventure Realm",
      category: "Games",
      description:
        "Play-to-earn adventure game with immersive storyline and tokenized assets",
      raised: 67000,
      goal: 120000,
      daysLeft: 8,
      backers: 345,
      image: "/images/games.jpg",
    },
    {
      id: 4,
      title: "DAO Governance Framework",
      category: "Innovation",
      description:
        "Building the future of decentralized governance for community projects",
      raised: 83000,
      goal: 150000,
      daysLeft: 19,
      backers: 412,
      image: "/images/dao.jpg",
    },
    {
      id: 5,
      title: "Sustainable Blockchain Initiative",
      category: "Environment",
      description:
        "Reducing carbon footprint of blockchain operations through innovative solutions",
      raised: 32000,
      goal: 80000,
      daysLeft: 28,
      backers: 198,
      image: "/images/environment.jpg",
    },
    {
      id: 6,
      title: "Community Music Platform",
      category: "Music",
      description:
        "Decentralized streaming service that fairly compensates artists",
      raised: 21000,
      goal: 60000,
      daysLeft: 11,
      backers: 123,
      image: "/images/music.jpg",
    },
  ];

  const categories = [
    "all",
    "Technology",
    "Art",
    "Games",
    "Music",
    "Film",
    "Environment",
    "Social",
    "Innovation",
  ];

  // Filter projects based on category and search query
  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      activeCategory === "all" || project.category === activeCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 grid grid-cols-3 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Snowflake className="h-6 w-6 text-gray-800" />
              <span className="text-xl font-semibold text-gray-800">
                Snowball
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex justify-center space-x-6">
            <Link
              href="/platform/explore"
              className="text-blue-600 font-medium hover:text-blue-800"
            >
              Explore
            </Link>
            <Link
              href="/platform/start"
              className="text-gray-600 hover:text-gray-800"
            >
              Start a Project
            </Link>
            <Link
              href="/platform/about"
              className="text-gray-600 hover:text-gray-800"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center justify-end space-x-4">
            <ConnectButton />
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Explore Projects
          </h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600">Filter:</span>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className={
                  activeCategory === category ? "bg-blue-600" : "bg-gray-50"
                }
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-md mb-4 overflow-hidden">
                      {/* Placeholder for project image */}
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        Project Image
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <Progress
                      value={(project.raised / project.goal) * 100}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mb-3">
                      <span>${project.raised.toLocaleString()} raised</span>
                      <span>${project.goal.toLocaleString()} goal</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {project.backers} backers
                      </span>
                      <span className="text-gray-500">
                        {project.daysLeft} days left
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Back this project</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No projects found matching your criteria.
              </div>
            )}
          </div>
        </section>

        <section className="bg-gray-50 p-8 rounded-lg mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Start Your Own Project
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Have a brilliant idea? Launch your project on Snowball and connect
              with backers passionate about innovation on Avalanche.
            </p>
            <Button size="lg">Start a Project</Button>
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
              <Link href="/terms" className="text-gray-600 hover:text-gray-800">
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
            © 2025 Snowball. All rights reserved. Powered by Avalanche Network.
          </div>
        </div>
      </footer>
    </div>
  );
}
