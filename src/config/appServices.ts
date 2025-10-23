import {
  CosmosReviewRepository,
  CosmosReviewRepoOptions,
} from '../infra/cosmos-review-repo';

import type { AddReviewDeps } from '../app/add-review';
import type { ListReviewsDeps } from '../app/list-reviews';
import type { ReviewRepository } from '../domain/review-repo';
import { addReview } from '../app/add-review';
import { listReviews } from '../app/list-reviews';

const COSMOS_OPTIONS: CosmosReviewRepoOptions = {
  endpoint: process.env.COSMOS_ENDPOINT,
  databaseId: process.env.COSMOS_DATABASE_ID,
  containerId: process.env.COSMOS_CONTAINER_ID,
  key: process.env.COSMOS_KEY,
};

// Singleton instance holder
let cachedReviewRepo: ReviewRepository | null = null;

/**
 * Lazily creates and returns a singleton instance of CosmosReviewRepo.
 */
export function getReviewRepo(): ReviewRepository {
  if (!cachedReviewRepo) {
    cachedReviewRepo = new CosmosReviewRepository(COSMOS_OPTIONS);
  }
  return cachedReviewRepo;
}

// Dependency factory for addReview use case
function makeAddReviewDeps(): AddReviewDeps {
  return {
    reviewRepository: getReviewRepo(),
    generateId: () => crypto.randomUUID(),
    now: () => new Date(),
  };
}

// Dependency factory for listReviews use case
function makeListReviewsDeps(): ListReviewsDeps {
  return {
    reviewRepository: getReviewRepo(),
  };
}

// Factory for addReview use case, returns a function bound to its dependencies
export function makeAddReview() {
  const deps = makeAddReviewDeps();
  return (command) => addReview(deps, command);
}

// Factory for listReviews use case, returns a function bound to its dependencies
export function makeListReviews() {
  const deps = makeListReviewsDeps();
  return (command) => listReviews(deps, command);
}
