import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Project, Backer } from '@/types/ProjectTypes'

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

        const client = await clientPromise
        const db = client.db('beantown')
        const collection = db.collection('projects')

        // Handle adding a backer
        if (body.addBacker && body.backerAddress && body.amount) {
            const newBacker: Backer = {
                address: body.backerAddress,
                amount: Number(body.amount),
                timestamp: new Date()
            }

            // Add the backer to the backers array and increment backersCount
            await collection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $push: { backers: newBacker as any },
                    $inc: { backersCount: 1, raised: Number(body.amount) }
                }
            )

            return NextResponse.json({
                message: 'Backer added successfully'
            })
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