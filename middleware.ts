import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only import Clerk if we're not in a production build without the required env vars
let clerkMiddleware: any;
try {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    clerkMiddleware = require("@clerk/nextjs/server").clerkMiddleware;
  }
} catch (error) {
  console.warn("Clerk middleware not available:", error);
}

// This function can be marked `async` if using `await` inside
export default function middleware(request: NextRequest) {
  // If Clerk is available and configured, use it
  if (clerkMiddleware && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return clerkMiddleware({
      publicRoutes: ["/", "/sign-in", "/sign-up"],
      ignoredRoutes: ["/sign-in/(.*)", "/sign-up/(.*)", "/api/(.*)"]
    })(request);
  }
  
  // Otherwise, allow all requests to pass through
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
