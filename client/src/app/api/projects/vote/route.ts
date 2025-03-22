import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    try {
        const { projectId, milestoneId, voterAddress, vote, signature } = await request.json();

        // Validate request
        if (!projectId || !milestoneId || !voterAddress || !vote) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("beantown");
        const projectsCollection = db.collection("projects");
        const usersCollection = db.collection("users");

        // Check if project exists
        const projectObjectId = new ObjectId(projectId);
        const project = await projectsCollection.findOne({ _id: projectObjectId });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        // Check if user is a backer
        const isBacker = project.backers?.some(
            (backer: any) => backer.address.toLowerCase() === voterAddress.toLowerCase()
        );

        if (!isBacker) {
            return NextResponse.json(
                { error: "Only backers can vote on milestone disbursements" },
                { status: 403 }
            );
        }

        // Check if user has a verified signature
        const user = await usersCollection.findOne({ address: voterAddress.toLowerCase() });
        if (!user || !user.lastVerifiedSignature) {
            return NextResponse.json(
                { error: "Wallet signature verification required before voting" },
                { status: 401 }
            );
        }

        // Verify the signature is recent (within the last hour)
        const lastVerifiedTime = user.lastVerifiedTimestamp ? new Date(user.lastVerifiedTimestamp) : null;
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        if (!lastVerifiedTime || lastVerifiedTime < oneHourAgo) {
            return NextResponse.json(
                { error: "Signature verification expired. Please sign again." },
                { status: 401 }
            );
        }

        // Initialize votes array if it doesn't exist
        if (!project.milestoneVotes) {
            project.milestoneVotes = {};
        }

        // Initialize votes for this milestone if they don't exist
        if (!project.milestoneVotes[milestoneId]) {
            project.milestoneVotes[milestoneId] = [];
        }

        // Check if user has already voted
        const existingVoteIndex = project.milestoneVotes[milestoneId].findIndex(
            (v: any) => v.address.toLowerCase() === voterAddress.toLowerCase()
        );

        if (existingVoteIndex !== -1) {
            // Update existing vote
            project.milestoneVotes[milestoneId][existingVoteIndex] = {
                address: voterAddress,
                vote: vote,
                timestamp: new Date().toISOString(),
            };
        } else {
            // Add new vote
            project.milestoneVotes[milestoneId].push({
                address: voterAddress,
                vote: vote,
                timestamp: new Date().toISOString(),
            });
        }

        // Update project with votes
        await projectsCollection.updateOne(
            { _id: projectObjectId },
            { $set: { milestoneVotes: project.milestoneVotes } }
        );

        // Check if milestone should be approved based on votes
        const milestone = project.milestones?.[milestoneId - 1];
        if (milestone && !milestone.isCompleted) {
            const votes = project.milestoneVotes[milestoneId];
            const yesVotes = votes.filter((v: any) => v.vote === "yes").length;
            const totalVotes = votes.length;

            // If more than 50% of votes are "yes", approve the milestone
            if (totalVotes > 0 && yesVotes / totalVotes > 0.5) {
                // Calculate the backer's voting power (weighted by donation amount)
                const backerVotingPower = project.backers.reduce((acc: number, backer: any) => {
                    const hasVoted = votes.some(
                        (v: any) => v.address.toLowerCase() === backer.address.toLowerCase()
                    );
                    return hasVoted ? acc + backer.amount : acc;
                }, 0);

                // Calculate the total possible voting power (all backers)
                const totalVotingPower = project.backers.reduce(
                    (acc: number, backer: any) => acc + backer.amount, 0
                );

                // If more than 50% of the voting power has voted yes
                if (backerVotingPower / totalVotingPower > 0.5) {
                    // Mark milestone as completed
                    await projectsCollection.updateOne(
                        { _id: projectObjectId },
                        { $set: { [`milestones.${milestoneId - 1}.isCompleted`]: true } }
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing vote:", error);
        return NextResponse.json(
            { error: "Failed to process vote" },
            { status: 500 }
        );
    }
} 