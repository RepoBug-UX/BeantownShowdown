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
    timestamp: string;
    transactionHash?: string;
};

export type Update = {
    title: string;
    content: string;
    date: string;
};

export type Comment = {
    _id: string;
    projectId: string;
    userAddress: string;
    content: string;
    timestamp: string;
};

export type Project = {
    _id?: string;
    title: string;
    description: string;
    fullDescription?: string;
    category: string;
    fundingGoal: number;
    raised: number;
    backersCount: number;  // Number of backers
    creatorAddress: string;  // Wallet address of the creator
    creatorName?: string;    // Optional name of the creator
    creatorBio?: string;     // Optional bio of the creator
    backers: Backer[];       // Array of backers with amounts (replaces potentialBackers)
    duration: number;
    deadline: string;        // Changed from Date to string to match frontend usage
    status: string;
    image: string;
    createdAt: string;      // Changed from Date to string to match frontend usage
    milestones: Milestone[];
    updates: Update[];      // Array of project updates
    upvotes: string[];      // Array of wallet addresses that have upvoted
    comments?: Comment[];   // Array of comments
}; 