const mongo = require('../db/mongo');

const async = require('async');

const MediaReview = require('../models/mediaReview');
const User = require('../models/user')

mongo.connect();

const compareUsers = (userReviews, other) => {

  const results = {
    user: other._id,
    match: 0,
  };

  let affinity = 0;
  
  userReviews.forEach(userReview => {

    const found = other.media_reviews.find(otherReview => otherReview.media.equals(userReview.media));
    if (found) {
      results.match += 1;
      if (userReview.feedback === found.feedback) affinity++;
      results.feedback = found.feedback;
    }
  });

  if (results.match) results.affinity = affinity / results.match;

  return results;
}

const evaluateMedia = async (mediaId, userReviews) => {

  const affinityThreshold = 0.6;

  try {
    const reviews = await MediaReview.find({media: mediaId})
    .populate({
      path: 'user',
      select: {'media_reviews': 1},
      populate: {
        path: 'media_reviews',
        model: 'MediaReview'
      }
    })

    // For every review that media has compare the affinity with the user
    let userAffinities = await Promise.all(
      reviews.map( async review => {
        const other = await User.findById(review.user)
        .populate({
          path: 'media_reviews'
        });
        return compareUsers(userReviews, other);
      })
    )

    userAffinities = userAffinities.filter( userAffinity => userAffinity.affinity >= affinityThreshold)

    if (userAffinities.length === 0) return 50;  // If not enough affinities => 50/50

    const positiveFeedback = userAffinities.reduce( (prev, current) => {
      return current.feedback ? prev + 1 : prev; // Counts the number of positive feedbacks
    }, 0)

    return 100 * positiveFeedback / userAffinities.length;

  } catch(err) {
    console.log(err);
  }

}

module.exports = { evaluateMedia, compareUsers };

// DEBUG

const debug = async () => {

  // Simpsons movie 

  try {
    const user = await User.findOne({})
    .populate({
      path: 'media_reviews'
    });
    console.log(await evaluateMedia({_id: '6295086043b62f47d0bf3479'}, user.media_reviews));
  } catch (err) {
    console.log(err);
  }  
}

// debug();
