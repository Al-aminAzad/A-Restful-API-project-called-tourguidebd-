const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utilities/appError');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const Email = require('../utilities/email');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  //this removes password output from client only
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check email and password exists
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }
  // 2) check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('email or password is not correct', 401));
  }
  // 3)if everything is ok, send token to the client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};
exports.protect = catchAsync(async (req, res, next) => {
  // 1)getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get accsess!', 401));
  }
  // 2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3) check if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist!', 401));
  }
  // 4)check if user change password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password recently changed.Please login again', 401));
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
//Only for rendered pages, and no errors
exports.isLoggedIn = async (req, res, next) => {
  // 1)getting token and check if it's there
  if (req.cookies.jwt) {
    try {
      // 2) verification token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      //3) check if user still exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // 4)check if user change password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      //There is a loggedin user
      res.locals.user = currentUser; // every render page can access user variavle
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles['adfmin','lead-guide]-Rest operator| role='user'
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this operation', 403));
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1)get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email!', 404));
  }
  //2)generate random token
  const resetToken = user.createPasswordresetToken();
  await user.save({ validateBeforeSave: false });
  // 3) send it to user's email
  // const message = `Forgot your password? Submit a patch request with you new password and passwordConfirm to:${resetURL}.\nIf you didn't forget your password then ignore this email`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your reset password token (valid only 10 min)',
    //   message,
    // });
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There is an error sending the email.Please try again later', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1)Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
  //2)If token is not expired and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3)Update changePasswordAt property for the user
  //4)log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1)Get the user from collection
  const user = await User.findById(req.user.id).select('+password');
  // 2)check if posted current password is coreect
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Password is incorrect.Please try again', 401));
  }
  // 3)if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4)log user in,send JWT
  createSendToken(user, 200, res);
});
