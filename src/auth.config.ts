import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isProtected =
                nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/inventory') ||
                nextUrl.pathname.startsWith('/sales') ||
                nextUrl.pathname.startsWith('/production') ||
                nextUrl.pathname.startsWith('/purchasing') ||
                nextUrl.pathname.startsWith('/finance') ||
                nextUrl.pathname.startsWith('/crm') ||
                nextUrl.pathname.startsWith('/settings');

            if (isProtected) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Redirect logged-in users away from login page to dashboard
                // But allow access to other public pages if any exist (currently assuming only login is public)
                if (nextUrl.pathname === '/login' || nextUrl.pathname === '/') {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
