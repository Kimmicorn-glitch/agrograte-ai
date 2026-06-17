// Integration tests for auth routes.
// Requires a running database — run with `cargo test -- --ignored` when a DB is available.
// Once `backend/src/lib.rs` is created exposing AppState and a test app builder,
// these can make real HTTP requests against the router.
//
// For now, unit tests in `backend/src/auth/routes.rs` cover validate_email and role_from_str.

/// Placeholder to prevent "no tests" warning.
#[test]
fn integration_test_placeholder() {
    assert!(true);
}

#[test]
#[ignore = "requires database — see comment above"]
fn full_register_flow() {
    // Register a user → login → get /me → refresh token → logout
    unimplemented!("Set up DB, build test router, run full auth flow")
}

#[test]
#[ignore = "requires database — see comment above"]
fn register_rejects_invalid_email() {
    // POST /api/auth/register with bad email → 400
    unimplemented!("POST with invalid email, expect VALIDATION_ERROR")
}

#[test]
#[ignore = "requires database — see comment above"]
fn unauthenticated_requests_rejected() {
    // GET /api/auth/me without token → 401
    // POST /api/auth/logout without token → 401
    unimplemented!("Send unauthenticated requests, expect 401")
}
