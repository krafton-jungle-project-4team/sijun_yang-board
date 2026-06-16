import { Link, Outlet } from "@tanstack/react-router";

export function RootLayout() {
    return (
        <div className="app-shell">
            <header className="app-header">
                <Link className="app-brand" to="/">
                    Project Starter
                </Link>
                <nav className="app-nav" aria-label="Primary navigation">
                    <Link to="/posts">Posts</Link>
                    <Link to="/posts/new">New post</Link>
                    <Link to="/me">Me</Link>
                </nav>
            </header>
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}

export function RootError() {
    return (
        <div className="page-stack">
            <div className="page-heading">
                <h1>Something went wrong</h1>
            </div>
            <p className="muted">Refresh the page or try again later.</p>
        </div>
    );
}
