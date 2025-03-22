import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Separator } from "@/app/components/ui/separator";
import { Vote, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { formatAddress, cn } from "@/app/lib/utils";

interface Milestone {
  id: number;
  description: string;
  targetAmount: number;
  isCompleted: boolean;
  submissionDetails?: string;
}

interface Vote {
  address: string;
  vote: "yes" | "no";
  timestamp: string;
}

interface DaoVotingProps {
  projectId: string;
  milestones: Milestone[];
  backers: { address: string; amount: number }[];
  userIsBacker: boolean;
  onVoteSuccess?: () => void;
}

export default function DaoVoting({
  projectId,
  milestones,
  backers,
  userIsBacker,
  onVoteSuccess,
}: DaoVotingProps) {
  const { address, isConnected } = useAccount();
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<number, Vote[]>>({});
  const [votingStatus, setVotingStatus] = useState<Record<number, string>>({});
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Find the first incomplete milestone to set as active by default
  useEffect(() => {
    if (milestones && milestones.length > 0) {
      const firstIncompleteMilestone = milestones.find((m) => !m.isCompleted);
      if (firstIncompleteMilestone) {
        setActiveMilestone(firstIncompleteMilestone.id);
      }
    }
  }, [milestones]);

  // Fetch votes from API
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        // Fetch project to get milestone votes
        const response = await fetch(`/api/projects?id=${projectId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project data");
        }

        const project = await response.json();

        // Check if project has milestone votes
        if (project.milestoneVotes) {
          setVotes(project.milestoneVotes);

          // Set voting status based on votes
          const status: Record<number, string> = {};
          milestones.forEach((milestone) => {
            if (milestone.isCompleted) {
              status[milestone.id] = "completed";
            } else if (
              project.milestoneVotes[milestone.id] &&
              project.milestoneVotes[milestone.id].length > 0
            ) {
              const milestoneVotes = project.milestoneVotes[milestone.id];
              const yesVotes = milestoneVotes.filter(
                (v: any) => v.vote === "yes"
              ).length;
              const totalVotes = milestoneVotes.length;

              if (yesVotes / totalVotes > 0.5) {
                status[milestone.id] = "approved";
              } else {
                status[milestone.id] = "voting";
              }
            } else {
              status[milestone.id] = "pending";
            }
          });

          setVotingStatus(status);
        } else {
          // Initialize empty votes and status
          const emptyVotes: Record<number, Vote[]> = {};
          const status: Record<number, string> = {};

          milestones.forEach((milestone) => {
            emptyVotes[milestone.id] = [];
            status[milestone.id] = milestone.isCompleted
              ? "completed"
              : "pending";
          });

          setVotes(emptyVotes);
          setVotingStatus(status);
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    if (projectId && milestones.length > 0) {
      fetchVotes();
    }
  }, [projectId, milestones]);

  const hasUserVoted = (milestoneId: number): boolean => {
    if (!address || !votes[milestoneId]) return false;
    return votes[milestoneId].some(
      (vote) => vote.address.toLowerCase() === address.toLowerCase()
    );
  };

  const getVoteDistribution = (milestoneId: number) => {
    if (!votes[milestoneId] || votes[milestoneId].length === 0) {
      return {
        yesPercentage: 0,
        noPercentage: 0,
        yesCount: 0,
        noCount: 0,
        total: 0,
      };
    }

    const yesVotes = votes[milestoneId].filter((v) => v.vote === "yes").length;
    const totalVotes = votes[milestoneId].length;
    const noVotes = totalVotes - yesVotes;

    return {
      yesPercentage: (yesVotes / totalVotes) * 100,
      noPercentage: (noVotes / totalVotes) * 100,
      yesCount: yesVotes,
      noCount: noVotes,
      total: totalVotes,
    };
  };

  const handleVote = async (milestoneId: number, voteChoice: "yes" | "no") => {
    if (!isConnected) {
      setError("Please connect your wallet to vote");
      return;
    }

    if (!userIsBacker) {
      setError("Only backers can vote on milestone disbursements");
      return;
    }

    setIsVoting(true);
    setError(null);

    try {
      // Real API call to record vote
      const response = await fetch(`/api/projects/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          milestoneId,
          voterAddress: address,
          vote: voteChoice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record vote");
      }

      // Update local state to reflect the new vote
      const newVote: Vote = {
        address: address || "0x0",
        vote: voteChoice,
        timestamp: new Date().toISOString(),
      };

      setVotes((prev) => ({
        ...prev,
        [milestoneId]: [...(prev[milestoneId] || []), newVote],
      }));

      // Call the success callback if provided
      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (err: any) {
      console.error("Error voting:", err);
      setError(
        err.message ||
          "There was an error recording your vote. Please try again."
      );
    } finally {
      setIsVoting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case "voting":
        return <Vote className="h-5 w-5 text-amber-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "approved":
        return "Approved";
      case "voting":
        return "Voting Active";
      case "pending":
        return "Pending Votes";
      default:
        return "Unknown";
    }
  };

  if (!milestones || milestones.length === 0) {
    return (
      <div className="p-4 border rounded-md bg-gray-50 text-center text-gray-500">
        No milestones have been defined for this project.
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center mb-4">
        <Vote className="h-5 w-5 mr-2 text-blue-600" />
        <h3 className="font-medium text-lg">DAO Governance</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        As a project backer, you can vote on milestone fund disbursements.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {!userIsBacker && (
        <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-md text-sm">
          You must be a backer to participate in milestone voting.
        </div>
      )}

      <div className="space-y-4">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`border rounded-md p-4 ${
              activeMilestone === milestone.id
                ? "border-blue-300 bg-blue-50"
                : ""
            }`}
            onClick={() => setActiveMilestone(milestone.id)}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="font-medium mr-2">
                  Milestone {milestone.id}
                </span>
                <div className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                  {getStatusIcon(votingStatus[milestone.id])}
                  <span className="ml-1">
                    {getStatusLabel(votingStatus[milestone.id])}
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                ${milestone.targetAmount.toLocaleString()}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-2">
              {milestone.description}
            </p>

            {activeMilestone === milestone.id && (
              <div className="mt-4">
                <Separator className="my-3" />

                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">
                    Vote Distribution
                  </div>
                  <div className="flex space-x-2 mb-2">
                    <div className="flex-1">
                      <div className="text-xs text-green-700 mb-1">
                        Yes ({getVoteDistribution(milestone.id).yesCount})
                      </div>
                      <Progress
                        value={getVoteDistribution(milestone.id).yesPercentage}
                        className="h-2 bg-gray-200"
                        indicatorColor="bg-green-500"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-red-700 mb-1">
                        No ({getVoteDistribution(milestone.id).noCount})
                      </div>
                      <Progress
                        value={getVoteDistribution(milestone.id).noPercentage}
                        className="h-2 bg-gray-200"
                        indicatorColor="bg-red-500"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Votes: {getVoteDistribution(milestone.id).total}
                    {backers.length > 0 &&
                      ` (${Math.round(
                        (getVoteDistribution(milestone.id).total /
                          backers.length) *
                          100
                      )}% of backers)`}
                  </div>
                </div>

                {!milestone.isCompleted &&
                  !hasUserVoted(milestone.id) &&
                  userIsBacker && (
                    <div className="flex space-x-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleVote(milestone.id, "yes")}
                        disabled={isVoting}
                      >
                        Vote Yes
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        onClick={() => handleVote(milestone.id, "no")}
                        disabled={isVoting}
                      >
                        Vote No
                      </Button>
                    </div>
                  )}

                {hasUserVoted(milestone.id) && (
                  <div className="mt-4 text-sm text-green-600 font-medium">
                    You have voted on this milestone
                  </div>
                )}

                {milestone.isCompleted && (
                  <div className="mt-4 text-sm text-green-600 font-medium">
                    This milestone has been completed
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Votes are weighted by donation amount. A simple majority is
                  required for approval.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
