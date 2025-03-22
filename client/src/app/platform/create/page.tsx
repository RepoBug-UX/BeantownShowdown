"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Upload, Snowflake, Plus, Trash2, Wallet } from "lucide-react";
import Navbar from "@/app/components/Navbar";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Separator } from "@/app/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Card, CardContent } from "@/app/components/ui/card";

// Define the types as provided
type Milestone = {
  description: string;
  targetAmount: number;
  isCompleted: boolean;
  submissionDetails?: string;
};

type CrowdfundInfo = {
  creator: string;
  fundingGoal: number;
  duration: number;
  milestones: Milestone[];
  campaignID: string;
  category: string;
  title: string;
  description: string;
  image: string;
  isFunded: boolean;
  isCompleted: boolean;
};

export default function CreateFundraiser() {
  // State to track form data
  const [formData, setFormData] = useState<Partial<CrowdfundInfo>>({
    title: "",
    description: "",
    category: "",
    fundingGoal: 0,
    duration: 30,
    image: "",
    milestones: [],
    creator: "", // This would typically be set from the connected wallet
  });

  // State to track milestones
  const [milestones, setMilestones] = useState<Milestone[]>([
    { description: "", targetAmount: 0, isCompleted: false },
  ]);

  // Handle adding a new milestone
  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { description: "", targetAmount: 0, isCompleted: false },
    ]);
  };

  // Handle removing a milestone
  const removeMilestone = (index: number) => {
    const updatedMilestones = [...milestones];
    updatedMilestones.splice(index, 1);
    setMilestones(updatedMilestones);
  };

  // Handle milestone field changes
  const handleMilestoneChange = (
    index: number,
    field: keyof Milestone,
    value: string | number
  ) => {
    const updatedMilestones = [...milestones];
    if (field === "targetAmount") {
      updatedMilestones[index][field] = Number(value);
    } else {
      updatedMilestones[index][field as "description" | "submissionDetails"] =
        value as string;
    }
    setMilestones(updatedMilestones);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create campaign data
    const campaignData = {
      ...formData,
      milestones,
    };

    try {
      // Call API to create project
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const data = await response.json();
      console.log("Project created successfully:", data);

      // Redirect to the project page or dashboard
      window.location.href = `/platform/project/${data.id}`;
    } catch (error) {
      console.error("Error creating project:", error);
      // Here you would handle errors, e.g., show an error message
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Fundraiser</h1>
          <p className="text-gray-600">
            Launch your project on the Avalanche blockchain
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8">
          {/* Project Details Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium mb-2"
                    >
                      Project Title
                    </label>
                    <Input
                      id="title"
                      placeholder="Enter a clear, concise title for your project"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium mb-2"
                    >
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="art">Art & Creative</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="defi">DeFi</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium mb-2"
                    >
                      Project Description
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project in detail. What are you building? Why is it important?"
                      rows={5}
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cover Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({
                              ...formData,
                              image: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    />
                    {formData.image && (
                      <div className="relative h-48 w-full mt-2">
                        <Image
                          src={formData.image}
                          alt="Project cover"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Funding Goals Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Funding Goals</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="fundingGoal"
                      className="block text-sm font-medium mb-2"
                    >
                      Funding Target
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <Input
                        id="fundingGoal"
                        type="number"
                        placeholder="0.00"
                        className="pl-7"
                        value={formData.fundingGoal || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({
                            ...formData,
                            fundingGoal: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Set a realistic goal for your project. Funds will be in
                      AVAX.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium mb-2"
                    >
                      Duration (days)
                    </label>
                    <div className="relative">
                      <Select
                        value={formData.duration?.toString()}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, duration: Number(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <Clock className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="creator"
                      className="block text-sm font-medium mb-2"
                    >
                      Creator Wallet Address
                    </label>
                    <Input
                      id="creator"
                      placeholder="0x..."
                      value={formData.creator || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, creator: e.target.value })
                      }
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Funds will be sent to this address when the campaign ends
                      successfully.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Milestones Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Milestones</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-medium">
                          Milestone {index + 1}
                        </h3>
                        {milestones.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMilestone(index)}
                          >
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor={`milestone-desc-${index}`}
                            className="block text-sm font-medium mb-2"
                          >
                            Description
                          </label>
                          <Textarea
                            id={`milestone-desc-${index}`}
                            placeholder="Describe what will be accomplished in this milestone"
                            rows={2}
                            value={milestone.description}
                            onChange={(
                              e: React.ChangeEvent<HTMLTextAreaElement>
                            ) =>
                              handleMilestoneChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`milestone-amount-${index}`}
                            className="block text-sm font-medium mb-2"
                          >
                            Target Amount
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                $
                              </span>
                            </div>
                            <Input
                              id={`milestone-amount-${index}`}
                              type="number"
                              placeholder="0.00"
                              className="pl-7"
                              value={milestone.targetAmount || ""}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                handleMilestoneChange(
                                  index,
                                  "targetAmount",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={`milestone-details-${index}`}
                            className="block text-sm font-medium mb-2"
                          >
                            Submission Details (Optional)
                          </label>
                          <Textarea
                            id={`milestone-details-${index}`}
                            placeholder="Details about what needs to be submitted to verify this milestone"
                            rows={2}
                            value={milestone.submissionDetails || ""}
                            onChange={(
                              e: React.ChangeEvent<HTMLTextAreaElement>
                            ) =>
                              handleMilestoneChange(
                                index,
                                "submissionDetails",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={addMilestone}
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Milestone
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Submit Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              By launching a project, you agree to Snowball's Terms of Service
              and Privacy Policy.
            </p>
            <div className="flex gap-4">
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800"
              >
                Launch Project
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
