import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Price per kg is required'],
    min: [0, 'Price cannot be negative']
  },
  regionCode: {
    type: String,
    required: [true, 'Region code is required'],
    trim: true,
    index: true,
    default: 'IN-DL' // Default to Delhi
  },
  effectiveDate: {
    type: Date,
    required: [true, 'Effective date is required'],
    default: Date.now,
    index: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
priceSchema.index({ category: 1, regionCode: 1, effectiveDate: -1, isActive: 1 });
priceSchema.index({ regionCode: 1, isActive: 1 });

// Get current active price for a category and region
priceSchema.statics.getCurrentPrice = async function(category, regionCode = 'IN-DL') {
  const price = await this.findOne({
    category,
    regionCode,
    isActive: true,
    effectiveDate: { $lte: new Date() }
  }).sort({ effectiveDate: -1 });

  return price;
};

// Get all active prices for a region
priceSchema.statics.getActivePrices = async function(regionCode = 'IN-DL') {
  const prices = await this.find({
    regionCode,
    isActive: true,
    effectiveDate: { $lte: new Date() }
  }).sort({ category: 1, effectiveDate: -1 });

  // Get the latest price for each category
  const priceMap = new Map();
  prices.forEach(price => {
    if (!priceMap.has(price.category)) {
      priceMap.set(price.category, price);
    }
  });

  return Array.from(priceMap.values());
};

const Price = mongoose.model('Price', priceSchema);

export default Price;

