use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};

use uuid::Uuid;

use super::super::domain::value_objects::Role;
use super::Claims;

pub fn create_access_token(
    user_id: Uuid,
    email: &str,
    role: &Role,
    business_id: Option<Uuid>,
    secret: &str,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let claims = Claims {
        sub: user_id,
        email: email.to_string(),
        role: role.clone(),
        business_id,
        iat: now.timestamp() as usize,
        exp: (now + Duration::minutes(15)).timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

pub fn create_refresh_token(
    user_id: Uuid,
    secret: &str,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let claims = Claims {
        sub: user_id,
        email: String::new(),
        role: Role::User,
        business_id: None,
        iat: now.timestamp() as usize,
        exp: (now + Duration::days(7)).timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

pub fn validate_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )?;
    Ok(token_data.claims)
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn test_create_and_validate_access_token() {
        let user_id = Uuid::new_v4();
        let secret = "test-secret-key-for-jwt";
        let token = create_access_token(user_id, "test@example.com", &Role::Admin, None, secret)
            .expect("should create token");
        let claims = validate_token(&token, secret).expect("should validate token");
        assert_eq!(claims.sub, user_id);
        assert_eq!(claims.email, "test@example.com");
        assert!(matches!(claims.role, Role::Admin));
    }

    #[test]
    fn test_create_and_validate_refresh_token() {
        let user_id = Uuid::new_v4();
        let secret = "test-secret-key-for-jwt";
        let token = create_refresh_token(user_id, secret).expect("should create refresh token");
        let claims = validate_token(&token, secret).expect("should validate refresh token");
        assert_eq!(claims.sub, user_id);
        assert_eq!(claims.email, "");
        assert!(matches!(claims.role, Role::User));
    }

    #[test]
    fn test_validate_with_wrong_secret_fails() {
        let user_id = Uuid::new_v4();
        let token = create_access_token(user_id, "a@b.com", &Role::User, None, "correct-secret")
            .expect("should create token");
        let result = validate_token(&token, "wrong-secret");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_garbage_token_fails() {
        let result = validate_token("not.a.real.token", "secret");
        assert!(result.is_err());
    }

    #[test]
    fn test_access_token_has_email_and_role() {
        let user_id = Uuid::new_v4();
        let token = create_access_token(user_id, "admin@corp.com", &Role::Admin, None, "s").unwrap();
        let claims = validate_token(&token, "s").unwrap();
        assert_eq!(claims.email, "admin@corp.com");
        assert!(matches!(claims.role, Role::Admin));
    }

    #[test]
    fn test_refresh_token_has_no_email() {
        let user_id = Uuid::new_v4();
        let token = create_refresh_token(user_id, "s").unwrap();
        let claims = validate_token(&token, "s").unwrap();
        assert!(claims.email.is_empty());
        assert!(claims.business_id.is_none());
    }
}
