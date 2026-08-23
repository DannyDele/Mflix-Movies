const AppError = require("../../shared/utils/AppError");
const { parsePagination, buildMeta } = require("../../shared/utils/pagination");
const customersRepository = require("./customers.repository");
const Order = require("../orders/orders.model");
const { CUSTOMER_STATUS } = require("./customers.constants");

const buildCustomerFilter = (query) => {
  const filter = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.status) filter.status = query.status;
  return filter;
};

const customersService = {
  async list(query) {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter = buildCustomerFilter(query);
    const [items, total] = await Promise.all([
      customersRepository.findAll(filter, { skip, limit, sort }),
      customersRepository.count(filter),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },

  async getById(id) {
    const customer = await customersRepository.findById(id);
    if (!customer) throw new AppError("Customer not found", 404);
    return customer;
  },

  async getDetails(id) {
    const customer = await this.getById(id);
    const orders = await Order.find({ customerId: id }).sort({ createdAt: -1 });
    const refunds = orders.filter((o) => o.refundAmount > 0).map((o) => ({
      orderId: o._id,
      orderNumber: o.orderNumber,
      amount: o.refundAmount,
      date: o.updatedAt,
    }));
    return { customer, orders, refunds };
  },

  async create(data) {
    const existing = await customersRepository.findByEmail(data.email);
    if (existing) throw new AppError("Customer email already exists", 409);
    return customersRepository.create(data);
  },

  async update(id, data) {
    const customer = await customersRepository.updateById(id, data);
    if (!customer) throw new AppError("Customer not found", 404);
    return customer;
  },

  async toggleBlock(id, blocked) {
    const status = blocked ? CUSTOMER_STATUS.BLOCKED : CUSTOMER_STATUS.ACTIVE;
    return this.update(id, { status });
  },

  async addNote(id, { note }, adminName = "admin") {
    const customer = await customersRepository.findById(id);
    if (!customer) throw new AppError("Customer not found", 404);
    customer.notes.push({ note, by: adminName });
    await customer.save();
    return customer;
  },

  async remove(id) {
    const customer = await customersRepository.deleteById(id);
    if (!customer) throw new AppError("Customer not found", 404);
    return { message: "Customer deleted" };
  },
};

module.exports = customersService;
