import { getCldImageUrl, getCldVideoUrl } from 'next-cloudinary'
import React, { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime"
import { filesize } from 'filesize'
import { Download, Clock, FileDown, FileUp } from 'lucide-react'
import { Video } from '@prisma/client'

// Extend dayjs to use relative time formatting (e.g., "3 days ago")
dayjs.extend(relativeTime)

// Define props interface for the VideoCard component
interface VideoCardProps {
    video: Video; // The video object from the Prisma schema
    onDownload: (url: string, title: string) => void // Callback to handle video download
}

// Functional component for displaying a video card with preview, metadata, and download button
const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
    const [isHovered, setIsHovered] = useState(false) // Track hover state for preview display
    const [previewError, setPreviewError] = useState(false) // Track errors when loading the video preview

    // Function to generate a thumbnail URL for the video
    const getThumbnailUrl = useCallback((publicId: string) => {
        return getCldImageUrl({
            src: publicId,
            width: 400,
            height: 225,
            crop: 'fill',
            gravity: 'auto',
            quality: "auto",
            format: "jpg",
            assetType: "video"
        })
    }, [])

    // Function to generate the full video URL for download
    const getFullVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 1920,
            height: 1080,
        })
    }, [])

    // Function to generate the preview video URL for hover effect
    const getPreviewVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 400,
            height: 225,
            rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"] // Short preview transformation
        })
    }, [])

    // Format file size using the `filesize` package
    const formatSize = useCallback((size: number) => {
        return filesize(size)
    }, [])

    // Format video duration into minutes and seconds
    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }, []);

    // Calculate compression percentage based on original and compressed sizes
    const compressionPercentage = Math.round(
        (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
    );

    // Reset preview error when hover state changes
    useEffect(() => {
        setPreviewError(false);
    }, [isHovered]);

    // Handle error when loading the video preview
    const handlePreviewError = () => {
        setPreviewError(true);
    };

    // Render the video card with preview, title, description, and download button
    return (
        <div
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Conditional rendering of video preview or thumbnail based on hover state */}
            <figure className="aspect-video relative">
                {isHovered ? (
                    previewError ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <p className="text-red-500">Preview not available</p>
                        </div>
                    ) : (
                        <video
                            src={getPreviewVideoUrl(video.publicId)}
                            autoPlay
                            muted
                            loop
                            className="w-full h-full object-cover"
                            onError={handlePreviewError}
                        />
                    )
                ) : (
                    <img
                        src={getThumbnailUrl(video.publicId)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                    />
                )}
                {/* Display video duration in the bottom right corner */}
                <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
                    <Clock size={16} className="mr-1" />
                    {formatDuration(video.duration)}
                </div>
            </figure>
            {/* Card body with video metadata and download button */}
            <div className="card-body p-4">
                <h2 className="card-title text-lg font-bold">{video.title}</h2>
                <p className="text-sm text-base-content opacity-70 mb-4">
                    {video.description}
                </p>
                <p className="text-sm text-base-content opacity-70 mb-4">
                    Uploaded {dayjs(video.createdAt).fromNow()}
                </p>
                {/* Display original and compressed file sizes */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                        <FileUp size={18} className="mr-2 text-primary" />
                        <div>
                            <div className="font-semibold">Original</div>
                            <div>{formatSize(Number(video.originalSize))}</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <FileDown size={18} className="mr-2 text-secondary" />
                        <div>
                            <div className="font-semibold">Compressed</div>
                            <div>{formatSize(Number(video.compressedSize))}</div>
                        </div>
                    </div>
                </div>
                {/* Display compression percentage and download button */}
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm font-semibold">
                        Compression:{" "}
                        <span className="text-accent">{compressionPercentage}%</span>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                            onDownload(getFullVideoUrl(video.publicId), video.title)
                        }
                    >
                        <Download size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VideoCard
