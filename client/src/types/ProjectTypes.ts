// Define types for MongoDB Project Collection

export type Milestone = {
    description: string;
    targetAmount: number;
    isCompleted: boolean;
    submissionDetails?: string;
};

export type Backer = {
    address: string;
    amount: number;
    timestamp: Date;
    transactionHash?: string;
};

export type Project = {
    _id?: string;
    title: string;
    description: string;
    category: string;
    fundingGoal: number;
    raised: number;
    backersCount: number;  // Number of backers
    creatorAddress: string;  // Wallet address of the creator
    creatorName?: string;    // Optional name of the creator
    creatorBio?: string;     // Optional bio of the creator
    backers: Backer[];       // Array of backers with amounts (replaces potentialBackers)
    duration: number;
    deadline: Date;
    status: string;
    image: string;
    createdAt: Date;
    milestones: Milestone[];
    updates: any[];
}; 