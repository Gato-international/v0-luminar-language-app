import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
  // Simply pass through the request without auth checks
  // Auth checks will be handled at the page level
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}
