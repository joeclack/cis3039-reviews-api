/**
 * List Reviews Use Case (Function Style)
 * Application Layer - Clean Architecture
 *
 * Orchestrates the business logic for listing reviews.
 * Pure application logic with no infrastructure dependencies.
 */

import type { Review } from '../domain/review';
import type { ReviewRepository } from '../domain/review-repo';

/**
 * Command for the list reviews use case
 */
export type ListReviewsCommand = {
  // Future: Add filtering, pagination, sorting options
};

/**
 * Result from the list reviews use case
 */
export type ListReviewsResult =
  | {
      readonly success: true;
      readonly reviews: readonly Review[];
      readonly totalCount: number;
    }
  | { readonly success: false; readonly errors: readonly string[] };

/**
 * Dependencies for the use case
 */
export type ListReviewsDeps = {
  reviewRepository: ReviewRepository;
};

/**
 * List Reviews Use Case (function)
 *
 * @param deps - Dependencies (injected)
 * @param command - Command parameters (currently empty, reserved for future filtering/pagination)
 * @returns Result containing the list of reviews
 */
export async function listReviews(
  deps: ListReviewsDeps,
  command: ListReviewsCommand = {}
): Promise<ListReviewsResult> {
  try {
    // Retrieve all reviews from repository
    const reviews = await deps.reviewRepository.findAll();
    // Return formatted result
    return {
      success: true,
      reviews,
      totalCount: reviews.length,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown error fetching reviews';
    return {
      success: false,
      errors: [message],
    };
  }
}
