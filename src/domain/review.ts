/**
 * Review Domain Model Entity
 * Pure Domain Layer - Clean Architecture
 * Functional Programming Style
 */

// Domain Entity
export type Review = {
  readonly id: string;
  //readonly productId: string; // Would be in a real app; would be partition key
  readonly rating: number;
  readonly title: string;
  readonly comment: string;
  readonly createdAt: Date;
};

// Value Objects for domain operations
export type ReviewContent = {
  readonly rating: number;
  readonly title: string;
  readonly comment: string;
};

// Domain error for invalid review content
export class InvalidReviewError extends Error {
  constructor(public readonly errors: readonly string[]) {
    super(`Invalid review content: ${errors.join(', ')}`);
    this.name = 'InvalidReviewError';
  }
}

// Domain Validation Rules
const RATING_MIN = 1;
const RATING_MAX = 5;
const TITLE_MAX_LENGTH = 200;
const COMMENT_MAX_LENGTH = 5000;

// Validation functions (pure business rules)
const isValidRating = (rating: number): boolean =>
  rating >= RATING_MIN && rating <= RATING_MAX && Number.isInteger(rating);

const isValidTitle = (title: string): boolean =>
  title.trim().length > 0 && title.length <= TITLE_MAX_LENGTH;

const isValidComment = (comment: string): boolean =>
  comment.trim().length > 0 && comment.length <= COMMENT_MAX_LENGTH;

// Validation result type (discriminated union)
export type ReviewValidationResult =
  | { success: true }
  | { success: false; errors: readonly string[] };

const validateReviewContent = (
  content: ReviewContent
): ReviewValidationResult => {
  const errors: string[] = [];

  if (!isValidRating(content.rating)) {
    errors.push(
      `Rating must be an integer between ${RATING_MIN} and ${RATING_MAX}`
    );
  }

  if (!isValidTitle(content.title)) {
    errors.push(`Title must be between 1 and ${TITLE_MAX_LENGTH} characters`);
  }

  if (!isValidComment(content.comment)) {
    errors.push(
      `Comment must be between 1 and ${COMMENT_MAX_LENGTH} characters`
    );
  }

  return errors.length === 0 ? { success: true } : { success: false, errors };
};

// Factory function to create a new Review (requires all fields in a flat object)
// Throws InvalidReviewError if any parameter is invalid
// Client should call validate() first to check content
export type CreateReviewParams = {
  id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
};

const createReview = ({
  id,
  rating,
  title,
  comment,
  createdAt,
}: CreateReviewParams): Review => {
  const errors: string[] = [];

  // Validate ID
  if (!id || id.trim().length === 0) {
    errors.push('ID is required and cannot be empty');
  }

  // Validate createdAt
  if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    errors.push('Created date must be a valid Date');
  }

  // Validate content using the validation function (reuses validation logic)
  const contentValidation = validateReviewContent({ rating, title, comment });
  if (!contentValidation.success) {
    // TypeScript knows contentValidation.errors exists here
    const failedValidation = contentValidation as {
      success: false;
      errors: readonly string[];
    };
    errors.push(...failedValidation.errors);
  }

  if (errors.length > 0) {
    throw new InvalidReviewError(errors);
  }

  return {
    id,
    rating,
    title,
    comment,
    createdAt,
  };
};

// Domain Query Functions (pure business logic)
const getAverageRating = (reviews: readonly Review[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
};

const filterByRating = (
  reviews: readonly Review[],
  rating: number
): readonly Review[] => reviews.filter((review) => review.rating === rating);

const sortByDate = (
  reviews: readonly Review[],
  order: 'asc' | 'desc' = 'desc'
): readonly Review[] =>
  [...reviews].sort((a, b) => {
    const comparison = a.createdAt.getTime() - b.createdAt.getTime();
    return order === 'asc' ? comparison : -comparison;
  });

const sortByRating = (
  reviews: readonly Review[],
  order: 'asc' | 'desc' = 'desc'
): readonly Review[] =>
  [...reviews].sort((a, b) => {
    const comparison = a.rating - b.rating;
    return order === 'asc' ? comparison : -comparison;
  });

// Exported Review namespace with all domain operations
export const Review = {
  create: createReview,
  validate: validateReviewContent,
  isValidRating,
  isValidTitle,
  isValidComment,
  getAverageRating,
  filterByRating,
  sortByDate,
  sortByRating,
} as const;
