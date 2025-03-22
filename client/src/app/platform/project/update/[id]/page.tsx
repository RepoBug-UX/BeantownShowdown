"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

import Navbar from "@/app/components/Navbar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Separator } from "@/app/components/ui/separator";
import { useToast } from "@/app/components/ui/use-toast";

// Mock project data - in a real app, you would fetch this from an API
const projects = [
  {
    id: "1",
    title: "Community Garden Expansion",
    category: "Environment",
    description:
      "Expanding the local community garden with new plots and irrigation system.",
    fullDescription:
      "The Community Garden Expansion project aims to double the size of our current garden, adding 20 new plots that will be available to local residents. We'll also install a modern irrigation system to conserve water while ensuring plants thrive. This expansion will help address food security issues in our neighborhood and create more green space for community gathering.",
    raised: 12000,
    goal: 15000,
    deadline: "2023-08-15",
    backersCount: 56,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1624598389798-b6f7aa846fc9?q=80&w=500",
    creator: "Green Spaces Initiative",
    creatorImage: "/images/creators/green-spaces.jpg",
    updates: [
      {
        date: "2023-03-15",
        title: "Land secured for expansion",
        content:
          "We're excited to announce that the city council has approved our request for the adjacent plot of land for our garden expansion!",
      },
      {
        date: "2023-02-28",
        title: "Planning phase completed",
        content:
          "We've finished the design plans for the garden expansion and irrigation system. Local architects have volunteered their services for this project.",
      },
    ],
    milestones: [
      {
        title: "Land Acquisition",
        description: "Secure the adjacent land from the city",
        target: 2000,
        completed: true,
      },
      {
        title: "Irrigation System",
        description: "Install water-efficient irrigation",
        target: 7000,
        completed: false,
      },
      {
        title: "New Garden Plots",
        description: "Build and prepare 20 new garden plots",
        target: 6000,
        completed: false,
      },
    ],
  },
  {
    id: "2",
    title: "Neighborhood Playground",
    category: "Community",
    description:
      "Building a new playground with accessible equipment for all children.",
    fullDescription:
      "Our neighborhood lacks a safe, modern playground for children. This project will create an inclusive play space with equipment accessible to children of all abilities. We'll use sustainable materials and incorporate natural elements to create a welcoming environment for families.",
    raised: 8500,
    goal: 20000,
    deadline: "2023-09-30",
    backersCount: 42,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=500",
    creator: "Community First",
    creatorImage: "/images/creators/community-first.jpg",
    updates: [
      {
        date: "2023-03-10",
        title: "Equipment selected",
        content:
          "After consulting with local families, we've selected the playground equipment that will be installed.",
      },
    ],
    milestones: [
      {
        title: "Design Phase",
        description: "Create playground designs with community input",
        target: 2500,
        completed: true,
      },
      {
        title: "Equipment Purchase",
        description: "Buy inclusive playground equipment",
        target: 12000,
        completed: false,
      },
      {
        title: "Installation",
        description: "Install equipment and safety surfacing",
        target: 5500,
        completed: false,
      },
    ],
  },
];

interface Update {
  date: string;
  title: string;
  content: string;
}

interface Milestone {
  title: string;
  description: string;
  target: number;
  completed: boolean;
}

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  raised: number;
  goal: number;
  deadline: string;
  backersCount: number;
  status: string;
  image: string;
  creator?: string;
  creatorImage?: string;
  updates: Update[];
  milestones: Milestone[];
}

