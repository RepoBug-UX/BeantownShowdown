import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Project, Backer } from '@/types/ProjectTypes'
import { AvaCloudSDK } from "@avalabs/avacloud-sdk";

// Initialize Avalanche SDK
const avaCloudSDK = new AvaCloudSDK({
    apiKey: process.env.GLACIER_API_KEY,
    chainId: "43114", // Avalanche Mainnet
    network: "mainnet",
});

// Helper function to verify a transaction
async function verifyTransaction(transactionHash: string, amount: number, sender: string, recipient: string) {
    try {
        // In a real production environment, this would query the Avalanche blockchain directly
        // For now, we'll use our wallet API to verify the transaction

        // Properly encode all URL parameters to prevent truncation
        const params = new URLSearchParams({
            method: 'verifyTransaction',
            txHash: transactionHash,
            sender: sender,
            recipient: recipient,
            amount: amount.toString()
        });

        // Determine the base URL - making sure we have a full URL with protocol
        let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        // If we're running on the server and no BASE_URL is specified, use a default localhost URL
        if (!baseUrl || baseUrl === '') {
            baseUrl = 'http://localhost:3000';
        }

        // Make sure baseUrl doesn't end with a slash
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }

        // Construct the full URL
        const url = `${baseUrl}/api/wallet?${params.toString()}`;
        console.log('Absolute verification URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Transaction verification failed', await response.text());
            return false;
        }

        const verificationResult = await response.json();
        console.log('Verification result:', verificationResult);

        // In a real implementation, we would check that:
        // 1. The transaction exists on the blockchain
        // 2. It's confirmed (has enough confirmations)
        // 3. The sender matches the backer address
        // 4. The recipient matches the creator address
        // 5. The amount matches the specified amount

        return verificationResult.verified === true;
    } catch (error) {
        console.error('Error verifying transaction:', error);
        return false;
    }
}

// GET handler for retrieving all projects or a specific project
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        const client = await clientPromise
        const db = client.db('beantown')
        const collection = db.collection('projects')

        // If ID is provided, return a specific project
        if (id) {
            const project = await collection.findOne({ _id: new ObjectId(id) })
            if (!project) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 })
            }
            return NextResponse.json(project)
        }

        // Otherwise, return all projects
        const projects = await collection.find({}).toArray()
        return NextResponse.json(projects)
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST handler for creating a new project
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Basic validation
        if (!body.title || !body.description || !body.fundingGoal || !body.creator) {
            return NextResponse.json(
                { error: 'Missing required fields (title, description, fundingGoal, creator)' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db('beantown')
        const collection = db.collection('projects')

        // Format the project data
        const project: Omit<Project, '_id'> = {
            title: body.title,
            description: body.description,
            category: body.category || 'Other',
            fundingGoal: Number(body.fundingGoal),
            raised: 0,
            backersCount: 0,
            // Track creator address
            creatorAddress: body.creator,
            // Store creator details if provided
            creatorName: body.creatorName || '',
            creatorBio: body.creatorBio || '',
            // Initialize empty backers array
            backers: [],
            duration: Number(body.duration) || 30,
            deadline: new Date(Date.now() + (body.duration || 30) * 24 * 60 * 60 * 1000),
            status: 'active',
            image: body.image || '',
            createdAt: new Date(),
            milestones: body.milestones || [],
            updates: [],
        }

        // Insert the new project
        const result = await collection.insertOne(project)

        return NextResponse.json({
            message: 'Project created successfully',
            id: result.insertedId,
            project: {
                ...project,
                _id: result.insertedId
            }
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PATCH handler for updating an existing project
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const body = await request.json()
        console.log('PATCH request body:', body);

        const client = await clientPromise
        const db = client.db('beantown')
        const collection = db.collection('projects')

        // Handle adding a backer
        if (body.addBacker && body.backerAddress && body.amount !== undefined) {
            console.log('Processing add backer request:', {
                projectId: id,
                backerAddress: body.backerAddress,
                amount: body.amount,
                transactionHash: body.transactionHash
            });

            // Validate transaction hash
            if (!body.transactionHash) {
                console.error('Transaction hash missing');
                return NextResponse.json({
                    error: 'Transaction hash is required to verify payment'
                }, { status: 400 });
            }

            // Verify the transaction on Avalanche network
            const isTransactionValid = await verifyTransaction(
                body.transactionHash,
                Number(body.amount),
                body.backerAddress,
                body.creatorAddress
            );

            if (!isTransactionValid) {
                console.error('Transaction verification failed');
                return NextResponse.json({
                    error: 'Transaction verification failed. Please ensure your payment was completed correctly.'
                }, { status: 400 });
            }

            const newBacker: Backer = {
                address: body.backerAddress,
                amount: Number(body.amount),
                timestamp: new Date(),
                transactionHash: body.transactionHash // Store the transaction hash
            }

            console.log('Adding backer with data:', newBacker);

            // Add the backer to the backers array and increment backersCount
            const updateResult = await collection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $push: { backers: newBacker as any }, // Cast to any to satisfy TypeScript
                    $inc: { backersCount: 1, raised: Number(body.amount) }
                }
            )

            console.log('Update result:', updateResult);

            if (updateResult.matchedCount === 0) {
                console.error('Project not found:', id);
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }

            if (updateResult.modifiedCount === 0) {
                console.error('Project not modified. Possible duplicate transaction.');
                return NextResponse.json({
                    error: 'Failed to update project. This transaction may have already been processed.'
                }, { status: 400 });
            }

            return NextResponse.json({
                message: 'Backer added successfully',
                transactionVerified: true,
                backerAdded: true
            }, { status: 200 })
        }

        // Prepare the update data for other fields
        const updateData: Partial<Project> = {}

        // Only include fields that are being updated
        if (body.title) updateData.title = body.title
        if (body.description) updateData.description = body.description
        if (body.category) updateData.category = body.category
        if (body.fundingGoal) updateData.fundingGoal = Number(body.fundingGoal)
        if (body.duration) {
            updateData.duration = Number(body.duration)
            updateData.deadline = new Date(Date.now() + body.duration * 24 * 60 * 60 * 1000)
        }
        if (body.image) updateData.image = body.image
        if (body.milestones) updateData.milestones = body.milestones
        if (body.status) updateData.status = body.status

        // Update creator information if provided
        if (body.creatorName) updateData.creatorName = body.creatorName
        if (body.creatorBio) updateData.creatorBio = body.creatorBio

        // Only proceed with update if there are fields to update
        if (Object.keys(updateData).length > 0) {
            // Update the project
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            )

            if (result.matchedCount === 0) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 })
            }

            return NextResponse.json({
                message: 'Project updated successfully',
                updated: result.modifiedCount > 0
            })
        }

        return NextResponse.json({
            message: 'No fields to update'
        })
    } catch (error) {
        console.error('Error updating project:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE handler for removing a project
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db('beantown')
        const collection = db.collection('projects')

        const result = await collection.deleteOne({ _id: new ObjectId(id) })

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Project deleted successfully' })
    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
} 