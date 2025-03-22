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
import { useAccount } from "wagmi";

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
import { Project, Milestone as MilestoneType } from "@/types/ProjectTypes";

// Define interface for updates as it's "any[]" in the type definition
interface Update {
  title: string;
  content: string;
  date: string;
}

// Adapt the MongoDB Milestone type to the form
interface FormMilestone {
  title: string;
  description: string;
  target: number;
  completed: boolean;
}

interface FormData {
  title: string;
  category: string;
  description: string;
  fullDescription?: string;
  fundingGoal: number;
  deadline: string;
  image: string;
  creatorName?: string;
  creatorBio?: string;
  updates: Update[];
  milestones: FormMilestone[];
}

export default function UpdateProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "Other",
    description: "",
    fullDescription: "",
    fundingGoal: 0,
    deadline: "",
    image: "",
    creatorName: "",
    creatorBio: "",
    updates: [],
    milestones: [],
  });

  const [newUpdate, setNewUpdate] = useState<Update>({
    date: new Date().toISOString().split("T")[0],
    title: "",
    content: "",
  });

  const [newMilestone, setNewMilestone] = useState<FormMilestone>({
    title: "",
    description: "",
    target: 0,
    completed: false,
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!isConnected || !address) {
        return;
      }

      setLoading(true);
      try {
        const projectId = Array.isArray(id) ? id[0] : (id as string);
        const response = await fetch(`/api/projects?id=${projectId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }

        const projectData = await response.json();

        // Check if the user is the creator of this project
        if (projectData.creatorAddress !== address) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        setProject(projectData);

        // Format dates and convert milestone format
        const formattedMilestones =
          projectData.milestones?.map((m: MilestoneType) => ({
            title: m.description.split(":")[0] || "Milestone", // Extract title from description if possible
            description: m.description,
            target: m.targetAmount,
            completed: m.isCompleted,
          })) || [];

        setFormData({
          title: projectData.title,
          category: projectData.category || "Other",
          description: projectData.description,
          fullDescription: projectData.description, // Use same description if no fullDescription exists
          fundingGoal: projectData.fundingGoal,
          deadline: new Date(projectData.deadline).toISOString().split("T")[0],
          image: projectData.image,
          creatorName: projectData.creatorName || "",
          creatorBio: projectData.creatorBio || "",
          updates: projectData.updates || [],
          milestones: formattedMilestones,
        });
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, address, isConnected, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "fundingGoal" ? Number(value) : value,
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
        description: "Please fill in both title and content for the update.",
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      updates: [
        {
          title: newUpdate.title,
          content: newUpdate.content,
          date: newUpdate.date,
        },
        ...(prev.updates || []),
      ],
    }));

    // Reset the form
    setNewUpdate({
      date: new Date().toISOString().split("T")[0],
      title: "",
      content: "",
    });

    toast({
      title: "Update Added",
      description: "The update has been added to your project.",
    });
  };

  const removeUpdate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      updates: prev.updates.filter((_, i) => i !== index),
    }));
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
    if (!newMilestone.title || !newMilestone.description) {
      toast({
        title: "Error",
        description:
          "Please provide both a title and description for the milestone.",
        variant: "destructive",
      });
      return;
    }

    if (newMilestone.target <= 0) {
      toast({
        title: "Error",
        description: "Please enter a target amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          title: newMilestone.title,
          description: newMilestone.description,
          target: newMilestone.target,
          completed: newMilestone.completed,
        },
      ],
    }));

    // Reset the form
    setNewMilestone({
      title: "",
      description: "",
      target: 0,
      completed: false,
    });

    toast({
      title: "Milestone Added",
      description: "The milestone has been added to your project.",
    });
  };

  const removeMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const toggleMilestoneCompleted = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) =>
        i === index
          ? { ...milestone, completed: !milestone.completed }
          : milestone
      ),
    }));
  };

  const saveProject = async () => {
    if (!formData.title || !formData.description || !formData.fundingGoal) {
      toast({
        title: "Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Convert form milestones to DB format
      const dbMilestones = formData.milestones.map((m) => ({
        description: m.description,
        targetAmount: m.target,
        isCompleted: m.completed,
      }));

      // Prepare data for API call
      const projectId = Array.isArray(id) ? id[0] : (id as string);
      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        fundingGoal: formData.fundingGoal,
        image: formData.image,
        creatorName: formData.creatorName,
        creatorBio: formData.creatorBio,
        updates: formData.updates,
        milestones: dbMilestones,
      };

      // Update the project via the API
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      toast({
        title: "Success",
        description: "Project has been updated successfully!",
      });

      // Navigate back to project page
      router.push(`/platform/project/${projectId}`);
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Wallet Not Connected
            </h2>
            <p className="mt-2 text-gray-600">
              Please connect your wallet to edit your project.
            </p>
            <Link href="/platform/dashboard">
              <Button className="mt-6">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  if (unauthorized) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Unauthorized Access
            </h2>
            <p className="mt-2 text-gray-600">
              You don't have permission to edit this project.
            </p>
            <Link href="/platform/dashboard">
              <Button className="mt-6">Back to Dashboard</Button>
            </Link>
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
              The project you're looking for doesn't exist.
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
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Description of your project"
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creatorName">Creator Name (Optional)</Label>
                    <Input
                      id="creatorName"
                      name="creatorName"
                      value={formData.creatorName}
                      onChange={handleInputChange}
                      placeholder="Your name or organization name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creatorBio">Creator Bio (Optional)</Label>
                    <Textarea
                      id="creatorBio"
                      name="creatorBio"
                      value={formData.creatorBio}
                      onChange={handleInputChange}
                      placeholder="Brief bio about you or your organization"
                      rows={3}
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
                      <Label htmlFor="fundingGoal">Funding Goal</Label>
                      <Input
                        id="fundingGoal"
                        name="fundingGoal"
                        type="number"
                        value={formData.fundingGoal}
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
