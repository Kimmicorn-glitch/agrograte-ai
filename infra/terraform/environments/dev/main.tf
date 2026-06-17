terraform {
  backend "s3" {
    bucket = "agrograte-terraform-state"
    key    = "dev/terraform.tfstate"
    region = "af-south-1"
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "agrograte-dev"
  location = "southafricanorth"
}

module "aks" {
  source = "../modules/aks"
  resource_group_name = azurerm_resource_group.main.name
  cluster_name       = "agrograte-dev-aks"
  node_count         = 3
  environment        = "dev"
}

module "postgres" {
  source = "../modules/postgres"
  resource_group_name = azurerm_resource_group.main.name
  server_name        = "agrograte-dev-pg"
  environment        = "dev"
}

module "redis" {
  source = "../modules/redis"
  resource_group_name = azurerm_resource_group.main.name
  cache_name         = "agrograte-dev-redis"
  environment        = "dev"
}

module "nats" {
  source = "../modules/nats"
  resource_group_name = azurerm_resource_group.main.name
  environment        = "dev"
}

module "vault" {
  source = "../modules/vault"
  resource_group_name = azurerm_resource_group.main.name
  environment        = "dev"
}
