const analyticsService = require("./analytics.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");

const analyticsController = {
  getOverview: asyncHandler(async (req, res) => {
    const data = await analyticsService.getOverview(req.query);
    sendSuccess(res, { data });
  }),

  exportReport: asyncHandler(async (req, res) => {
    const data = await analyticsService.exportReport(req.query);
    sendSuccess(res, { data, message: data.message });
  }),
};

module.exports = analyticsController;
