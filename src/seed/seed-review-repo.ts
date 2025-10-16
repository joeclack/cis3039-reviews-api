import { getReviewRepo } from '../config/appServices';
import { testReviews } from './test-reviews';

export async function main() {
  const reviewRepo = getReviewRepo();
  for (const review of testReviews) {
    await reviewRepo.save(review);
    console.log(`Seeded review: ${review.id} - ${review.title}`);
  }
  console.log('Seeding complete.');
}

main().catch((err) => {
  console.error('Error seeding reviews:', err);
  process.exit(1);
});
