-- Create contracts table to store PDF documents for memberships
CREATE TABLE IF NOT EXISTS "Contracts" (
    "Id" SERIAL PRIMARY KEY,
    "SubscriptionId" INTEGER NOT NULL REFERENCES "Subscriptions"("Id") ON DELETE CASCADE,
    "CustomerEmail" VARCHAR(255) NOT NULL,
    "CustomerName" VARCHAR(255) NOT NULL,
    "PdfContent" BYTEA NOT NULL,
    "AcceptanceDate" TIMESTAMP NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_contracts_email ON "Contracts"("CustomerEmail");

-- Create index for faster lookups by subscription
CREATE INDEX IF NOT EXISTS idx_contracts_subscription ON "Contracts"("SubscriptionId");
