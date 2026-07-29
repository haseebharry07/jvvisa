const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // keep this server-side only, never expose to frontend
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT, // from ImageKit dashboard, looks like https://ik.imagekit.io/yourid
});

module.exports = imagekit;