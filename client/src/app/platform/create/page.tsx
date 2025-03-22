"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, Upload, Snowflake, Plus, Trash2, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

// Define the types as provided
type Milestone = {
  description: string
  targetAmount: number
  isCompleted: boolean
  submissionDetails?: string
}

type CrowdfundInfo = {
  creator: string
  fundingGoal: number
  duration: number
  milestones: Milestone[]
  campaignID: string
  category: string
  title: string
  description: string
  image: string
  isFunded: boolean
  isCompleted: boolean
}

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
  })

  // State to track milestones
  const [milestones, setMilestones] = useState<Milestone[]>([{ description: "", targetAmount: 0, isCompleted: false }])

  // Handle adding a new milestone
  const addMilestone = () => {
    setMilestones([...milestones, { description: "", targetAmount: 0, isCompleted: false }])
  }

  // Handle removing a milestone
  const removeMilestone = (index: number) => {
    const updatedMilestones = [...milestones]
    updatedMilestones.splice(index, 1)
    setMilestones(updatedMilestones)
  }

  // Handle milestone field changes
  const handleMilestoneChange = (index: number, field: keyof Milestone, value: string | number) => {
    const updatedMilestones = [...milestones]
    if (field === "targetAmount") {
      updatedMilestones[index][field] = Number(value)
    } else {
      updatedMilestones[index][field as "description" | "submissionDetails"] = value as string
    }
    setMilestones(updatedMilestones)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would submit this data to your blockchain
    const campaignData: CrowdfundInfo = {
      ...(formData as any),
      milestones,
      campaignID: Date.now().toString(), // Generate a unique ID
      isFunded: false,
      isCompleted: false,
      creator: formData.creator || "0x0000000000000000000000000000000000000000", // Default value
    }

    console.log("Campaign data to submit:", campaignData)
    // Here you would call your contract function to create the campaign
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Snowflake className="h-6 w-6" />
            <span className="text-xl font-semibold">Snowball</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              Explore
            </Link>
            <Link href="#" className="text-gray-900 font-medium">
              Start a Project
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </nav>

          <Button variant="outline" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>Connect</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Fundraiser</h1>
          <p className="text-gray-600">Launch your project on the Avalanche blockchain</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8">
          {/* Project Details Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                      Project Title
                    </label>
                    <Input
                      id="title"
                      placeholder="Enter a clear, concise title for your project"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                      Project Description
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project in detail. What are you building? Why is it important?"
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cover Image</label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        // In a real implementation, this would open a file picker
                        const imageUrl = "/placeholder.svg?height=300&width=600"
                        setFormData({ ...formData, image: imageUrl })
                      }}
                    >
                      {formData.image ? (
                        <div className="relative h-48 w-full">
                          <Image
                            src={formData.image || "/placeholder.svg"}
                            alt="Project cover"
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                    </div>
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
                    <label htmlFor="fundingGoal" className="block text-sm font-medium mb-2">
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
                        onChange={(e) => setFormData({ ...formData, fundingGoal: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Set a realistic goal for your project. Funds will be in AVAX.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium mb-2">
                      Duration (days)
                    </label>
                    <div className="relative">
                      <Select
                        value={formData.duration?.toString()}
                        onValueChange={(value) => setFormData({ ...formData, duration: Number(value) })}
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
                    <label htmlFor="creator" className="block text-sm font-medium mb-2">
                      Creator Wallet Address
                    </label>
                    <Input
                      id="creator"
                      placeholder="0x..."
                      value={formData.creator || ""}
                      onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Funds will be sent to this address when the campaign ends successfully.
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
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-medium">Milestone {index + 1}</h3>
                        {milestones.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(index)}>
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor={`milestone-desc-${index}`} className="block text-sm font-medium mb-2">
                            Description
                          </label>
                          <Textarea
                            id={`milestone-desc-${index}`}
                            placeholder="Describe what will be accomplished in this milestone"
                            rows={2}
                            value={milestone.description}
                            onChange={(e) => handleMilestoneChange(index, "description", e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor={`milestone-amount-${index}`} className="block text-sm font-medium mb-2">
                            Target Amount
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <Input
                              id={`milestone-amount-${index}`}
                              type="number"
                              placeholder="0.00"
                              className="pl-7"
                              value={milestone.targetAmount || ""}
                              onChange={(e) => handleMilestoneChange(index, "targetAmount", e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor={`milestone-details-${index}`} className="block text-sm font-medium mb-2">
                            Submission Details (Optional)
                          </label>
                          <Textarea
                            id={`milestone-details-${index}`}
                            placeholder="Details about what needs to be submitted to verify this milestone"
                            rows={2}
                            value={milestone.submissionDetails || ""}
                            onChange={(e) => handleMilestoneChange(index, "submissionDetails", e.target.value)}
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
              By launching a project, you agree to Snowball's Terms of Service and Privacy Policy.
            </p>
            <div className="flex gap-4">
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                Launch Project
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

