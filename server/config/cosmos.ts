import { CosmosClient } from '@azure/cosmos';
import * as dotenv from 'dotenv';
import path from 'path';

// Load variables from .env depending on execution context
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const endpoint = process.env.VITE_COSMOS_ENDPOINT || '';
const key = process.env.VITE_COSMOS_KEY || '';

if (!endpoint || !key) {
  throw new Error("Missing Azure Cosmos DB endpoints in .env");
}

export const cosmosClient = new CosmosClient({ endpoint, key });
export const databaseId = "AcervoCulturalDB";
export const containerId = "Items";
