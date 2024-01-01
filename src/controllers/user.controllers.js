import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({
      message: "Message is Ok !!",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
