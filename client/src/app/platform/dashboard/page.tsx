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
  Users,
} from "lucide-react";
import { Project as ProjectType } from "@/types/ProjectTypes";
import Image from "next/image";

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
  upvotes: string[];
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
            upvotes: project.upvotes || []
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
            upvotes: project.upvotes || []
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

  // Calculate days left until deadline
  const calculateDaysLeft = (deadline: string): number => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = Math.abs(deadlineDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
                  <Link key={project.id} href={`/platform/project/${project.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="p-0">
                        <div className="relative h-48">
                          <Image
                            src={project.image || "/placeholder.png"}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <CardTitle className="text-xl mb-2 line-clamp-1">
                          {project.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {project.description}
                        </p>
                        <Progress value={(project.raised / project.goal) * 100} className="h-2" />
                        <div className="mt-4 flex justify-between items-center text-sm">
                          <span className="font-medium">{project.raised} AVAX</span>
                          <span className="text-muted-foreground">
                            {((project.raised / project.goal) * 100).toFixed(1)}%
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
                  <Link key={project.id} href={`/platform/project/${project.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="p-0">
                        <div className="relative h-48">
                          <Image
                            src={project.image || "/placeholder.png"}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <CardTitle className="text-xl mb-2 line-clamp-1">
                          {project.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {project.description}
                        </p>
                        <Progress value={(project.raised / project.goal) * 100} className="h-2" />
                        <div className="mt-4 flex justify-between items-center text-sm">
                          <span className="font-medium">{project.raised} AVAX</span>
                          <span className="text-muted-foreground">
                            {((project.raised / project.goal) * 100).toFixed(1)}%
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
