const User = require('../models/userModel');
const catcchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const catchAsync = require('../utilities/catchAsync');

const filterObj = (obj, ...alowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (alowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catcchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ status: 'success', results: users.length, data: { users } });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1)Create error if user Posts password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update.Please use /updateMyPassword.', 400));
  }
  //2)filtered out unwanted fields name that are not allowed to be updated
  const filterdBody = filterObj(req.body, 'name', 'email');
  // 3)Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, { new: true, runValidators: true });
  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'This route controller/ handler is not built yet.comming soon..' });
};

exports.createUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'This route controller/ handler is not built yet.comming soon..' });
};
exports.updateUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'This route controller/ handler is not built yet.comming soon..' });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'This route controller/ handler is not built yet.comming soon..' });
};
