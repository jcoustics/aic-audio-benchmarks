import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  // Protected admin routes
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (request.nextUrl.pathname === '/admin/login') {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
