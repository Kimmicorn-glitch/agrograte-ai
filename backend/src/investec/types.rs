use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvestecAccount {
    pub account_id: String,
    pub account_number: String,
    pub account_name: String,
    pub account_type: String,
    pub currency: String,
    pub available_balance: f64,
    pub current_balance: f64,
    pub overdraft_limit: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvestecTransaction {
    pub transaction_id: String,
    pub account_id: String,
    pub amount: f64,
    pub balance: f64,
    pub description: String,
    pub transaction_date: String,
    pub transaction_type: String,
    pub category: Option<String>,
    pub reference: Option<String>,
    pub merchant: Option<InvestecMerchant>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvestecMerchant {
    pub name: String,
    pub merchant_code: String,
    pub merchant_category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvestecBalance {
    pub account_id: String,
    pub current_balance: f64,
    pub available_balance: f64,
    pub currency: String,
    pub as_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvestecBalanceResponse {
    pub data: InvestecBalanceData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvestecBalanceData {
    pub balance: InvestecBalance,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferRequest {
    pub from_account_id: String,
    pub to_account_id: String,
    pub amount: f64,
    pub reference: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferResponse {
    pub transaction_id: String,
    pub status: String,
    pub amount: f64,
    pub reference: String,
}
