/**
 * Cosmos DB Review Repository Adapter
 * Infrastructure Layer - Clean Architecture
 *
 * Implements the ReviewRepository interface using Azure Cosmos DB.
 * Uses a single options parameter for configuration.
 */

import type { Review } from '../domain/review';
import type { ReviewRepository } from '../domain/review-repo';
import { CosmosClient, Container } from '@azure/cosmos';

export type CosmosReviewRepoOptions = {
  endpoint: string;
  key: string;
  databaseId: string;
  containerId: string;
};

// DTO persisted to Cosmos DB
// Keep this decoupled from the domain model (notably, dates are strings in storage)
export type CosmosReviewDocument = {
  id: string; // also used as partition key per container config ("/id")
  rating: number;
  title: string;
  comment: string;
  createdAt: string; // ISO 8601 string
};

export class CosmosReviewRepository implements ReviewRepository {
  private client: CosmosClient;
  private container: Container;

  constructor(private readonly options: CosmosReviewRepoOptions) {
    const missing: string[] = [];
    if (!options.endpoint) missing.push('endpoint');
    if (!options.key) missing.push('key');
    if (!options.databaseId) missing.push('databaseId');
    if (!options.containerId) missing.push('containerId');
    if (missing.length > 0) {
      throw new Error(
        `CosmosReviewRepository: Missing required options: ${missing.join(
          ', '
        )}`
      );
    }
    this.client = new CosmosClient({
      endpoint: options.endpoint,
      key: options.key,
    });
    this.container = this.client
      .database(options.databaseId)
      .container(options.containerId);
  }

  async findById(id: string): Promise<Review | undefined> {
    try {
      const { resource } = await this.container
        .item(id, id)
        .read<CosmosReviewDocument>();
      return resource ? fromDocument(resource) : undefined;
    } catch (err: any) {
      if (err.code === 404) return undefined;
      throw err;
    }
  }

  async findAll(): Promise<readonly Review[]> {
    const query = 'SELECT * FROM c';
    const { resources } = await this.container.items
      .query<CosmosReviewDocument>(query)
      .fetchAll();
    return resources.map(fromDocument);
  }

  async save(review: Review): Promise<Review> {
    const doc = toDocument(review);
    await this.container.items.upsert<CosmosReviewDocument>(doc);
    return review;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.container.item(id, id).delete();
      return true;
    } catch (err: any) {
      if (err.code === 404) return false;
      throw err;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const { resource } = await this.container
        .item(id, id)
        .read<CosmosReviewDocument>();
      return !!resource;
    } catch (err: any) {
      if (err.code === 404) return false;
      throw err;
    }
  }
}

// Mapping helpers between domain and persistence representations
const toDocument = (review: Review): CosmosReviewDocument => ({
  id: review.id,
  rating: review.rating,
  title: review.title,
  comment: review.comment,
  createdAt: review.createdAt.toISOString(),
});

const fromDocument = (doc: CosmosReviewDocument): Review => ({
  id: doc.id,
  rating: doc.rating,
  title: doc.title,
  comment: doc.comment,
  createdAt: new Date(doc.createdAt),
});
