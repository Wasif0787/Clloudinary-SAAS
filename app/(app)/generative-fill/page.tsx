"use client"
import { CldImage } from 'next-cloudinary';
import React, { useEffect, useRef, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const Page = () => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isTransforming, setIsTransforming] = useState(false)
    const [uploadedImageWidth, setUploadedImageWidth] = useState<number>(300)
    const [uploadedImageHeight, setUploadedImageHeight] = useState<number>(300)
    const [transformedImageWidth, setTransformedImageWidth] = useState<number | "">(300)
    const [transformedImageHeight, setTransformedImageHeight] = useState<number | "">(300)
    const [generateImage, setGenerateImage] = useState(false)

    const imageRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        if (uploadedImage || generateImage) {
            setIsTransforming(true)
        }
    }, [uploadedImage, generateImage])

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        const img = new Image()
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            setUploadedImageHeight(img.height)
            setUploadedImageWidth(img.width)
            setTransformedImageHeight(img.height)
            setTransformedImageWidth(img.width)
        }
        const formData = new FormData()
        formData.append('file', file)
        try {
            const response = await fetch("/api/image-upload", {
                method: "POST",
                body: formData
            })
            if (!response.ok) throw new Error("Failed to upload image")
            const data = await response.json()
            setUploadedImage(data.publicId)
        } catch (error) {
            console.error(error)
            toast.error("Failed to upload image")
        } finally {
            setIsUploading(false)
        }
    }

    const handleDownload = () => {
        if (!imageRef.current) return
        fetch(imageRef.current.src)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.download = `generated_image.png`
                document.body.appendChild(link)
                link.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(link)
            })
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Generative Fill Images</h1>
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title mb-4">Upload an Image</h2>
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text">Choose an image file</span>
                        </label>
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="file-input file-input-bordered file-input-primary w-full"
                        />
                    </div>

                    {isUploading && (
                        <div className="w-full flex justify-center mt-4">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                                    <span className="loading loading-spinner loading-lg"></span>
                                </div>
                                <div className="w-24 h-24 border border-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600">Uploading...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {uploadedImage && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Original:</h3>
                            <div className="relative">
                                <div className="flex justify-center">
                                    {isTransforming && !isUploading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                                            <span className="loading loading-spinner loading-lg"></span>
                                        </div>
                                    )}
                                    <CldImage
                                        width={uploadedImageWidth}
                                        height={uploadedImageHeight}
                                        src={uploadedImage}
                                        sizes="100vw"
                                        alt="Original Image"
                                        ref={imageRef}
                                        onLoad={() => setIsTransforming(false)}
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="label">
                                    <span className="label-text">Transform Width:</span>
                                </label>
                                <input
                                    type="number"
                                    onChange={(e) => setTransformedImageWidth(e.target.value ? Number(e.target.value) : "")}
                                    value={transformedImageWidth === "" ? "" : transformedImageWidth}
                                    className="input input-bordered w-full"
                                    placeholder="Width"
                                />
                                <label className="label mt-2">
                                    <span className="label-text">Transform Height:</span>
                                </label>
                                <input
                                    type="number"
                                    onChange={(e) => setTransformedImageHeight(e.target.value ? Number(e.target.value) : "")}
                                    value={transformedImageHeight === "" ? "" : transformedImageHeight}
                                    className="input input-bordered w-full"
                                    placeholder="Height"
                                />
                            </div>

                            <div className="card-actions justify-end mt-6">
                                <button className="btn btn-primary" onClick={() => setGenerateImage(true)}>
                                    Transform
                                </button>
                            </div>
                        </div>
                    )}

                    {generateImage && uploadedImage && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Generated:</h3>
                            <div className="relative">
                                <div className="flex justify-center">
                                    {isTransforming && !isUploading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                                            <span className="loading loading-spinner loading-lg"></span>
                                        </div>
                                    )}
                                    <CldImage
                                        width={transformedImageWidth || uploadedImageWidth}
                                        height={transformedImageHeight || uploadedImageHeight}
                                        src={uploadedImage}
                                        sizes="100vw"
                                        alt="Generated Image"
                                        ref={imageRef}
                                        fillBackground
                                        onLoad={() => setIsTransforming(false)}
                                    />
                                </div>
                            </div>

                            <div className="card-actions justify-end mt-6">
                                <button className="btn btn-primary" onClick={handleDownload}>
                                    Download
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

export default Page
