/**
 * Add Review Use Case (Function Style)
 * Application Layer - Clean Architecture
 *
 * Orchestrates validation, ID/timestamp generation, domain creation, and persistence.
 */

import { Review, InvalidReviewError } from '../domain/review';
import type { ReviewContent } from '../domain/review';
import type { ReviewRepository } from '../domain/review-repo';

/**
 * Command for the add review use case
 */
export type AddReviewCommand = ReviewContent;

/**
 * Result from the add review use case
 */
export type AddReviewResult =
  | { readonly success: true; readonly review: Review }
  | { readonly success: false; readonly errors: readonly string[] };

/**
 * Dependencies for the use case
 */
export type AddReviewDeps = {
  readonly reviewRepository: ReviewRepository;
  /** ID generator dependency (must be provided) */
  readonly generateId: () => string;
  /** Time provider dependency (must be provided) */
  readonly now: () => Date;
};

/**
 * Add Review Use Case (function)
 *
 * @param deps - Dependencies (injected)
 * @param command - Command parameters (review content and optional id)
 * @returns Result containing the created review or validation errors
 */
export async function addReview(
  deps: AddReviewDeps,
  command: AddReviewCommand
): Promise<AddReviewResult> {
  const { rating, title, comment } = command;

  // 1) Validate review content using domain rules
  const validation = Review.validate({ rating, title, comment });
  if (validation.success === false) {
    return { success: false, errors: validation.errors };
  }

  // 2) Generate ID and creation time via injected dependencies
  const id = deps.generateId().trim();
  const createdAt = deps.now();

  try {
    // 3) Prevent duplicates
    if (await deps.reviewRepository.exists(id)) {
      return {
        success: false,
        errors: [`Review with id '${id}' already exists`],
      };
    }

    // 4) Create the domain entity
    let entity: Review;
    try {
      entity = Review.create({ id, rating, title, comment, createdAt });
    } catch (err: unknown) {
      if (err instanceof InvalidReviewError) {
        return { success: false, errors: err.errors };
      }
      const message =
        err instanceof Error ? err.message : 'Unknown error creating review';
      return { success: false, errors: [message] };
    }

    // 5) Persist the entity
    const saved = await deps.reviewRepository.save(entity);

    // 6) Return success with the persisted entity
    return { success: true, review: saved };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown error accessing repository';
    return { success: false, errors: [message] };
  }
}
