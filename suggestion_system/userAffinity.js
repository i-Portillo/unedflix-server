const mongo = require('../db/mongo');

const async = require('async');

const MediaReview = require('../models/mediaReview');
const User = require('../models/user')

mongo.connect();

const getUserSimilarity = (userReviews, otherReviews) => {

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

  // const results = {
  //   user: other._id,
  //   match: 0,
  // };

  // let affinity = 0;
  
  // userReviews.forEach(userReview => {

  //   const found = otherReviews.find(otherReview => otherReview.media.equals(userReview.media));
  //   if (found) {
  //     results.match += 1;
  //     if (userReview.feedback === found.feedback) affinity++;
  //     results.feedback = found.feedback;
  //   }
  // });

  // if (results.match) results.affinity = affinity / results.match;

  // return results;
}

// const getAffinity = (userReviews, other, similarityTable) => {

//   if (!similarityTable[other._id]) {
//     similarityTable[other._id] = getUserSimilarity(userReviews, other.media_reviews);
//   }

//   return 

// }

const evaluateMedia = async (mediaId, userReviews, similarityTable) => {

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
    })

    const otherUsers = reviews.map( review => review.user);

    otherUsers.forEach( otherUser => {
      if (!similarityTable[otherUser.email]) {
        similarityTable[otherUser.email] = getUserSimilarity(userReviews, otherUser.media_reviews);
      }
    })

    // console.log(similarityTable.length);

    return 100;

    // // For every review that media has compare the affinity with the user
    // let userAffinities = await Promise.all(
    //   reviews.map( async review => {


    //     if (!similarityTable[review.user._id]) {

    //     }
        
    //     const other = await User.findById(review.user)
    //     .populate({
    //       path: 'media_reviews'
    //     });
    //     return compareUsers(userReviews, other);
    //   })
    // )

    // userAffinities = userAffinities.filter( userAffinity => userAffinity.affinity >= affinityThreshold)

    // if (userAffinities.length === 0) return 50;  // If not enough affinities => 50/50

    // const positiveFeedback = userAffinities.reduce( (prev, current) => {
    //   return current.feedback ? prev + 1 : prev; // Counts the number of positive feedbacks
    // }, 0)

    // return 100 * positiveFeedback / userAffinities.length;

  } catch(err) {
    console.log(err);
  }

}

module.exports = { evaluateMedia };

// DEBUG

// const debug = async () => {

//   try {
//     const user = await User.findOne({})
//     .populate({
//       path: 'media_reviews'
//     });
//     console.log(await evaluateMedia({_id: '6295086043b62f47d0bf3479'}, user.media_reviews));
//   } catch (err) {
//     console.log(err);
//   }  
// }

// debug();
