"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Users, Clock, Share2 } from "lucide-react";

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

// Mock project data - in a real app, you would fetch this from an API
const projects = [
  {
    id: 1,
    title: "Avalanche DeFi Hub",
    category: "Technology",
    description: "A comprehensive dashboard for DeFi applications on Avalanche",
    fullDescription:
      "The Avalanche DeFi Hub is a groundbreaking platform designed to unify and simplify the DeFi experience on the Avalanche blockchain. Our goal is to create a one-stop solution for users to manage their DeFi investments, monitor yield farms, track portfolio performance, and discover new opportunities—all with the speed and low cost that Avalanche provides. The platform will feature intuitive analytics, risk assessment tools, and seamless integrations with major Avalanche DeFi protocols.",
    raised: 45000,
    goal: 100000,
    daysLeft: 15,
    backers: 230,
    image: "/images/defi.jpg",
    creator: "DeFi Innovations",
    creatorImage: "/images/creators/defi-innovations.jpg",
    updates: [
      {
        date: "2023-03-18",
        title: "Development Milestone Reached",
        content:
          "We're excited to announce that we've completed the core functionality of our dashboard interface!",
      },
      {
        date: "2023-03-10",
        title: "New Partnership Announcement",
        content:
          "We've partnered with TraderJoe to provide enhanced liquidity data in our platform.",
      },
    ],
    team: [
      {
        name: "Alex Johnson",
        role: "Lead Developer",
        image: "/images/team/alex.jpg",
      },
      {
        name: "Sarah Chen",
        role: "UX Designer",
        image: "/images/team/sarah.jpg",
      },
      {
        name: "Raj Patel",
        role: "Blockchain Specialist",
        image: "/images/team/raj.jpg",
      },
    ],
    milestones: [
      {
        title: "Alpha Release",
        description: "Initial dashboard with basic tracking features",
        target: 30000,
        completed: true,
      },
      {
        title: "Beta Launch",
        description: "Full protocol integration and advanced analytics",
        target: 60000,
        completed: false,
      },
      {
        title: "Mobile App",
        description: "Native mobile application for iOS and Android",
        target: 85000,
        completed: false,
      },
      {
        title: "Public Release",
        description: "Full public launch with marketing campaign",
        target: 100000,
        completed: false,
      },
    ],
  },
  {
    id: 2,
    title: "NFT Marketplace for Digital Artists",
    category: "Art",
    description:
      "Empowering digital artists through affordable NFT minting and sales",
    fullDescription:
      "Our NFT Marketplace is specifically designed to address the challenges faced by digital artists in today's competitive NFT landscape. By leveraging Avalanche's low-cost infrastructure, we're creating a platform where artists can mint NFTs at a fraction of the cost on other chains. The platform will feature curated collections, artist spotlights, and a unique royalty system that ensures creators continue to benefit from secondary sales in perpetuity.",
    raised: 28000,
    goal: 50000,
    daysLeft: 22,
    backers: 156,
    image: "/images/art.jpg",
    creator: "Digital Art Collective",
    creatorImage: "/images/creators/art-collective.jpg",
    updates: [
      {
        date: "2023-03-15",
        title: "Artist Onboarding Program",
        content:
          "We've begun accepting applications for our early artist access program!",
      },
    ],
    team: [
      {
        name: "Maya Wong",
        role: "Art Director",
        image: "/images/team/maya.jpg",
      },
      {
        name: "Jacob Smith",
        role: "Platform Developer",
        image: "/images/team/jacob.jpg",
      },
    ],
    milestones: [
      {
        title: "Artist Dashboard",
        description: "Creator tools and minting interface",
        target: 20000,
        completed: true,
      },
      {
        title: "Marketplace Launch",
        description: "Public marketplace with payment integration",
        target: 35000,
        completed: false,
      },
      {
        title: "Mobile Gallery",
        description: "Mobile optimized viewing experience",
        target: 50000,
        completed: false,
      },
    ],
  },
  {
    id: 3,
    title: "GameFi Adventure Realm",
    category: "Games",
    description:
      "Play-to-earn adventure game with immersive storyline and tokenized assets",
    fullDescription:
      "GameFi Adventure Realm is an expansive play-to-earn RPG that combines compelling storytelling with blockchain economics. Players can embark on quests, collect unique items, and earn tokens through gameplay. All in-game assets are tokenized on Avalanche, allowing for true ownership and trading in a vibrant player-driven economy. Our game features an original fantasy world with multiple character classes, crafting systems, and both PvE and PvP elements.",
    raised: 67000,
    goal: 120000,
    daysLeft: 8,
    backers: 345,
    image: "/images/games.jpg",
    creator: "Blockchain Gaming Studios",
    creatorImage: "/images/creators/gaming-studios.jpg",
    updates: [
      {
        date: "2023-03-20",
        title: "Alpha Testing Begins",
        content:
          "Our closed alpha testing phase has begun with our early backers!",
      },
      {
        date: "2023-03-05",
        title: "Character NFT Preview",
        content:
          "Check out the first look at our character collection designs.",
      },
    ],
    team: [
      {
        name: "David Lee",
        role: "Game Designer",
        image: "/images/team/david.jpg",
      },
      {
        name: "Emma Rodriguez",
        role: "Lead Artist",
        image: "/images/team/emma.jpg",
      },
      {
        name: "Michael Chang",
        role: "Blockchain Engineer",
        image: "/images/team/michael.jpg",
      },
    ],
    milestones: [
      {
        title: "Concept & Design",
        description: "Game design, art style and economics",
        target: 40000,
        completed: true,
      },
      {
        title: "Alpha Version",
        description: "Initial playable version with core mechanics",
        target: 80000,
        completed: false,
      },
      {
        title: "Beta Launch",
        description: "Public beta with token integration",
        target: 100000,
        completed: false,
      },
      {
        title: "Full Release",
        description: "Complete game launch with marketplace",
        target: 120000,
        completed: false,
      },
    ],
  },
  {
    id: 4,
    title: "DAO Governance Framework",
    category: "Innovation",
    description:
      "Building the future of decentralized governance for community projects",
    fullDescription:
      "The DAO Governance Framework is a modular toolkit that enables communities to quickly deploy customized, secure DAO structures. Our framework offers flexible voting mechanisms, treasury management tools, proposal systems, and integration with major DeFi protocols. We're focusing on creating governance systems that can be adapted to the specific needs of different types of organizations, from investment clubs to social impact initiatives.",
    raised: 83000,
    goal: 150000,
    daysLeft: 19,
    backers: 412,
    image: "/images/dao.jpg",
    creator: "DAO Architects",
    creatorImage: "/images/creators/dao-architects.jpg",
    updates: [
      {
        date: "2023-03-22",
        title: "Voting Module Completed",
        content:
          "We've finalized the core voting module with multiple voting strategies!",
      },
    ],
    team: [
      {
        name: "Isabella Kim",
        role: "Protocol Designer",
        image: "/images/team/isabella.jpg",
      },
      {
        name: "Thomas Wilson",
        role: "Smart Contract Developer",
        image: "/images/team/thomas.jpg",
      },
    ],
    milestones: [
      {
        title: "Core Framework",
        description: "Base modules for governance and voting",
        target: 50000,
        completed: true,
      },
      {
        title: "Treasury Tools",
        description: "Multi-sig and automated treasury management",
        target: 100000,
        completed: false,
      },
      {
        title: "Template Library",
        description: "Pre-built templates for common DAO types",
        target: 130000,
        completed: false,
      },
      {
        title: "Integration SDK",
        description: "Developer tools for easy integration",
        target: 150000,
        completed: false,
      },
    ],
  },
  {
    id: 5,
    title: "Sustainable Blockchain Initiative",
    category: "Environment",
    description:
      "Reducing carbon footprint of blockchain operations through innovative solutions",
    fullDescription:
      "The Sustainable Blockchain Initiative is dedicated to developing solutions that minimize the environmental impact of blockchain technology. Our project leverages Avalanche's energy-efficient consensus mechanism as a starting point, while building additional tools to measure, reduce, and offset carbon emissions from blockchain activities. We're creating a sustainability scoring system for dApps, carbon credit NFTs, and incentive structures for eco-friendly blockchain practices.",
    raised: 32000,
    goal: 80000,
    daysLeft: 28,
    backers: 198,
    image: "/images/environment.jpg",
    creator: "Green Chain Collective",
    creatorImage: "/images/creators/green-chain.jpg",
    updates: [
      {
        date: "2023-03-12",
        title: "Carbon Calculator Beta",
        content:
          "Our transaction carbon footprint calculator is now available for testing.",
      },
    ],
    team: [
      {
        name: "Olivia Green",
        role: "Environmental Scientist",
        image: "/images/team/olivia.jpg",
      },
      {
        name: "Carlos Mendez",
        role: "Sustainability Engineer",
        image: "/images/team/carlos.jpg",
      },
    ],
    milestones: [
      {
        title: "Research Phase",
        description: "Analysis and methodology development",
        target: 20000,
        completed: true,
      },
      {
        title: "Measurement Tools",
        description: "Carbon footprint calculation tools",
        target: 40000,
        completed: false,
      },
      {
        title: "Offset Marketplace",
        description: "Platform for carbon credit trading",
        target: 60000,
        completed: false,
      },
      {
        title: "Industry Standards",
        description: "Publishing proposed standards",
        target: 80000,
        completed: false,
      },
    ],
  },
  {
    id: 6,
    title: "Community Music Platform",
    category: "Music",
    description:
      "Decentralized streaming service that fairly compensates artists",
    fullDescription:
      "The Community Music Platform is revolutionizing how independent musicians distribute their work and connect with fans. Our decentralized streaming service ensures that artists receive fair compensation through direct fan-to-creator payments without intermediaries taking large cuts. The platform features community curation, tokenized fan clubs, and innovative music NFTs that enable new forms of ownership and royalty distribution.",
    raised: 21000,
    goal: 60000,
    daysLeft: 11,
    backers: 123,
    image: "/images/music.jpg",
    creator: "Decentralized Audio",
    creatorImage: "/images/creators/decentralized-audio.jpg",
    updates: [
      {
        date: "2023-03-17",
        title: "Artist Signup Portal",
        content:
          "We've launched the initial version of our artist onboarding system.",
      },
    ],
    team: [
      {
        name: "Jasmine Taylor",
        role: "Music Industry Advisor",
        image: "/images/team/jasmine.jpg",
      },
      {
        name: "Kevin Park",
        role: "Frontend Developer",
        image: "/images/team/kevin.jpg",
      },
    ],
    milestones: [
      {
        title: "Platform Design",
        description: "UI/UX and technical architecture",
        target: 15000,
        completed: true,
      },
      {
        title: "Artist Portal",
        description: "Upload and management tools for creators",
        target: 30000,
        completed: false,
      },
      {
        title: "Listener App",
        description: "Music streaming application",
        target: 45000,
        completed: false,
      },
      {
        title: "Royalty System",
        description: "Automated payments and analytics",
        target: 60000,
        completed: false,
      },
    ],
  },
];

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the project data from an API
    // For now, we'll use our mock data
    const projectId = Array.isArray(id)
      ? parseInt(id[0])
      : parseInt(id as string);
    const foundProject = projects.find((p) => p.id === projectId);

    // Simulate API loading
    setTimeout(() => {
      setProject(foundProject);
      setLoading(false);
    }, 500);
  }, [id]);

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

  const progressPercentage = (project.raised / project.goal) * 100;

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

            <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-gray-400">Project Image</div>
            </div>

            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
              <div>
                <p className="font-medium">{project.creator}</p>
                <p className="text-sm text-gray-500">
                  {project.backers} previous projects
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
                      of ${project.goal.toLocaleString()}
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
                      <p className="font-medium">{project.backers} backers</p>
                      <p className="text-sm text-gray-500">
                        Support this project
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">
                        {project.daysLeft} days left
                      </p>
                      <p className="text-sm text-gray-500">Campaign end date</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mb-3"
                  onClick={() => {
                    // In a real app, this would open a backing modal
                    alert("Backing functionality would open here");
                  }}
                >
                  Back this project
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Content */}
        <Tabs defaultValue="about" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <h2 className="text-2xl font-semibold">About This Project</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {project.fullDescription}
            </p>
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

          <TabsContent value="team" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Meet the Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.team &&
                project.team.map((member: any, index: number) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
                      <h3 className="font-medium mb-1">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
            </div>
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
                          milestone.completed
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{milestone.title}</h3>
                        <p className="text-gray-600 mb-2">
                          {milestone.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Funding goal: ${milestone.target.toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          milestone.completed
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {milestone.completed ? "Completed" : "In progress"}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects
              .filter(
                (p) => p.id !== project.id && p.category === project.category
              )
              .slice(0, 3)
              .map((relatedProject) => (
                <Link
                  href={`/platform/project/${relatedProject.id}`}
                  key={relatedProject.id}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="aspect-video bg-gray-200 rounded-md mb-4"></div>
                      <h3 className="font-medium mb-2">
                        {relatedProject.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {relatedProject.description}
                      </p>
                      <Progress
                        value={
                          (relatedProject.raised / relatedProject.goal) * 100
                        }
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          ${relatedProject.raised.toLocaleString()} raised
                        </span>
                        <span>{relatedProject.daysLeft} days left</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
