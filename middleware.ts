import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Maak een response-object aan dat we kunnen aanpassen en retourneren.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Maak een Supabase-client die cookies kan lezen en schrijven.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // De 'set'-methode wordt aangeroepen wanneer de Supabase-client een cookie moet opslaan.
          // We passen het response-object aan om de cookie in te stellen.
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // De 'remove'-methode wordt aangeroepen wanneer de Supabase-client een cookie moet verwijderen.
          // We passen het response-object aan om de cookie te verwijderen.
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // Dit zal de sessie vernieuwen als deze is verlopen.
  // Het maakt ook gebruikersgegevens beschikbaar voor de rest van de middleware.
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

  // Als we tot hier zijn gekomen, retourneer de response met bijgewerkte cookies.
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}