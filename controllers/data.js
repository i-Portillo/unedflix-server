import User from "../models/user.js"

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    console.log('Getting user:', user.email);
    res.send(user);
  } catch(err) {
    console.log(err);
  }
}