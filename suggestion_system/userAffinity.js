import MediaReview from '../models/mediaReview.js'

const getUserSimilarity = (userReviews, otherReviews=[]) => {

  let reviewedByBoth = 0;
  let sameFeedback = 0;
  
  userReviews.forEach(userReview => {
    const found = otherReviews.find(otherReview => otherReview.media.equals(userReview.media));
    if (found) {
      reviewedByBoth++;
      if (userReview.feedback === found.feedback) sameFeedback++;
    }
  })

  let similarity = 0;
  if (reviewedByBoth !== 0) {
    similarity = sameFeedback / reviewedByBoth;    
  }

  return similarity;
}

export const evaluateMedia = async (mediaId, userReviews, similarityTable) => {

  const affinityThreshold = 0.6;

  try {
    const reviews = await MediaReview.find({media: mediaId})
    .populate({
      path: 'user',
      select: {media_reviews: 1, email: 1},
      populate: {
        path: 'media_reviews',
        model: 'MediaReview'
      }
    });

    const otherUsers = reviews.map( review => {
      const user = (review.user)?.toJSON();
      let otherUser = { ...user, feedback: review.feedback }
      return otherUser;
    });

    let sum = 0;
    let count = 0;

    otherUsers.forEach( otherUser => {
      if (!similarityTable[otherUser.email]) {
        similarityTable[otherUser.email] = getUserSimilarity(userReviews, otherUser.media_reviews);
      }
      if (similarityTable[otherUser.email] >= affinityThreshold) {
        count++;
        sum += (otherUser.feedback === true ? similarityTable[otherUser.email] : -similarityTable[otherUser.email])
      }
    });

    const evaluation = ((count === 0 ? 0  : (sum / count)) + 1) * 50; // Avoid division by 0 and standarization

    return evaluation;

  } catch(err) {
    console.log(err);
  }

}
