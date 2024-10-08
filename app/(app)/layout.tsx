"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";
import {
    LogOutIcon,
    MenuIcon,
    LayoutDashboardIcon,
    Share2Icon,
    UploadIcon,
    ImageIcon,
    PaintBucket
} from "lucide-react";

const sidebarItems = [
    { href: "/home", icon: LayoutDashboardIcon, label: "Home Page" },
    { href: "/social-share", icon: Share2Icon, label: "Social Share" },
    { href: "/video-upload", icon: UploadIcon, label: "Video Upload" },
    { href: "/generative-fill", icon: PaintBucket, label: "Generative Fill" },
];

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogoClick = () => {
        router.push("/");
    };

    const hanldeSidebarItemClick = (link: string) => {
        setSidebarOpen(false)
        router.push(link)
    }

    return (
        <div className="drawer lg:drawer-open">
            <input
                id="sidebar-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={sidebarOpen}
                onChange={() => setSidebarOpen(!sidebarOpen)}
            />
            <div className="drawer-content flex flex-col min-h-screen">
                {/* Navbar */}
                <header className="w-full bg-base-200 shadow-md z-10">
                    <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        <div className="flex-none lg:hidden">
                            <label
                                htmlFor="sidebar-drawer"
                                className="btn btn-square btn-ghost drawer-button"
                                aria-label="Open Sidebar"
                            >
                                <MenuIcon className="h-6 w-6" />
                            </label>
                        </div>
                        <div className="flex-1 flex items-center">
                            <Link href="/" onClick={handleLogoClick} className="flex items-center space-x-2">
                                <span className="text-2xl font-bold tracking-tight">
                                    ImageFusion.ai
                                </span>
                            </Link>
                        </div>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>
                </header>
                {/* Page content */}
                <main className="flex-grow">
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-8">
                        {children}
                    </div>
                </main>
            </div>
            <div className="drawer-side">
                <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
                <aside className="bg-base-200 w-64 h-full flex flex-col shadow-lg overflow-y-auto">
                    <div className="flex items-center justify-center py-4 border-b border-base-300">
                        <ImageIcon className="w-12 h-12 text-primary" />
                    </div>
                    <ul className="menu p-4 w-full text-base-content flex-grow">
                        {sidebarItems.map((item) => (
                            <li key={item.href} className="mb-2">
                                <div
                                    className={`flex items-center space-x-4 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${pathname === item.href
                                        ? "bg-primary text-white shadow-md"
                                        : "hover:bg-base-300"
                                        }`}
                                    onClick={() => hanldeSidebarItemClick(item.href)}
                                >
                                    <item.icon className="w-6 h-6" />
                                    <span>{item.label}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <SignedIn>
                        <div className="p-4 border-t border-base-300">
                            <SignOutButton redirectUrl={pathname}>
                                <button className="btn btn-outline btn-error w-full flex items-center justify-center">
                                    <LogOutIcon className="mr-2 h-5 w-5" />
                                    Sign Out
                                </button>
                            </SignOutButton>
                        </div>
                    </SignedIn>
                    <SignedOut>
                        <div className="p-4">
                            <SignInButton mode="modal">
                                <button className="btn btn-outline w-full flex items-center justify-center">
                                    Sign In
                                </button>
                            </SignInButton>
                        </div>
                    </SignedOut>
                </aside>
            </div>
        </div >
    );
}
