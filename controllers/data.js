import User from "../models/user.js"
import Genre from "../models/genre.js"

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    console.log('Getting user:', user.email);
    res.send(user);
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

export const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    res.send(genres);
  } catch(err) {
    console.log(err);
  }
}