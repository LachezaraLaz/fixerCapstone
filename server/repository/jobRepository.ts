import { IJob, Jobs } from "../model/job";

// Fetch jobs for a specific user by email
const getJobsByUserEmail = async (userEmail: string) => {
  try {
    return await Jobs.find({ userEmail });
  } catch (error) {
    throw new Error("Failed to fetch jobs for user");
  }
};

// Fetch a job by its ID
// const getJobByIdRepo = async (input) => {
//     try {
//         const jobId = input?.params?.jobId || input;
//         return await Jobs.findById(jobId);
//     } catch (error) {
//         throw new Error('Failed to fetch job by ID');
//     }
// };

const getJobByIdRepo = async (jobId: string) => {
  try {
    return await Jobs.findById(jobId);
  } catch (error) {
    throw new Error("Failed to fetch job by ID");
  }
};

// Update job status (Reopen job)
const updateJobStatus = async (jobId: string, status: string) => {
  try {
    return await Jobs.findByIdAndUpdate(jobId, { status }, { new: true });
  } catch (error) {
    throw new Error("Failed to update job status");
  }
};

// Update job details
const updateJob = async (jobId: string, updateData: IJob) => {
  try {
    return await Jobs.findByIdAndUpdate(jobId, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    throw new Error("Failed to update job");
  }
};

module.exports = {
  getJobsByUserEmail,
  getJobByIdRepo,
  updateJobStatus,
  updateJob,
};
