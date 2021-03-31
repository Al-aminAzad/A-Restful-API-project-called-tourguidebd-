const catchAsync = require('../utilities/catchAsync');
const ApiFeatures = require('../utilities/apiFeatures');
const AppError = require('../utilities/appError');
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with this ID', 404));
    res.status(204).json({ status: 'success', data: null });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError('No document found with this ID', 404));
    res.status(200).json({ status: 'success', data: { data: doc } });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // const newTour = new Tour({ name: 'The Forest Hiker' });
    // newTour.save().then().catch()
    const doc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: { data: doc } });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    // doc.findOne({_id:req.params.id})
    if (!doc) return next(new AppError('No document found with this ID', 404));
    res.status(200).json({ status: 'success', data: { data: doc } });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //allow nested GET review on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //execute query
    const features = new ApiFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;
    res.status(200).json({ status: 'success', results: doc.length, data: { data: doc } });
  });
