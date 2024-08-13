import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "signin",
    "signup",
    "/",
    "home"
])

// Define public API routes that don't require authentication
const isPublicApiRoute = createRouteMatcher([
    "/api/videos"
])

/**
 * Clerk Middleware to handle route access based on authentication status.
 * @param {Function} auth - Function to check the authentication status using Clerk.
 * @param {Request} req - The incoming request object.
 */
export default clerkMiddleware((auth, req) => {
    const { userId } = auth(); // Extract the userId from the authentication object
    const currentUrl = new URL(req.url); // Extract the current URL from the request
    const isAccessingDashboard = currentUrl.pathname === "/home"; // Check if the user is trying to access the dashboard
    const isApiRequest = currentUrl.pathname.startsWith("/api"); // Check if the request is for an API route

    // If the user is authenticated and trying to access a public route that is not the dashboard, redirect to the dashboard
    if (userId && isPublicRoute(req) && !isAccessingDashboard) {
        return NextResponse.redirect(new URL("/home", req.url));
    }

    // If the user is not authenticated
    if (!userId) {
        // Redirect to the sign-in page if trying to access a protected route or a non-public API route
        if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/signin", req.url));
        }
        // If the request is for a protected API route, redirect to the sign-in page
        if (isApiRequest && !isPublicApiRoute(req)) {
            return NextResponse.redirect(new URL("/signin", req.url));
        }
    }

    // If none of the above conditions are met, proceed with the request
    return NextResponse.next();
})

// Configuration for matching routes that should apply this middleware
export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
