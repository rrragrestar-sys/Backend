import { BookingTask } from "../models/bookingTask.model.js";

export const getTasks = async (req, res) => {
  try {
    // Assuming we want tasks for the current provider
    // This might need joining with Booking
    const tasks = await BookingTask.find().populate({
      path: "bookingId",
      match: { providerId: req.user.id }
    });
    
    // Filter out tasks where booking didn't match the provider
    const filteredTasks = tasks.filter(t => t.bookingId != null);

    res.json({ success: true, tasks: filteredTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { isCompleted } = req.body;
    const task = await BookingTask.findByIdAndUpdate(
      req.params.id,
      { isCompleted },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
