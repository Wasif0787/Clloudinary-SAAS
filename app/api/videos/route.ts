import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Instantiate PrismaClient to interact with the database.
const prisma = new PrismaClient();

/**
 * Handles GET requests to fetch videos from the database.
 * 
 * @param request - The incoming NextRequest object.
 * @returns NextResponse containing the list of videos or an error message.
 */
export async function GET(request: NextRequest) {
    try {
        // Fetch videos from the database, ordered by creation date in descending order.
        const videos = await prisma.video.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Return the videos as JSON response.
        return NextResponse.json(videos);
    } catch (error) {
        // Handle specific errors if error is an instance of Error.
        if (error instanceof Error) {
            console.error('Error fetching videos:', error.message);
            // Return a JSON response with a 500 status code for server errors.
            return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
        } else {
            // Handle unexpected errors.
            console.error('Unexpected error:', error);
            // Return a JSON response with a 500 status code for unexpected errors.
            return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
        }
    } finally {
        // Ensure that PrismaClient disconnects from the database after the operation.
        await prisma.$disconnect();
    }
}
