"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, ChangeEvent, useEffect } from "react";
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
import { Snowflake, Search, Menu, Filter, Clock, Users } from "lucide-react";
import Navbar from "@/app/components/Navbar";

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
  upvotes: string[];
}

export default function ExplorePage() {
  const { isConnected } = useAccount();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All Projects");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Fetch projects from our API
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Format date to show days left
  const calculateDaysLeft = (deadline: string): number => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = Math.abs(deadlineDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const categories = [
    "All Projects",
    "Art",
    "Technology",
    "Games",
    "Film & Video",
    "Music",
    "Publishing",
    "Food",
    "Fashion",
    "Design",
    "Community",
    "Other",
  ];



  // Filter projects based on category and search query
  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      activeCategory === "All Projects" || project.category === activeCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
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
                {category}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading amazing projects...</p>
              <p className="text-gray-500 text-sm mt-2">
                This may take a moment
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Error loading projects: {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Link key={project._id} href={`/platform/project/${project._id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={project.image || "/placeholder.png"}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.description}
                      </p>
                      <Progress
                        value={(project.raised / project.fundingGoal) * 100}
                        className="h-2"
                      />
                      <div className="mt-4 flex justify-between items-center text-sm">
                        <span className="font-medium">
                          {project.raised} AVAX
                        </span>
                        <span className="text-muted-foreground">
                          {((project.raised / project.fundingGoal) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.backersCount} backers
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M7 10v12" />
                          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                        </svg>
                        {project.upvotes?.length || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {calculateDaysLeft(project.deadline)} days left
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
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
            <Link href="/platform/create">
              <Button size="lg">Start a Project</Button>
            </Link>
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
