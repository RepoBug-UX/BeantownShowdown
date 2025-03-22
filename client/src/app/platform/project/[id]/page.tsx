"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  Share2,
  User,
  Wallet,
} from "lucide-react";
import Image from "next/image";

import Navbar from "@/app/components/Navbar";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Card, CardContent } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import { useAccount } from "wagmi";
import { Input } from "@/app/components/ui/input";
import BackProject from "@/app/components/BackProject";
import DaoVoting from "@/app/components/DaoVoting";

// Define the Project interface
interface Backer {
  address: string;
  amount: number;
  timestamp: string;
}

interface Milestone {
  description: string;
  targetAmount: number;
  isCompleted: boolean;
  submissionDetails?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  fullDescription?: string;
  category: string;
  fundingGoal: number;
  raised: number;
  backersCount: number;
  deadline: string;
  status: string;
  image: string;
  // New fields for creator and backers
  creatorAddress: string;
  creatorName?: string;
  creatorBio?: string;
  backers: Backer[];
  // Other fields
  team?: any[];
  milestones?: Milestone[];
  updates?: any[];
}

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // Fetch the project data from the API
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }
        const data = await response.json();
        setProject(data);
      } catch (err: any) {
        console.error("Error fetching project:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Calculate days left until deadline
  const calculateDaysLeft = (deadline: string): number => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = Math.abs(deadlineDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Refresh project data
  const refreshProjectData = async () => {
    try {
      const response = await fetch(`/api/projects?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }
      const data = await response.json();
      setProject(data);
    } catch (err: any) {
      console.error("Error refreshing project:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find the project you're looking for.
            </p>
            <Link href="/platform/explore">
              <Button>Explore Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = (project.raised / project.fundingGoal) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/platform/explore"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Explore
          </Link>
        </div>

        {/* Project Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {project.title}
            </h1>
            <p className="text-lg text-gray-600 mb-6">{project.description}</p>

            <div className="aspect-video bg-gray-200 rounded-lg mb-6 relative">
              {project.image ? (
                project.image.startsWith("data:") ? (
                  // Use regular img tag for base64 images
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  // Use Next.js Image component for regular URLs
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">Project Image</div>
                </div>
              )}
            </div>

            {/* Creator information */}
            <div className="flex items-center mb-6 p-4 border border-gray-200 rounded-lg">
              <User className="h-10 w-10 text-gray-400 mr-3" />
              <div>
                <p className="font-medium">
                  {project.creatorName || "Anonymous Creator"}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  {project.creatorBio || "No bio provided"}
                </p>
                <p className="text-xs font-mono text-gray-400">
                  {project.creatorAddress}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <Progress value={progressPercentage} className="mb-2" />
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">
                      ${project.raised.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      of ${project.fundingGoal.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {Math.round(progressPercentage)}% funded
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">
                        {project.backersCount} backers
                      </p>
                      <p className="text-sm text-gray-500">
                        Support this project
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">
                        {calculateDaysLeft(project.deadline)} days left
                      </p>
                      <p className="text-sm text-gray-500">Campaign end date</p>
                    </div>
                  </div>
                </div>

                {/* Back this project button - use the new component */}
                <div className="mb-4">
                  <BackProject
                    projectId={id as string}
                    projectTitle={project.title}
                    onBackSuccess={refreshProjectData}
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={() => {
                    window.open(
                      "https://media.licdn.com/dms/image/v2/C4E03AQH-7MawU6UQmg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1634521118617?e=1747872000&v=beta&t=SPLf1c5GytYiUQ-bFtpIA5jdp42ZWP5ilAcCyXNKrs4"
                    );
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>

                {/* DAO Governance Section - Only show if project has milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="text-sm font-medium mb-2">
                      DAO Governance
                    </div>
                    <DaoVoting
                      projectId={id as string}
                      milestones={
                        project.milestones?.map((m, index) => ({
                          id: index + 1,
                          description: m.description,
                          targetAmount: m.targetAmount,
                          isCompleted: m.isCompleted,
                        })) || []
                      }
                      backers={project.backers || []}
                      userIsBacker={
                        project.backers?.some(
                          (backer) =>
                            backer.address.toLowerCase() ===
                            address?.toLowerCase()
                        ) || false
                      }
                      onVoteSuccess={refreshProjectData}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Content */}
        <Tabs defaultValue="about" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="backers">Backers</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <h2 className="text-2xl font-semibold">About This Project</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {project.fullDescription || project.description}
            </p>
          </TabsContent>

          <TabsContent value="backers" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Project Backers</h2>
            {project.backers && project.backers.length > 0 ? (
              <div className="space-y-4">
                {project.backers.map((backer, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-mono text-sm">
                            {backer.address.slice(0, 6)}...
                            {backer.address.slice(-4)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(backer.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="font-medium">
                        ${backer.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No backers yet. Be the first to back this project!
              </p>
            )}
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Project Updates</h2>
            {project.updates && project.updates.length > 0 ? (
              <div className="space-y-6">
                {project.updates.map((update: any, index: number) => (
                  <div key={index} className="border-b pb-6 mb-6 last:border-0">
                    <div className="flex items-center mb-3">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {update.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">{update.title}</h3>
                    <p className="text-gray-700">{update.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No updates yet.</p>
            )}
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Project Milestones</h2>
            <div className="space-y-6">
              {project.milestones &&
                project.milestones.map((milestone: any, index: number) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          milestone.isCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">
                          {milestone.title || "Milestone"}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {milestone.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Funding goal: $
                          {(milestone.targetAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          milestone.isCompleted
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {milestone.isCompleted ? "Completed" : "In progress"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Projects - You'd fetch these based on category or tags */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Similar Projects</h2>
          <div className="text-gray-600">
            Similar projects in the {project.category} category will appear
            here.
          </div>
        </section>
      </main>
    </div>
  );
}
