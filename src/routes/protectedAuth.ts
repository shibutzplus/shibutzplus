import router from "./index";

type RouteKey = keyof typeof router;
type Route = (typeof router)[RouteKey];

/**
 * Dynamically gets all protected paths from the router configuration
 * @returns Array of path strings for protected routes
 */
export const getProtectedPaths = (): string[] => {
    return Object.values(router)
        .filter((route) => route.private === true)
        .map((route) => route.p);
};

/**
 * Dynamically gets all public paths from the router configuration
 * @returns Array of path strings for public routes
 */
export const getPublicPaths = (): string[] => {
    return Object.values(router)
        .filter((route) => route.private === false)
        .map((route) => route.p);
};

/**
 * Gets all protected route objects from the router configuration
 * @returns Array of route objects that are protected
 */
export const getProtectedRoutes = (): Route[] => {
    return Object.values(router).filter((route) => route.private === true);
};

/**
 * Gets all public route objects from the router configuration
 * @returns Array of route objects that are public
 */
export const getPublicRoutes = (): Route[] => {
    return Object.values(router).filter((route) => route.private === false);
};

/**
 * Generates the matcher configuration for Next.js middleware
 * @returns Array of path patterns for the middleware matcher
 */
export const getConfigMatcher = (): string[] => {
    const protectedPathsWithWildcard = getProtectedPaths();

    // Get login and register paths (typically need exact matches)
    const authPaths = [router.signIn.p, router.signUp.p];

    // Add root path to the matcher
    const rootPath = router.home.p;

    // Combine all arrays for the complete matcher configuration
    return [...protectedPathsWithWildcard, ...authPaths, rootPath];
};

export const protectedPaths = getProtectedPaths();
export const publicPaths = getPublicPaths();
export const configMatcher = getConfigMatcher();
