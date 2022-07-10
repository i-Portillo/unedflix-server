import User from "../models/user.js";
import Genre from "../models/genre.js";
import Media from "../models/media.js";
import MediaReview from "../models/mediaReview.js";
import MediaSrc from "../models/mediaSrc.js";
import ViewLog from "../models/viewLog.js";

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    console.log('Getting user:', user.email);
    res.send(user);
  } catch(err) {
    console.log(err);
  }
}

export const getUserRole = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    console.log('Getting user role:', user.email);
    res.send(user.role);
  } catch(err) {
    console.log(err);
  }
}

export const getUserGenres = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const genres = [...user.genre_affinity].sort( (a,b) => {
      return b.value - a.value;
    })
    res.send(genres);
  } catch(err) {
    console.log(err);
  }
}

export const getUserList = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }, 'my_list');
    const sortedList = user.my_list.sort( (a,b) => {
      return new Date(b.added) - new Date(a.added);
    });
    const medias = await Promise.all( sortedList.map( async media => {
      const foundMedia = await Media.findOne({ _id: media.media }, 'title poster');
      return foundMedia;
    }));
    res.send(medias);
  } catch(err) {
    console.log(err);
  }
}

export const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    res.send(genres);
  } catch(err) {
    console.log(err);
  }
}

export const getReview = async (req, res) => {
  try {
    const mediaReview = await MediaReview.findOne({ user: req.user.id, media: req.query.media });
    if (mediaReview) {
      console.log(mediaReview.feedback);
      res.send({ found: true, feedback: mediaReview.feedback});
    } else {
      res.send({ found: false });
    }
  } catch(err) {
    console.log(err);
  }
}

export const putReview = async (req, res) => {
  try {
    const mediaReview = await MediaReview.findOne({ user: req.user.id, media: req.body.media });
    if (mediaReview) {
      console.log('Review already exists');
    } else {
      console.log('Adding review');
      const newReview = new MediaReview({
        feedback: req.body.feedback,
        user: req.user.id,
        media: req.body.media,
      })

      newReview.save( (err, review) => {
        if (err) { console.log(err) }
        console.log('Media Review saved.')
      })
    }
  } catch(err) {
    console.log(err);
  }
}

export const getMediaSrc = async (req, res) => {
  try {
    const mediaSrc = await MediaSrc.findOne({ _id: req.params.id });
    res.send(mediaSrc);
  } catch(err) {
    console.log(err);
  }
}

export const getMediaInList = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    .select('my_list');
    if (user.my_list.filter( item => item.media.equals(req.params.id) ).length >= 1 ) {
      res.send(true);
    } else {
      res.send(false);
    }
  } catch(err) {
    console.log(err);
  }
}

export const putMediaInList = async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $addToSet: { 
        my_list: {
          media: req.params.id,
          added: Date.now(),
        }
      }}
    )
  } catch(err) {
    console.log(err);
  }
}

export const deleteMediaFromList = async (req, res) => {
  console.log('trying to delete')
  try {
    await User.updateOne({ _id: req.user.id }, {
      $pull: {
        my_list: { media: req.params.id }
      }
    })
  } catch(err) {
    console.log(err);
  }
}