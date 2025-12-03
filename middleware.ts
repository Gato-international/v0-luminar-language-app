import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Helper om redirects te maken met behoud van sessiecookies.
  const createRedirect = (url: string) => {
    const redirectResponse = NextResponse.redirect(new URL(url, request.url))
    // Kopieer alle cookies van onze werkresponse naar de redirect-response.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })
    return redirectResponse
  }

  // --- ROUTEBEVEILIGINGSLOGICA ---

  const publicRoutes = ["/auth/login", "/auth/sign-up", "/auth/sign-up-success", "/maintenance"]
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/")) {
    return response // Beveilig geen openbare routes.
  }

  // Als er geen gebruiker is, stuur door naar de inlogpagina, behalve voor de hoofdpagina.
  if (!user) {
    if (pathname === "/") return response // Toegang tot de startpagina toestaan
    return createRedirect("/auth/login")
  }

  // --- ROLGEBASEERDE LOGICA & ONDERHOUDSMODUS ---

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = profile?.role

  // Developers zijn immuun voor de onderhoudsmodus.
  if (role === "developer") {
    if (pathname === "/maintenance") {
      return createRedirect("/dashboard")
    }
    return response
  }

  // Controleer de status voor studenten en docenten.
  if (role === "student" || role === "teacher") {
    const { data: platformStatus } = await supabase.from("platform_status").select("status").eq("role", role).single()
    const status = platformStatus?.status || "live"

    if (status === "maintenance") {
      if (pathname !== "/maintenance") {
        return createRedirect("/maintenance")
      }
    } else if (status === "test") {
      // Voeg een header toe voor de testmodus.
      response.headers.set("x-platform-status", "test")
      if (pathname === "/maintenance") {
        return createRedirect("/dashboard")
      }
    } else {
      // status is 'live'
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