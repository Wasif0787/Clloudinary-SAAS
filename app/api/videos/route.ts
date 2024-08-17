import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const videos = await prisma.video.findMany({
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(videos);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching videos:', error.message);
            return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
        } else {
            console.error('Unexpected error:', error);
            return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
        }
    } finally {
        await prisma.$disconnect();
    }
}