import { CosmosClient } from '@azure/cosmos';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const endpoint = process.env.VITE_COSMOS_ENDPOINT || '';
const key = process.env.VITE_COSMOS_KEY || '';

if (!endpoint || !key) {
  console.error("Missing endpoints in .env");
  process.exit(1);
}

const client = new CosmosClient({ endpoint, key });

async function setupDatabase() {
  console.log('Connecting to Cosmos DB...');
  try {
    // Definição das estruturas NoSQL
    const databaseName = "AcervoCulturalDB";
    const containerName = "Items";

    console.log(`Creating database: ${databaseName}...`);
    const { database } = await client.databases.createIfNotExists({ id: databaseName });
    
    console.log(`Creating container: ${containerName}...`);
    // Container com chave de partição (Partition Key) "category" para otimizar queries por tipo
    const { container } = await database.containers.createIfNotExists({
      id: containerName,
      partitionKey: { paths: ["/category"] }
    });

    console.log('Setup successfully completed! Database and Container are ready.');
  } catch (err) {
    console.error('Error setting up Cosmos DB:', err);
  }
}

setupDatabase();
