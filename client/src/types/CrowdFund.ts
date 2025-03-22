type Milestone = {
    description: string; // Description of the milestone
    targetAmount: number; // Amount of funds required to achieve this milestone
    isCompleted: boolean; // Status of the milestone (completed or not)
    submissionDetails?: string; // Optional details about the submission for the milestone
};

type CrowdfundInfo = {
    creator: string; // Address of the creator
    fundingGoal: number; // Amount to be raised
    duration: number; // Duration of the campaign in blocks or days
    milestones: Milestone[]; // List of milestones for the campaign
    campaignID: string; // Unique ID for the campaign
    category: string; // Category of the campaign
    title: string; // Title of the campaign
    description: string; // Description of the campaign
    image: string; // Image URL for the campaign
    isFunded: boolean; // Status of the campaign (funded or not)
    isCompleted: boolean; // Status of the campaign (completed or not)
};