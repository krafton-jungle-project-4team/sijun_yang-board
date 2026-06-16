import {
    Button,
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from "@nmm/ui/components";
import { Link, Outlet } from "@tanstack/react-router";

export function RootLayout() {
    return (
        <div className="min-h-svh bg-background text-foreground">
            <header className="sticky top-0 z-10 border-b bg-background/95">
                <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <Button asChild variant="ghost">
                        <Link to="/">Project Starter</Link>
                    </Button>
                    <NavigationMenu viewport={false}>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link to="/posts">Posts</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link to="/posts/new">New post</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link to="/me">Me</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </header>
            <main className="mx-auto w-full max-w-5xl px-4 py-7">
                <Outlet />
            </main>
        </div>
    );
}

export function RootError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Something went wrong</CardTitle>
                <CardDescription>Refresh the page or try again later.</CardDescription>
            </CardHeader>
        </Card>
    );
}
