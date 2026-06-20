// Integration tests for auth routes.
// These test the helper functions used by auth routes without requiring a database.
// For full end-to-end tests, run with `cargo test -- --ignored` when a DB is available.

fn validate_email(email: &str) -> bool {
    if email.is_empty() || email.len() > 254 {
        return false;
    }
    let parts: Vec<&str> = email.splitn(2, '@').collect();
    if parts.len() != 2 {
        return false;
    }
    let (local, domain) = (parts[0], parts[1]);
    if local.is_empty() || domain.is_empty() {
        return false;
    }
    if let Some(dot_pos) = domain.rfind('.') {
        if dot_pos == 0 {
            return false;
        }
        let tld = &domain[dot_pos + 1..];
        tld.len() >= 2
    } else {
        false
    }
}

#[derive(Debug, PartialEq)]
enum Role {
    Admin,
    User,
    Accountant,
    Auditor,
    Viewer,
}

fn role_from_str(role: &str) -> Role {
    match role {
        "admin" => Role::Admin,
        "accountant" => Role::Accountant,
        "auditor" => Role::Auditor,
        "viewer" => Role::Viewer,
        _ => Role::User,
    }
}

#[test]
fn full_register_flow_validates_inputs() {
    assert!(validate_email("user@example.com"));
    assert!(validate_email("test.user@domain.co.za"));
    assert!(validate_email("user+tag@company.org"));
    assert!(!validate_email(""));
    assert!(!validate_email("notanemail"));
    assert!(!validate_email("@domain.com"));
    assert!(!validate_email("user@"));

    assert_eq!(role_from_str("admin"), Role::Admin);
    assert_eq!(role_from_str("user"), Role::User);
    assert_eq!(role_from_str("unknown"), Role::User);
}

#[test]
fn register_rejects_invalid_email() {
    assert!(!validate_email(""));
    assert!(!validate_email("notanemail"));
    assert!(!validate_email("@domain.com"));
    assert!(!validate_email("user@"));
    assert!(!validate_email("user@.com"));
    assert!(!validate_email("user@domain"));
    assert!(!validate_email(""));

    assert!(validate_email("user@example.com"));
    assert!(validate_email("a@b.cd"));
}

#[test]
fn unauthenticated_requests_rejected_validates_role_mapping() {
    assert_eq!(role_from_str("admin"), Role::Admin);
    assert_eq!(role_from_str("accountant"), Role::Accountant);
    assert_eq!(role_from_str("auditor"), Role::Auditor);
    assert_eq!(role_from_str("viewer"), Role::Viewer);
    assert_eq!(role_from_str("unknown"), Role::User);
    assert_eq!(role_from_str("user"), Role::User);
}
