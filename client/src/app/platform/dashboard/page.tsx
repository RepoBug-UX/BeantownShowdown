"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Progress } from "@/app/components/ui/progress";
import { Button } from "@/app/components/ui/button";
import {
  AlertCircle,
  Wallet,
  GaugeCircle,
  PiggyBank,
  Clock,
} from "lucide-react";
import { Project as ProjectType } from "@/types/ProjectTypes";

// Interface for the dashboard project display
interface DashboardProject {
  id: string;
  title: string;
  description: string;
  raised: number;
  goal: number;
  deadline: string;
  backersCount: number;
  status: "active" | "completed" | "drafting";
  image: string;
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [activeProjects, setActiveProjects] = useState<DashboardProject[]>([]);
  const [fundraisingProjects, setFundraisingProjects] = useState<
    DashboardProject[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!address) return;
      setIsLoading(true);

      try {
        // Fetch all projects
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const projects: ProjectType[] = await response.json();

        // Filter projects where the user is the creator
        const userProjects = projects
          .filter((project) => project.creatorAddress === address)
          .map((project) => ({
            id: project._id as string,
            title: project.title,
            description: project.description,
            raised: project.raised,
            goal: project.fundingGoal,
            deadline: project.deadline.toString(),
            backersCount: project.backersCount,
            status: project.status as "active" | "completed" | "drafting",
            image: project.image,
          }));

        // Filter projects where the user is a backer
        const backedProjects = projects
          .filter((project) =>
            project.backers.some((backer) => backer.address === address)
          )
          .map((project) => ({
            id: project._id as string,
            title: project.title,
            description: project.description,
            raised: project.raised,
            goal: project.fundingGoal,
            deadline: project.deadline.toString(),
            backersCount: project.backersCount,
            status: project.status as "active" | "completed" | "drafting",
            image: project.image,
          }));

        setActiveProjects(userProjects);
        setFundraisingProjects(backedProjects);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      loadData();
    }
  }, [isConnected, address]);

  // Calculate progress percentage
  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // If not connected, show a prompt to connect wallet
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Please connect your wallet to view your project dashboard and
              fundraising activities.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Dashboard</h1>
            <p className="text-gray-600">
              Track and manage all your projects in one place.
            </p>
          </div>
          <Link href="/platform/create">
            <Button className="mt-4 md:mt-0">Start New Project</Button>
          </Link>
        </div>

        <Tabs defaultValue="active" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <GaugeCircle className="h-4 w-4" />
              My Active Projects
            </TabsTrigger>
            <TabsTrigger
              value="fundraising"
              className="flex items-center gap-2"
            >
              <PiggyBank className="h-4 w-4" />
              Fundraising Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : activeProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProjects.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <div className="h-48 w-full overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {project.description}
                      </p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{formatCurrency(project.raised)} raised</span>
                            <span>{formatCurrency(project.goal)} goal</span>
                          </div>
                          <Progress
                            value={calculateProgress(
                              project.raised,
                              project.goal
                            )}
                            className="h-2"
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Wallet className="h-3 w-3" />
                            {project.backersCount} backers
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Ends{" "}
                            {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/platform/project/${project.id}`}>
                        <Button variant="outline">View Project</Button>
                      </Link>
                      <Link href={`/platform/project/update/${project.id}`}>
                        <Button>Update</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <h3 className="text-xl font-medium mb-2">
                  No active projects yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start creating your first project and begin fundraising today.
                </p>
                <Link href="/platform/create">
                  <Button>Start New Project</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="fundraising" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : fundraisingProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fundraisingProjects.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <div className="h-48 w-full overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {project.description}
                      </p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{formatCurrency(project.raised)} raised</span>
                            <span>{formatCurrency(project.goal)} goal</span>
                          </div>
                          <Progress
                            value={calculateProgress(
                              project.raised,
                              project.goal
                            )}
                            className="h-2"
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Wallet className="h-3 w-3" />
                            {project.backersCount} backers
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Ends{" "}
                            {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/platform/project/${project.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                      <Button>Support</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <h3 className="text-xl font-medium mb-2">
                  No fundraising projects
                </h3>
                <p className="text-gray-600 mb-4">
                  You are not currently supporting any projects.
                </p>
                <Link href="/platform/explore">
                  <Button>Explore Projects</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
