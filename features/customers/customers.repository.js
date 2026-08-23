const Customer = require("./customers.model");

const customersRepository = {
  findAll: (filter, { skip, limit, sort }) =>
    Customer.find(filter).sort(sort).skip(skip).limit(limit),
  count: (filter) => Customer.countDocuments(filter),
  findById: (id) => Customer.findById(id),
  findByEmail: (email) => Customer.findOne({ email }),
  create: (data) => Customer.create(data),
  updateById: (id, data) => Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  deleteById: (id) => Customer.findByIdAndDelete(id),
  countActive: () => Customer.countDocuments({ status: "active" }),
  getTopCustomers: (limit = 10) => Customer.find().sort({ totalSpent: -1 }).limit(limit),
};

module.exports = customersRepository;
