"use client"
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-base-100 text-base-content">
      {/* Navbar */}
      <nav className="navbar bg-base-200 shadow-md sticky top-0 z-20 px-4 py-2 md:py-4 flex justify-between items-center">
        <span className="text-xl md:text-3xl font-bold text-primary">ImageFusion.ai</span>
        <Link href="/sign-in">
          <span className="btn btn-outline btn-primary text-xs md:text-lg">Sign In</span>
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center p-4 md:p-10 gap-6">
        <div className="w-full md:w-1/2 flex flex-col gap-4 md:gap-6 text-center md:text-left">
          <span className="text-2xl md:text-4xl font-bold text-primary">Generative Fill & Video Compression</span>
          <span className="text-base md:text-xl text-secondary">
            Experience seamless image manipulation and automatic video compression tailored for your social media needs.
          </span>
          <Link href="/home">
            <span className="btn btn-primary btn-md md:btn-lg mt-4">Get Started</span>
          </Link>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <Image className="border border-primary rounded-xl" alt="Generative Fill Example" src="/home.png" width={500} height={500} priority />
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-base-100 px-4">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-primary">Our Features</h2>
          <p className="py-4 text-sm md:text-lg text-secondary">Enhance your media for every platform with our robust toolset.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl md:text-2xl font-semibold text-primary">Generative Fill</h3>
              <p>Upload an image, and let our tool intelligently fill the gaps with stunning results.</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl md:text-2xl font-semibold text-primary">Social Media Formats</h3>
              <p>Select from popular formats like Instagram Square, Twitter Post, and more to crop your images perfectly.</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl md:text-2xl font-semibold text-primary">Video Compression</h3>
              <p>Compress your videos automatically with our efficient tool, perfect for sharing on social media.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-16 bg-primary text-primary-content px-4">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="py-4 text-sm md:text-lg">Sign up now and streamline your media preparation process.</p>
          <Link href="/sign-up">
            <span className="btn btn-secondary btn-md md:btn-lg">Sign Up</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-base-200 py-8 text-base-content px-4">
        <div className="text-center">
          <p>&copy; 2024 ImageFusion.ai. All rights reserved.</p>
        </div>
      </footer>

      {/* DaisyUI Scrollbar */}
      <style jsx global>{`
        body {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
