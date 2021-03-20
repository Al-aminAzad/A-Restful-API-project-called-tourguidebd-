const express = require('express');
const app = express();
const morgan = require('morgan');

const fs = require('fs');

//1) MIDDLEWARE START
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
  console.log('Hello from middleware');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
// END OF MIDDLEWARE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//ROUTES HANDLER/CONTROLLERS
const getAllTours = (req, res) => {
  // console.log(req.requestTime);
  res.status(200).json({ status: 'success', requesttedAt: req.requestTime, results: tours.length, data: { tours } });
};

const getTour = (req, res) => {
  // console.log(req.params);
  const id = req.params.id * 1;
  // console.log(id);
  const tour = tours.find((el) => el.id === id);
  //if id>tours.length
  if (!tour) {
    return res.status(404).json({ status: 'failed', message: 'Invalid Id' });
  }
  res.status(200).json({ status: 'success', data: { tour } });
};
const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    res.status(201).json({ status: 'success', data: newTour });
  });
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'failed', message: 'Invalid Id' });
  }
  res.status(200).json({ status: 'success', data: { tour: 'updated tour here..' } });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'failed', message: 'Invalid Id' });
  }
  res.status(204).json({ status: 'success', data: null });
};

const getAllUsers = (req, res) => {
  res.status(500).json({ status: 'error', message: 'This route controller/ handler is not built yet.comming soon..' });
};
const getUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'This route controller/ handler is not built yet.comming soon..' });
};

const createUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'This route controller/ handler is not built yet.comming soon..' });
};
const updateUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'This route controller/ handler is not built yet.comming soon..' });
};
const deleteUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'This route controller/ handler is not built yet.comming soon..' });
};

//END OF ROUTES HANDLER/CONTROLLERS

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//ROUTES
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);
app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser);

//END OF ROUTES

//SERVER START
const port = 3000;
app.listen(port, () => {
  console.log(`listening port on ${port}`);
});
