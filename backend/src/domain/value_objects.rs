use serde::{Deserialize, Serialize};
use std::ops::{Add, Sub};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Money {
    pub amount: f64,
    pub currency: String,
}

impl Money {
    pub fn zar(amount: f64) -> Self {
        Self {
            amount,
            currency: "ZAR".to_string(),
        }
    }
}

impl Add for Money {
    type Output = Self;
    fn add(self, other: Self) -> Self {
        Self {
            amount: self.amount + other.amount,
            currency: self.currency,
        }
    }
}

impl Sub for Money {
    type Output = Self;
    fn sub(self, other: Self) -> Self {
        Self {
            amount: self.amount - other.amount,
            currency: self.currency,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxRate {
    pub percentage: f64,
    pub description: String,
}

impl TaxRate {
    pub fn standard_vat() -> Self {
        Self {
            percentage: 15.0,
            description: "Standard VAT".to_string(),
        }
    }

    pub fn zero_rate() -> Self {
        Self {
            percentage: 0.0,
            description: "Zero Rate".to_string(),
        }
    }

    pub fn exempt() -> Self {
        Self {
            percentage: 0.0,
            description: "Exempt".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VatCategory {
    Standard,
    ZeroRated,
    Exempt,
    OutOfScope,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AccountType {
    Cheque,
    Savings,
    Business,
    TaxReserve,
    Programmable,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionStatus {
    Pending,
    Posted,
    Reversed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InvoiceStatus {
    Draft,
    Sent,
    Overdue,
    Paid,
    Cancelled,
    Credited,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplianceStatus {
    Pending,
    Filed,
    Approved,
    Rejected,
    Audited,
    Overdue,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Role {
    Admin,
    User,
    Accountant,
    Auditor,
    Viewer,
}

impl Role {
    pub fn permissions(&self) -> Vec<&str> {
        match self {
            Role::Admin => vec!["*"],
            Role::User => vec!["read:own", "write:own", "manage:rules"],
            Role::Accountant => vec!["read:own", "write:own", "read:tax", "write:tax"],
            Role::Auditor => vec!["read:all", "read:audit"],
            Role::Viewer => vec!["read:own"],
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_money_zar() {
        let m = Money::zar(100.50);
        assert_eq!(m.amount, 100.50);
        assert_eq!(m.currency, "ZAR");
    }

    #[test]
    fn test_money_add() {
        let a = Money::zar(100.0);
        let b = Money::zar(50.0);
        let c = a + b;
        assert_eq!(c.amount, 150.0);
        assert_eq!(c.currency, "ZAR");
    }

    #[test]
    fn test_money_sub() {
        let a = Money::zar(100.0);
        let b = Money::zar(30.0);
        let c = a - b;
        assert_eq!(c.amount, 70.0);
        assert_eq!(c.currency, "ZAR");
    }

    #[test]
    fn test_tax_rate_standard_vat() {
        let vat = TaxRate::standard_vat();
        assert_eq!(vat.percentage, 15.0);
        assert_eq!(vat.description, "Standard VAT");
    }

    #[test]
    fn test_tax_rate_zero() {
        let z = TaxRate::zero_rate();
        assert_eq!(z.percentage, 0.0);
        assert_eq!(z.description, "Zero Rate");
    }

    #[test]
    fn test_tax_rate_exempt() {
        let e = TaxRate::exempt();
        assert_eq!(e.percentage, 0.0);
        assert_eq!(e.description, "Exempt");
    }

    #[test]
    fn test_admin_has_all_permissions() {
        let perms = Role::Admin.permissions();
        assert!(perms.contains(&"*"));
    }

    #[test]
    fn test_user_permissions() {
        let perms = Role::User.permissions();
        assert!(perms.contains(&"read:own"));
        assert!(perms.contains(&"write:own"));
        assert!(perms.contains(&"manage:rules"));
        assert!(!perms.contains(&"read:tax"));
    }

    #[test]
    fn test_accountant_permissions() {
        let perms = Role::Accountant.permissions();
        assert!(perms.contains(&"read:tax"));
        assert!(perms.contains(&"write:tax"));
        assert!(!perms.contains(&"manage:rules"));
    }

    #[test]
    fn test_auditor_permissions() {
        let perms = Role::Auditor.permissions();
        assert!(perms.contains(&"read:all"));
        assert!(perms.contains(&"read:audit"));
        assert!(!perms.contains(&"write:own"));
    }

    #[test]
    fn test_viewer_permissions() {
        let perms = Role::Viewer.permissions();
        assert!(perms.contains(&"read:own"));
        assert!(!perms.contains(&"write:own"));
        assert!(!perms.contains(&"read:audit"));
    }
}
