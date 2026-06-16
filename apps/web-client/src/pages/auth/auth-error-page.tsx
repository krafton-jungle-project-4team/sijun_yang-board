export function AuthErrorPage() {
    return (
        <div className="page-stack">
            <div className="page-heading">
                <h1>Authentication error</h1>
            </div>
            <p className="muted">The session could not be verified.</p>
        </div>
    );
}
