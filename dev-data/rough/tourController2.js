const Tour = require('../models/tourModel');

//ROUTES HANDLER/CONTROLLERS
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
};
exports.getAllTours = async (req, res) => {
  try {
    //building query
    //1A)filtering
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);
    // console.log(req.query, queryObj);
    //1B)Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte)|(gt)|(lte)|(lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));
    let query = Tour.find(JSON.parse(queryStr));
    // const query = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
    //2)sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      // console.log(sortBy);
      query = query.sort(sortBy);
      //sort('price ratingsAverage')
    } else {
      query = query.sort('-createdAt');
    }

    //3)fields limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //pagination and limiting

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numOfTours = await Tour.countDocuments();
      if (skip >= numOfTours) throw new Error('Page does not exist');
    }

    //execute query
    const tours = await query;
    //query.sort().select().skip().limit()
    res.status(200).json({ status: 'success', results: tours.length, data: { tours } });
  } catch (err) {
    res.status(404).json({ status: 'Not found', message: err });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id:req.params.id})
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(404).json({ status: 'Not found', message: err });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({ name: 'The Forest Hiker' });
    // newTour.save().then().catch()
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { newTour } });
  } catch (err) {
    res.status(400).json({ status: 'failed', message: 'Invalid data sent' });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(400).json({ status: 'failed', message: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({ status: 'failed', message: err });
  }
};
