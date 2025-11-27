let IS_PROD = true;


const server = IS_PROD ?
     "http://localhost:8000":
     "https://videoconfrencing-joinfy.onrender.com"

export default server;