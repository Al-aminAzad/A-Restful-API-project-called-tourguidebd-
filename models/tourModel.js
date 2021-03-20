const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name can not be more than 40 carectares'],
      minlength: [10, 'A tour must be more than 10 carecters'],
      // validate: [validator.isAlpha, 'Tour name must contain letters'],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be avobe 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty level could be either easy,medium or diffcult',
      },
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current documents on new creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be less than regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secrateTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', function (next) {
//   console.log('Document will save ....');
//   next();
// });
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });
//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secrateTour: { $ne: true } });
  // this.start = Date.now();
  next();
});
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`This query took ${Date.now() - this.start} miliseconds`);
//   next();
// });

//Aggregate MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secrateTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
