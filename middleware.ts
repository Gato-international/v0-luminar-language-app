import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // updateSession handles session refresh and returns a response object.
  const response = await updateSession(request)
  const { pathname } = request.nextUrl

  // Define public/unprotected routes that should always be accessible
  const publicRoutes = ["/auth/login", "/auth/sign-up", "/auth/sign-up-success", "/maintenance"]
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/")) {
    return response
  }

  // Create a Supabase client for middleware-specific queries
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // The updateSession function already handles setting cookies on the response
        },
        remove(name: string, options: CookieOptions) {
          // The updateSession function already handles removing cookies on the response
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user is logged in, allow access to the homepage but redirect elsewhere
  if (!user) {
    if (pathname === "/") return response
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // User is logged in, check their role and platform status
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = profile?.role

  // Developers are immune to maintenance mode
  if (role === "developer") {
    return response
  }

  // Fetch the status for the user's role
  if (role === "student" || role === "teacher") {
    const { data: platformStatus } = await supabase.from("platform_status").select("status").eq("role", role).single()
    const status = platformStatus?.status || "live"

    if (status === "maintenance") {
      // Redirect to maintenance page if not already there
      return NextResponse.redirect(new URL("/maintenance", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}