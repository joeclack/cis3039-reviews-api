# Azure Cosmos DB Setup CLI Commands

## 1. Login

```sh
az login
```

## 2. Create a Resource Group

```sh
az group create \
  --name reviews-lab-ab47-rg \
  --location uksouth
```

## 3. Add Cosmos Preview Extension (once)

```sh
az extension add --name cosmosdb-preview
```

## 4. Create a Cosmos Account (Serverless)

```sh
az cosmosdb create \
  --resource-group reviews-lab-ab47-rg \
  --name reviews-lab-ab47-cosmos \
  --capacity-mode Serverless \
  --backup-policy-type Periodic \
  --backup-redundancy Local
```

## 5. Create a Database

```sh
az cosmosdb sql database create \
  --resource-group reviews-lab-ab47-rg \
  --account-name reviews-lab-ab47-cosmos \
  --name reviews-db
```

## 6. Create a Container

```sh
az cosmosdb sql container create \
  --resource-group reviews-lab-ab47-rg \
  --account-name reviews-lab-ab47-cosmos \
  --database reviews-db \
  --name reviews \
  --partition-key-path "/id"
```

You have now finished provisioning a datastore for this app.

## 7. Query the URL endpoint for the Cosmos Account

```sh
az cosmosdb show \
  --resource-group reviews-lab-ab47-rg \
  --name reviews-lab-ab47-cosmos \
  --query "documentEndpoint" \
  --output tsv
```

Use the returned endpoint to point the app at its database.

### 8. Export your Cosmos key to the shell

```sh
export COSMOS_KEY=$(\
  az cosmosdb keys list \
    --resource-group reviews-lab-ab47-rg \
    --name reviews-lab-ab47-cosmos \
    --query primaryMasterKey \
    -o tsv \
)
```

With the key stored in a local env var, you can now successfully run the app locally.

## 9. Seed the database with test data

```sh
npm run seed
```

## 10. Run the web service

```sh
npm start
```
