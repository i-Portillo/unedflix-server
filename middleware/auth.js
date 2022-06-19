import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    let decodedData;

    if(token) {
      console.log('Valid token');
      decodedData = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decodedData?.id;
    } else {
      console.log('NOT valid token');
      return res.status(403).json({ error: 'Not valid token provided.' });
    }

    next();

  } catch(err) {
    console.log(err);
  }
}

export default auth;