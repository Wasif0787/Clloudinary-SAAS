"use client"
import { CldImage } from 'next-cloudinary';
import React, { useEffect, useRef, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const GenerativeFill = () => {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [originalImageWidth, setOriginalImageWidth] = useState('')
    const [originalImageHeight, setOriginalImageHeight] = useState('')
    const [transformedImageWidth, setTransformedImageWidth] = useState('')
    const [transformedImageHeight, setTransformedImageHeight] = useState('')
    const [transformingOriginalImage, setTransformingOriginalImage] = useState(false)
    const [transformingGenerativeImage, setTransformingGenerativeImage] = useState(false)

    const originalImageRef = useRef<HTMLImageElement>(null)
    const generativeImageRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        if (uploadedImage) {
            setTransformingOriginalImage(true)
        }
    }, [uploadedImage])

    // Function to handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        // Reset state
        resetState()
        const img = new Image()
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const width = String(img.width);
            const height = String(img.height);
            setOriginalImageWidth(width);
            setOriginalImageHeight(height);
            setTransformedImageWidth(width);
            setTransformedImageHeight(height);
        }
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        try {
            // Send POST request to upload the file
            const response = await fetch("/api/image-upload", {
                method: "POST",
                body: formData
            })
            if (!response.ok) throw new Error("Failed to upload image")
            // Get the Cloudinary public ID from the response
            const data = await response.json()
            setUploadedImage(data.publicId)
        } catch (error) {
            console.log(error);
            toast.error("Failed to upload image")
        } finally {
            setIsUploading(false)
        }
    }

    const handleImageWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTransformedImageWidth(event.target.value)
        setGeneratedImage(null) // Reset the generated image when dimensions are changed
    }

    const handleImageHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTransformedImageHeight(event.target.value)
        setGeneratedImage(null) // Reset the generated image when dimensions are changed
    }

    const handleGenerate = () => {
        setGeneratedImage(uploadedImage)
        setTransformingGenerativeImage(true)
    }

    // Function to handle downloading the transformed image
    const handleDownload = () => {
        const currentImageRef = generativeImageRef.current;
        if (!currentImageRef) return; // Safely handle undefined case

        fetch(currentImageRef.src)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "generatedImage.png"
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            });
    }


    // Reset all state
    const resetState = () => {
        setUploadedImage(null)
        setGeneratedImage(null)
        setOriginalImageWidth('')
        setOriginalImageHeight('')
        setTransformedImageWidth('')
        setTransformedImageHeight('')
        setTransformingOriginalImage(false)
        setTransformingGenerativeImage(false)
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center text-primary">
                Generative Fill Images
            </h1>
            <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                    <h2 className="card-title mb-6 text-lg font-semibold text-secondary">Upload an Image</h2>
                    <div className="form-control mb-6">
                        <label className="label">
                            <span className="label-text text-secondary">Choose an image file</span>
                        </label>
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="file-input file-input-bordered file-input-primary w-full"
                        />
                    </div>
                    {isUploading && (
                        <div className="mt-4">
                            <progress className="progress progress-primary w-full"></progress>
                        </div>
                    )}
                    {uploadedImage && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4 text-secondary">Original Image Preview:</h3>
                            <div className="flex justify-center mb-8 relative">
                                {transformingOriginalImage && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </div>
                                )}
                                <CldImage
                                    width={Number(originalImageWidth)}
                                    height={Number(originalImageHeight)}
                                    src={uploadedImage}
                                    sizes="100vw"
                                    crop="fill"
                                    alt='Original Image Preview'
                                    gravity='auto'
                                    ref={originalImageRef}
                                    onLoad={() => setTransformingOriginalImage(false)}
                                />
                            </div>
                            <h2 className="card-title mb-6 text-lg font-semibold text-secondary">Select Width and Height</h2>
                            <div className="form-control grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text text-secondary">Width</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered w-full text-white bg-primary"
                                        value={transformedImageWidth}
                                        onChange={handleImageWidthChange}
                                        placeholder={originalImageWidth}
                                    />
                                </div>
                                <div>
                                    <label className="label">
                                        <span className="label-text text-secondary">Height</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered w-full text-white bg-primary"
                                        value={transformedImageHeight}
                                        onChange={handleImageHeightChange}
                                        placeholder={originalImageHeight}
                                    />
                                </div>
                            </div>
                            <div className="card-actions justify-end mt-6">
                                <button className="btn btn-primary" onClick={handleGenerate} disabled={transformingGenerativeImage}>
                                    Generate
                                </button>
                            </div>
                            {generatedImage && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4 text-secondary">Generated Image Preview:</h3>
                                    <div className="flex justify-center mb-8 relative">
                                        {transformingGenerativeImage && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                                                <span className="loading loading-spinner loading-lg"></span>
                                            </div>
                                        )}
                                        <CldImage
                                            width={Number(transformedImageWidth)}
                                            height={Number(transformedImageHeight)}
                                            src={uploadedImage}
                                            sizes="100vw"
                                            crop="fill"
                                            alt='Generated Image Preview'
                                            gravity='auto'
                                            fillBackground
                                            ref={generativeImageRef}
                                            onLoad={() => setTransformingGenerativeImage(false)}
                                        />
                                    </div>
                                    <div className="card-actions justify-end">
                                        <button className="btn btn-primary" onClick={handleDownload}>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default GenerativeFill
