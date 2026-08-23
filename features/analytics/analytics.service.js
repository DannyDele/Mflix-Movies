const analyticsRepository = require("./analytics.repository");
const { DATE_RANGES } = require("./analytics.constants");

const getDateRange = (range, startDate, endDate) => {
  const end = endDate ? new Date(endDate) : new Date();
  let start;

  if (range === DATE_RANGES.CUSTOM && startDate) {
    start = new Date(startDate);
  } else {
    start = new Date(end);
    const days = range === DATE_RANGES.NINETY_DAYS ? 90 : range === DATE_RANGES.THIRTY_DAYS ? 30 : 7;
    start.setDate(start.getDate() - days);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const analyticsService = {
  async getOverview(query) {
    const { start, end } = getDateRange(query.range || "30d", query.startDate, query.endDate);

    const [revenueTrend, salesByChannel, topProducts, worstProducts, topCustomers, stats] =
      await Promise.all([
        analyticsRepository.revenueByDate(start, end),
        analyticsRepository.salesByChannel(),
        analyticsRepository.topProducts(10),
        analyticsRepository.worstProducts(10),
        analyticsRepository.topCustomers(10),
        analyticsRepository.orderStats(start, end),
      ]);

    const orderStats = stats[0] || { totalOrders: 0, totalRevenue: 0, cancelled: 0, refunded: 0 };
    const conversionRate =
      orderStats.totalOrders > 0
        ? (((orderStats.totalOrders - orderStats.cancelled) / orderStats.totalOrders) * 100).toFixed(1)
        : 0;

    // Mock cart abandonment — would come from analytics tracking in production
    const cartAbandonmentRate = 68.5;

    return {
      dateRange: { start, end },
      revenueTrend,
      salesByChannel,
      topProducts,
      worstProducts,
      topCustomers,
      cartAbandonmentRate,
      summary: { ...orderStats, conversionRate: Number(conversionRate) },
    };
  },

  async exportReport(query) {
    const data = await this.getOverview(query);
    return {
      format: query.format || "csv",
      generatedAt: new Date().toISOString(),
      data,
      message: "Report generated — download ready (mock export)",
    };
  },
};

module.exports = analyticsService;
