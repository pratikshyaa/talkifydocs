// Importing necessary functions and types from external libraries
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { TRPCError, initTRPC } from '@trpc/server';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */

// Create an instance of tRPC (TypeScript RPC) backend
const t = initTRPC.create();
// Extract middleware function from tRPC instance
const middleware = t.middleware;

// Is the user authenticated?
const isAuth = middleware(async (opts) => {
  // Get user information from the server session
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Check if there's no user or no user ID
  if (!user || !user.id) {
    // If not authenticated, throw an unauthorized error
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // If authenticated, pass user ID and information to the next step
  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  });
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */

// Export the router, a part of tRPC that handles routes
export const router = t.router;
// Export a public procedure helper, which doesn't require authentication
export const publicProcedure = t.procedure;
// Export a private procedure helper, which requires authentication using isAuth middleware
export const privateProcedure = t.procedure.use(isAuth);
