import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";

import { AuthErrorPage } from "../pages/auth/auth-error-page";
import { CompleteSignupPage } from "../pages/auth/complete-signup-page";
import { MePage } from "../pages/auth/me-page";
import { HomePage } from "../pages/home-page";
import { EditPostPage } from "../pages/posts/edit-post-page";
import { NewPostPage } from "../pages/posts/new-post-page";
import { PostDetailPage } from "../pages/posts/post-detail-page";
import { PostsPage } from "../pages/posts/posts-page";
import { queryClient } from "./query-client";
import { RootError, RootLayout } from "./root";

const rootRoute = createRootRoute({
    component: RootLayout,
    errorComponent: RootError
});

const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage
});

const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/posts",
    component: PostsPage
});

const newPostRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/posts/new",
    component: NewPostPage
});

const postDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/posts/$postId",
    component: PostDetailPage
});

const editPostRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/posts/$postId/edit",
    component: EditPostPage
});

const meRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/me",
    component: MePage
});

const completeSignupRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/complete-signup",
    component: CompleteSignupPage
});

const authErrorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/error",
    component: AuthErrorPage
});

const routeTree = rootRoute.addChildren([
    homeRoute,
    postsRoute,
    newPostRoute,
    postDetailRoute,
    editPostRoute,
    meRoute,
    completeSignupRoute,
    authErrorRoute
]);

export const router = createRouter({
    routeTree,
    context: {
        queryClient
    }
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
