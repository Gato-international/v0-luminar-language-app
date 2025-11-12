import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // This response object now carries the session cookies.
  let response = await updateSession(request)
  const { pathname } = request.nextUrl

  // Helper to create redirects while preserving session cookies.
  const createRedirect = (url: string) => {
    const redirectResponse = NextResponse.redirect(new URL(url, request.url))
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })
    return redirectResponse
  }

  const publicRoutes = ["/auth/login", "/auth/sign-up", "/auth/sign-up-success", "/maintenance"]
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/")) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          response.cookies.set({ name, value, ...options })
        },
        remove: (name: string, options: CookieOptions) => {
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (pathname === "/") return response
    return createRedirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = profile?.role

  if (role === "developer") {
    if (pathname === "/maintenance") {
      return createRedirect("/dashboard")
    }
    return response
  }

  if (role === "student" || role === "teacher") {
    const { data: platformStatus } = await supabase.from("platform_status").select("status").eq("role", role).single()
    const status = platformStatus?.status || "live"

    if (status === "maintenance") {
      if (pathname !== "/maintenance") {
        return createRedirect("/maintenance")
      }
    } else if (status === "test") {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-platform-status", "test")
      // Re-use the existing response object to add headers.
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } else {
      if (pathname === "/maintenance") {
        return createRedirect("/dashboard")
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}