import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { verifyMessage } from "viem";

export async function POST(request: Request) {
    try {
        const { address, signature, message } = await request.json();

        // Validate request
        if (!address || !signature || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify the signature
        let isValidSignature;
        try {
            isValidSignature = await verifyMessage({
                message,
                signature: signature as `0x${string}`,
                address: address as `0x${string}`,
            });
        } catch (error) {
            console.error("Signature verification error:", error);
            return NextResponse.json(
                { error: "Invalid signature format" },
                { status: 400 }
            );
        }

        if (!isValidSignature) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("beantown");
        const usersCollection = db.collection("users");

        // Store the verified signature
        await usersCollection.updateOne(
            { address: address.toLowerCase() },
            {
                $set: {
                    lastVerifiedSignature: signature,
                    lastVerifiedTimestamp: new Date()
                }
            },
            { upsert: true }
        );

        return NextResponse.json({
            success: true,
            verified: true,
            address
        });
    } catch (error) {
        console.error("Error verifying signature:", error);
        return NextResponse.json(
            { error: "Failed to verify signature" },
            { status: 500 }
        );
    }
} 