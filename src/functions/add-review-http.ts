import { app } from '@azure/functions';
import { makeAddReview } from '../config/appServices';

async function addReviewHttp(request, context) {
  // Parse review data from request body
  const command = await request.json();
  const addReview = makeAddReview();
  const result = await addReview(command);

  if (result.success) {
    return {
      status: 201,
      jsonBody: {
        review: result.review,
      },
    };
  } else {
    return {
      status: 400, // questionable default; could be 4xx or 5xx depending on error
      jsonBody: {
        errors: (result as { errors: readonly string[] }).errors,
      },
    };
  }
}

app.http('addReviewHttp', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'reviews',
  handler: addReviewHttp,
});