export default function UpdateProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    category: "",
    description: "",
    fullDescription: "",
    goal: 0,
    deadline: "",
    image: "",
    updates: [],
    milestones: [],
  });

  const [newUpdate, setNewUpdate] = useState<Update>({
    date: new Date().toISOString().split("T")[0],
    title: "",
    content: "",
  });

  const [newMilestone, setNewMilestone] = useState<Milestone>({
    title: "",
    description: "",
    target: 0,
    completed: false,
  });

  useEffect(() => {
    // In a real app, you would fetch the project data from an API
    // For now, we'll use our mock data
    const projectId = Array.isArray(id) ? id[0] : (id as string);
    const foundProject = projects.find((p) => p.id === projectId);

    // Simulate API loading
    setTimeout(() => {
      if (foundProject) {
        setProject(foundProject);
        setFormData({
          title: foundProject.title,
          category: foundProject.category,
          description: foundProject.description,
          fullDescription: foundProject.fullDescription,
          goal: foundProject.goal,
          deadline: foundProject.deadline,
          image: foundProject.image,
          updates: [...foundProject.updates],
          milestones: [...foundProject.milestones],
        });
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "goal" ? Number(value) : value,
    }));
  };

  const handleUpdateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addUpdate = () => {
    if (!newUpdate.title || !newUpdate.content) {
      toast({
        title: "Error",
        description: "Please fill out both title and content for the update.",
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      updates: [
        ...(prev.updates || []),
        { ...newUpdate, date: new Date().toISOString().split("T")[0] },
      ],
    }));

    setNewUpdate({
      date: new Date().toISOString().split("T")[0],
      title: "",
      content: "",
    });

    toast({
      title: "Update added",
      description: "Your update has been added to the project.",
    });
  };

  const removeUpdate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      updates: prev.updates?.filter((_, i) => i !== index),
    }));

    toast({
      title: "Update removed",
      description: "The update has been removed from your project.",
    });
  };

  const handleMilestoneChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewMilestone((prev) => ({
      ...prev,
      [name]: name === "target" ? Number(value) : value,
    }));
  };

  const handleMilestoneCompletedChange = (completed: boolean) => {
    setNewMilestone((prev) => ({
      ...prev,
      completed,
    }));
  };

  const addMilestone = () => {
    if (
      !newMilestone.title ||
      !newMilestone.description ||
      !newMilestone.target
    ) {
      toast({
        title: "Error",
        description: "Please fill out all milestone fields.",
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      milestones: [...(prev.milestones || []), { ...newMilestone }],
    }));

    setNewMilestone({
      title: "",
      description: "",
      target: 0,
      completed: false,
    });

    toast({
      title: "Milestone added",
      description: "Your milestone has been added to the project.",
    });
  };

  const removeMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones?.filter((_, i) => i !== index),
    }));

    toast({
      title: "Milestone removed",
      description: "The milestone has been removed from your project.",
    });
  };

  const toggleMilestoneCompleted = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones?.map((milestone, i) =>
        i === index
          ? { ...milestone, completed: !milestone.completed }
          : milestone
      ),
    }));
  };

  const saveProject = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.fullDescription ||
      !formData.goal
    ) {
      toast({
        title: "Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    // Simulate API call to save project
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Success",
        description: "Project has been updated successfully!",
      });

      // Navigate back to project page
      router.push(`/platform/project/${id}`);
    }, 1500);
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
            <h2 className="text-2xl font-bold text-gray-800">
              Project Not Found
            </h2>
            <p className="mt-2 text-gray-600">
              The project you're looking for doesn't exist or you don't have
              access to edit it.
            </p>
            <Link href="/platform/dashboard">
              <Button className="mt-6">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href={`/platform/project/${id}`} className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Update Project</h1>
            <p className="text-gray-600">
              Make changes to your project details, add updates, and manage
              milestones
            </p>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter project title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Community">Community</SelectItem>
                        <SelectItem value="Environment">Environment</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of your project (displayed in cards)"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullDescription">Full Description</Label>
                    <Textarea
                      id="fullDescription"
                      name="fullDescription"
                      value={formData.fullDescription}
                      onChange={handleInputChange}
                      placeholder="Detailed description of your project"
                      rows={5}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Funding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal">Funding Goal</Label>
                      <Input
                        id="goal"
                        name="goal"
                        type="number"
                        value={formData.goal}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-md overflow-hidden">
                      <img
                        src={formData.image}
                        alt={formData.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="Enter image URL"
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Change Image
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="updates">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Project Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.updates && formData.updates.length > 0 ? (
                    <div className="space-y-6">
                      {formData.updates.map((update, index) => (
                        <div
                          key={index}
                          className="border rounded-md p-4 relative"
                        >
                          <div className="absolute right-0 top-0 p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full flex items-center justify-center"
                              onClick={() => removeUpdate(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="text-sm text-gray-500 mb-1">
                            {new Date(update.date).toLocaleDateString()}
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            {update.title}
                          </h3>
                          <p className="text-gray-700">{update.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No updates posted yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Update</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="update-title">Update Title</Label>
                    <Input
                      id="update-title"
                      name="title"
                      value={newUpdate.title}
                      onChange={handleUpdateChange}
                      placeholder="Enter update title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="update-content">Update Content</Label>
                    <Textarea
                      id="update-content"
                      name="content"
                      value={newUpdate.content}
                      onChange={handleUpdateChange}
                      placeholder="Share your progress..."
                      rows={5}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={addUpdate} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Update
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="milestones">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Project Milestones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.milestones && formData.milestones.length > 0 ? (
                    <div className="space-y-4">
                      {formData.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="border rounded-md p-4 relative"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">
                              {milestone.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant={
                                  milestone.completed ? "default" : "outline"
                                }
                                size="sm"
                                className="h-8 min-w-[120px] font-medium"
                                onClick={() => toggleMilestoneCompleted(index)}
                              >
                                {milestone.completed
                                  ? "Completed"
                                  : "Mark Complete"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full flex items-center justify-center"
                                onClick={() => removeMilestone(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600">
                            {milestone.description}
                          </p>
                          <p className="text-gray-500 text-sm mt-2">
                            Target: ${milestone.target.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No milestones defined yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Milestone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="milestone-title">Milestone Title</Label>
                    <Input
                      id="milestone-title"
                      name="title"
                      value={newMilestone.title}
                      onChange={handleMilestoneChange}
                      placeholder="Enter milestone title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="milestone-description">Description</Label>
                    <Textarea
                      id="milestone-description"
                      name="description"
                      value={newMilestone.description}
                      onChange={handleMilestoneChange}
                      placeholder="Describe this milestone..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="milestone-target">Target Amount</Label>
                    <Input
                      id="milestone-target"
                      name="target"
                      type="number"
                      value={newMilestone.target || ""}
                      onChange={handleMilestoneChange}
                      placeholder="Enter amount needed"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="milestone-completed"
                      checked={newMilestone.completed}
                      onChange={(e) =>
                        handleMilestoneCompletedChange(e.target.checked)
                      }
                      className="rounded"
                    />
                    <Label htmlFor="milestone-completed">
                      Already completed
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={addMilestone} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Milestone
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Link href={`/platform/project/${id}`} className="mr-4">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={saveProject} disabled={saving}>
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
