import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// GET endpoint to fetch comments for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("beantown");
    const comments = await db
      .collection("comments")
      .find({ projectId })
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, userAddress, content } = body;

    if (!projectId || !userAddress || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("beantown");
    
    const comment = {
      projectId,
      userAddress,
      content,
      timestamp: new Date(),
    };

    const result = await db.collection("comments").insertOne(comment);

    return NextResponse.json({
      ...comment,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
} 