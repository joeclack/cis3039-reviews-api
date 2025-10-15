/**
 * Review Repository Interface
 * Pure Domain Layer - Clean Architecture
 *
 * Defines the contract for review persistence without implementation details.
 * Infrastructure layer will provide concrete implementations.
 */

import type { Review } from './review';

/**
 * Repository interface for Review aggregate
 * All methods return Promises for async operations
 */
export interface ReviewRepository {
  /**
   * Find a review by its unique identifier
   * @param id - The review ID
   * @returns The review if found, undefined otherwise
   */
  findById(id: string): Promise<Review | undefined>;

  /**
   * Find all reviews
   * @returns Array of all reviews
   */
  findAll(): Promise<readonly Review[]>;

  /**
   * Save a new review or update an existing one
   * @param review - The review to save
   * @returns The saved review
   */
  save(review: Review): Promise<Review>;

  /**
   * Delete a review by its identifier
   * @param id - The review ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a review exists
   * @param id - The review ID
   * @returns true if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;
}
