const sendSuccess = (res, { data = null, message = "Success", meta = null, status = 200 }) => {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
};

const sendError = (res, message, status = 500) => {
  return res.status(status).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
