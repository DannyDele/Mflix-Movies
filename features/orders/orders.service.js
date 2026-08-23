const AppError = require("../../shared/utils/AppError");
const { parsePagination, buildMeta } = require("../../shared/utils/pagination");
const { PAYMENT_STATUS, FULFILLMENT_STATUS } = require("../../shared/constants/orderStatus");
const ordersRepository = require("./orders.repository");

const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
};

const buildOrderFilter = (query) => {
  const filter = {};

  if (query.search) {
    filter.$or = [
      { orderNumber: { $regex: query.search, $options: "i" } },
      { customerName: { $regex: query.search, $options: "i" } },
      { customerEmail: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.fulfillmentStatus) filter.fulfillmentStatus = query.fulfillmentStatus;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
  }

  return filter;
};

const ordersService = {
  async list(query) {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter = buildOrderFilter(query);
    const [items, total] = await Promise.all([
      ordersRepository.findAll(filter, { skip, limit, sort }),
      ordersRepository.count(filter),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },

  async getById(id) {
    const order = await ordersRepository.findById(id);
    if (!order) throw new AppError("Order not found", 404);
    return order;
  },

  async create(data) {
    const itemCount = data.items.reduce((sum, i) => sum + i.quantity, 0);
    const orderNumber = generateOrderNumber();

    return ordersRepository.create({
      ...data,
      orderNumber,
      itemCount,
      timeline: [{ action: "Order placed", by: "system" }],
    });
  },

  async updateStatus(id, { fulfillmentStatus, paymentStatus, note }, adminName = "admin") {
    const order = await ordersRepository.findById(id);
    if (!order) throw new AppError("Order not found", 404);

    const updates = {};
    const timelineEntry = { by: adminName };

    if (fulfillmentStatus) {
      updates.fulfillmentStatus = fulfillmentStatus;
      timelineEntry.action = `Fulfillment status changed to ${fulfillmentStatus}`;
    }
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
      timelineEntry.action = timelineEntry.action
        ? `${timelineEntry.action}; payment ${paymentStatus}`
        : `Payment status changed to ${paymentStatus}`;
    }
    if (note) timelineEntry.note = note;

    order.timeline.push(timelineEntry);
    Object.assign(order, updates);
    await order.save();
    return order;
  },

  async addNote(id, { note }, adminName = "admin") {
    const order = await ordersRepository.findById(id);
    if (!order) throw new AppError("Order not found", 404);
    order.internalNotes.push({ note, by: adminName });
    await order.save();
    return order;
  },

  async issueRefund(id, { amount, reason }, adminName = "admin") {
    const order = await ordersRepository.findById(id);
    if (!order) throw new AppError("Order not found", 404);

    const refundAmount = amount ?? order.total;
    if (refundAmount > order.total - order.refundAmount) {
      throw new AppError("Refund amount exceeds remaining balance", 400);
    }

    order.refundAmount += refundAmount;
    order.paymentStatus =
      order.refundAmount >= order.total ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PARTIALLY_REFUNDED;
    order.fulfillmentStatus =
      order.refundAmount >= order.total ? FULFILLMENT_STATUS.REFUNDED : order.fulfillmentStatus;
    order.timeline.push({ action: `Refund issued: $${refundAmount}`, note: reason || "", by: adminName });
    await order.save();
    return order;
  },

  async bulkAction(ids, action) {
    if (action === "mark_shipped") {
      await ordersRepository.bulkUpdateFulfillment(ids, FULFILLMENT_STATUS.SHIPPED);
      return { message: `${ids.length} orders marked as shipped` };
    }
    if (action === "cancel") {
      await ordersRepository.bulkUpdateFulfillment(ids, FULFILLMENT_STATUS.CANCELLED);
      return { message: `${ids.length} orders cancelled` };
    }
    throw new AppError("Unknown bulk action", 400);
  },

  async remove(id) {
    const order = await ordersRepository.deleteById(id);
    if (!order) throw new AppError("Order not found", 404);
    return { message: "Order deleted" };
  },
};

module.exports = ordersService;
