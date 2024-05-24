
var bodyParser = require('body-parser');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path')
const methodOverride = require('method-override');
const cors = require('cors');  // Import cors


const PORT = 8080;

// route imports
const productRoute = require('./routes/Product/productRoute');
const collectionRoute = require('./routes/Collection/collectionRoute');






app.set('view engine', 'ejs');
app.use(express.static('public'))
app.set('views', path.join(__dirname, '/views'));

//set up bodyparser
app.use(bodyParser.urlencoded({extended: true})) 
app.use(bodyParser.json()) 
app.use(express.json());
app.use(methodOverride('_method'));


// Enable CORS
app.use(cors());


// LOCAL_CONN_STR
async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mono');
    console.log('MongoDB database Connection Established Successfully!!');
  } catch (error) {
    console.error('MongoDB database Connection Failed:', error);
  }
}

// Call the function to establish the connection
connectToDatabase();



// app.use('/', (req, res) => {
//     res.send('MaryDivine Server Started!!')
// })


// routes
app.use('/', productRoute);
app.use('/', collectionRoute)






// Error Handle Middleware
app.use((err, req, res, next) => {
  const { message = 'something went wrong', status = 500 } = err;
  res.status(status).send({ msg: message });
  console.log(err)
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT} `)
})