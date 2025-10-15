/**
 * Fake In-Memory Review Repository
 * Infrastructure Layer - Clean Architecture
 *
 * Implements the ReviewRepository interface using a simple in-memory array.
 * Useful for testing, development, or as a default implementation.
 */

import type { Review } from '../domain/review';
import type { ReviewRepository } from '../domain/review-repo';

export class FakeReviewRepository implements ReviewRepository {
  private reviews: Review[] = [];

  async findById(id: string): Promise<Review | undefined> {
    return this.reviews.find((r) => r.id === id);
  }

  async findAll(): Promise<readonly Review[]> {
    return [...this.reviews];
  }

  async save(review: Review): Promise<Review> {
    const idx = this.reviews.findIndex((r) => r.id === review.id);
    if (idx >= 0) {
      this.reviews[idx] = review;
    } else {
      this.reviews.push(review);
    }
    return review;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.reviews.findIndex((r) => r.id === id);
    if (idx >= 0) {
      this.reviews.splice(idx, 1);
      return true;
    }
    return false;
  }

  async exists(id: string): Promise<boolean> {
    return this.reviews.some((r) => r.id === id);
  }
}
