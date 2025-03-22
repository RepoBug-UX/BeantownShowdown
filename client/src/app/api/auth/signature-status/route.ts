import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(request: Request) {
    try {
        // Get address from query params
        const url = new URL(request.url);
        const address = url.searchParams.get("address");

        if (!address) {
            return NextResponse.json(
                { error: "Address is required" },
                { status: 400 }
            );
        }

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("beantown");
        const usersCollection = db.collection("users");

        // Find user by address
        const user = await usersCollection.findOne({ address: address.toLowerCase() });

        // Check if the user has a verified signature
        if (!user || !user.lastVerifiedSignature) {
            return NextResponse.json({ isVerified: false });
        }

        // Check if the signature is still valid (not expired)
        const lastVerifiedTime = user.lastVerifiedTimestamp ? new Date(user.lastVerifiedTimestamp) : null;
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour expiration

        const isVerified = lastVerifiedTime && lastVerifiedTime > oneHourAgo;

        return NextResponse.json({
            isVerified,
            lastVerifiedAt: user.lastVerifiedTimestamp
        });
    } catch (error) {
        console.error("Error checking signature status:", error);
        return NextResponse.json(
            { error: "Failed to check signature status" },
            { status: 500 }
        );
    }
} 