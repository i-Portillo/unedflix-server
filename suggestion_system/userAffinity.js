const mongo = require('../db/mongo');

const async = require('async');

const MediaReview = require('../models/mediaReview');
const User = require('../models/user')

mongo.connect();

const compareUsers = (user, other) => {

  // console.log('Comparing', user.email, user.media_reviews.length, other.email, other.media_reviews.length)

  const results = {
    user: other._id,
    match: 0,
  };

  let affinity = 0;
  
  user.media_reviews.forEach(userReview => {

    const found = other.media_reviews.find(otherReview => otherReview.media.equals(userReview.media));
    if (found) {
      results.match += 1;
      if (userReview.feedback === found.feedback) affinity++;
    }
  });

  if (results.match) results.affinity = affinity / results.match;

  // console.log(results);

  return results;
}

const evaluateMedia = async media_id => {
  // try {
  //   const reviews = await MediaReview.find({media: media_id})
  //   const users = [];
  //   reviews.map( async review => {
  //     await User.findOne({_id: review.user._id})
  //     .exec( (err, result) => {
  //       users.push(result)
  //     })
  //   })
  //   console.log(users);
  // } catch(err) {
  //   console.log(err);
  // }
  // console.log('test')

  // async.waterfall([
  //   (callback) => {
  //     MediaReview.find({media: media_id}, (err, result) => {
  //       callback(err, result);
  //     })
  //   },
  //   (reviews, callback) => {
  //     async.parallel(
  //       () => reviews.map( review => {
  //         User.findOne({_id: review.user._id}, 'email', (err, result) => {
  //           callback(err, result);
  //         })
  //       })
  //     )
  //   }
  // ], (err, data) => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   console.log('result:', data);
  // });

  MediaReview.findOne({media: media_id})
  .populate({
    path: 'user',
    select: {'media_reviews': 1},
    populate: {
      path: 'media_reviews',
      model: 'MediaReview'
    }
  })
  .exec( (err, results) => {
    if (err) { console.log(err); }
    // console.log(results);
  })

}

module.exports = { evaluateMedia, compareUsers };

// DEBUG

const debug = async () => {

  // Me 6290ed845cce5b4c0d68a89c
  // Simpsons movie 6290ed815cce5b4c0d689b3a

  try {
    const user = await User.findOne({})
    .populate({
      path: 'media_reviews'
    });

    const reviews = await MediaReview.find({media: '6290ed815cce5b4c0d689b3a'})
    .populate({
      path: 'user',
      select: {'media_reviews': 1},
      populate: {
        path: 'media_reviews',
        model: 'MediaReview'
      }
    });

    const affinityTable = await Promise.all(
      reviews.map( async review => {
        const other = await User.findById(review.user)
        .populate({
          path: 'media_reviews'
        });
        return compareUsers(user, other);
      })
    )

    console.log(affinityTable);
  } catch (err) {
    console.log(err);
  }
  
}

debug();
