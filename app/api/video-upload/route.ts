import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Prisma Client
const primsa = new PrismaClient();

// Configuration for Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

// Define the expected result type from Cloudinary upload
interface CloudinaryUploadResult {
    public_id: string;
    bytes: number;
    duration?: number;
    [key: string]: any;
}

/**
 * Handles POST requests to upload a video to Cloudinary and store video metadata in the database.
 * 
 * @param {NextRequest} request - The incoming NextRequest object.
 * @returns {NextResponse} with the result of the upload and database operation or an error message.
 */
export async function POST(request: NextRequest) {
    try {
        // Check if the user is authenticated
        const { userId } = auth();

        if (!userId) {
            // Return a 401 Unauthorized response if not authenticated
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Validate Cloudinary configuration
        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            // Return a 500 Internal Server Error response if configuration is missing
            return NextResponse.json({ error: 'Cloudinary configuration missing' }, { status: 500 });
        }

        // Parse the form data from the request
        const formData = await request.formData();
        const file = formData.get('file') as File || null;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const originalSize = formData.get('originalSize') as string;

        if (!file) {
            // Return a 400 Bad Request response if no file is provided
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert the file to a buffer for uploading
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload the file to Cloudinary and handle the result
        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "video", // Specify that we are uploading a video
                    folder: "video-uploads", // Specify the folder to which the video should be uploaded
                    transformation: [
                        {
                            quality: "auto", // Automatically adjust video quality
                            fetch_format: "mp4" // Ensure the video is in MP4 format
                        }
                    ]
                },
                (error, result) => {
                    if (error) return reject(error); // Reject the promise if there is an error
                    else resolve(result as CloudinaryUploadResult); // Resolve the promise with the upload result
                }
            );
            uploadStream.end(buffer); // End the stream with the video buffer
        });

        // Store video metadata in the database using Prisma
        const video = await primsa.video.create({
            data: {
                title,
                description,
                publicId: result.public_id,
                originalSize: originalSize,
                compressedSize: String(result.bytes),
                duration: result.duration || 0 // Default duration to 0 if not provided
            }
        });

        // Return a 200 OK response with the video metadata
        return NextResponse.json(video);
    } catch (error) {
        // Log the error and return a 500 Internal Server Error response
        console.log("Upload Video Failed", error);
        return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
    } finally {
        // Ensure Prisma Client is disconnected
        await primsa.$disconnect();
    }
}
