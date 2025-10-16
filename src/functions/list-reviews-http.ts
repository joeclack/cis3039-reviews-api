import { app } from '@azure/functions';
import { makeListReviews } from '../config/appServices';

async function listReviewsHttp(request, context) {
  // Optionally parse query params for future filtering/pagination
  // For now, just call with empty command
  const listReviews = makeListReviews();
  const command = {};
  const result = await listReviews(command);
  return {
    status: result.success ? 200 : 500,
    jsonBody: result.success
      ? {
          reviews: result.reviews,
          totalCount: result.totalCount,
        }
      : {
          errors: (result as { errors: readonly string[] }).errors,
        },
  };
}

app.http('listReviewsHttp', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reviews',
  handler: listReviewsHttp,
});
