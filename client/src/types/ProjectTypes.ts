// Define types for MongoDB Project Collection

export type Milestone = {
    description: string;
    targetAmount: number;
    isCompleted: boolean;
    submissionDetails?: string;
};

export type PotentialBacker = {
    address: string;
    amount: number;
    timestamp: Date;
};

export type Project = {
    _id?: string;
    title: string;
    description: string;
    category: string;
    fundingGoal: number;
    raised: number;
    backers: number;
    creatorAddress: string;  // Wallet address of the creator
    creatorName?: string;    // Optional name of the creator
    creatorBio?: string;     // Optional bio of the creator
    potentialBackers: PotentialBacker[];  // Array of potential backers with amounts
    duration: number;
    deadline: Date;
    status: string;
    image: string;
    createdAt: Date;
    milestones: Milestone[];
    updates: any[];
}; 