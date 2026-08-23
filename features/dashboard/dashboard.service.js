const ordersRepository = require("../orders/orders.repository");
const productsRepository = require("../products/products.repository");
const customersRepository = require("../customers/customers.repository");

const getDateRange = (range = "30d") => {
  const end = new Date();
  const start = new Date();
  const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const dashboardService = {
  async getOverview(query) {
    const { start, end } = getDateRange(query.range || "30d");

    const [
      revenueTrend,
      ordersToday,
      activeCustomers,
      pendingOrders,
      refundsResult,
      recentOrders,
      topProducts,
      lowStock,
      salesByCategory,
    ] = await Promise.all([
      ordersRepository.aggregateRevenue(start, end),
      ordersRepository.countToday(),
      customersRepository.countActive(),
      ordersRepository.countByStatus("fulfillmentStatus", "pending"),
      ordersRepository.sumRefunds(),
      ordersRepository.getRecent(8),
      productsRepository.getTopSelling(5),
      productsRepository.getLowStock(10),
      productsRepository.aggregateByCategory(),
    ]);

    const totalRevenue = revenueTrend.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = revenueTrend.reduce((sum, d) => sum + d.orders, 0);
    const refunds = refundsResult[0]?.total || 0;
    const conversionRate = totalOrders > 0 ? ((totalOrders / (totalOrders + 50)) * 100).toFixed(1) : 0;

    return {
      kpis: {
        totalRevenue,
        ordersToday,
        activeCustomers,
        pendingOrders,
        refunds,
        conversionRate: Number(conversionRate),
      },
      revenueTrend,
      recentOrders,
      topProducts,
      lowStockAlerts: lowStock,
      salesByCategory,
    };
  },
};

module.exports = dashboardService;
