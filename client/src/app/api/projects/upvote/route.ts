import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    try {
        const { projectId, voterAddress } = await request.json();

        // Validate request
        if (!projectId || !voterAddress) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("beantown");
        const projectsCollection = db.collection("projects");

        // Check if project exists
        const projectObjectId = new ObjectId(projectId);
        const project = await projectsCollection.findOne({ _id: projectObjectId });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        // Initialize upvotes array if it doesn't exist
        if (!project.upvotes) {
            project.upvotes = [];
        }

        // Check if user has already upvoted
        const hasUpvoted = project.upvotes.includes(voterAddress.toLowerCase());

        let updateOperation;
        if (hasUpvoted) {
            // Remove upvote
            updateOperation = {
                $pull: { upvotes: voterAddress.toLowerCase() }
            };
        } else {
            // Add upvote
            updateOperation = {
                $addToSet: { upvotes: voterAddress.toLowerCase() }
            };
        }

        // Update project with upvote
        await projectsCollection.updateOne(
            { _id: projectObjectId },
            updateOperation
        );

        return NextResponse.json({ 
            success: true,
            hasUpvoted: !hasUpvoted
        });
    } catch (error) {
        console.error("Error processing upvote:", error);
        return NextResponse.json(
            { error: "Failed to process upvote" },
            { status: 500 }
        );
    }
} 