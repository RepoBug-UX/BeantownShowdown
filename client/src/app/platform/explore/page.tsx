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
import { Snowflake, Search, Menu, Filter, Clock } from "lucide-react";
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <Link
                    href={`/platform/project/${project._id}`}
                    key={project._id}
                    className="block"
                  >
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-gray-200 relative">
                          {project.image ? (
                            project.image.startsWith("data:") ? (
                              <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover rounded-t-lg"
                              />
                            ) : (
                              <Image
                                src={project.image}
                                alt={project.title}
                                width={400}
                                height={225}
                                className="w-full h-full object-cover rounded-t-lg"
                              />
                            )
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100 rounded-t-lg">
                              <Snowflake className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                            {project.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {project.description}
                          </p>
                          <Progress
                            value={(project.raised / project.fundingGoal) * 100}
                            className="h-2 mb-4"
                          />
                          <div className="flex justify-between items-center text-sm">
                            <div className="font-semibold">
                              ${project.raised?.toLocaleString()} raised
                            </div>
                            <div className="text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {calculateDaysLeft(project.deadline)} days left
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No projects found matching your criteria.
                </div>
              )}
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
