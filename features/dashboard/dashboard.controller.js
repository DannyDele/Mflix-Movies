const dashboardService = require("./dashboard.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");

const dashboardController = {
  getOverview: asyncHandler(async (req, res) => {
    const data = await dashboardService.getOverview(req.query);
    sendSuccess(res, { data });
  }),
};

module.exports = dashboardController;
