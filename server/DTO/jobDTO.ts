import { IJob } from "../model/job";

// Job DTO to format the response
export const jobDTO = (job: IJob) => ({
  id: job._id,
  title: job.title,
  description: job.description,
  professionalNeeded: job.professionalNeeded,
  status: job.status,
  createdAt: job.createdAt,
  imageUrl: job.imageUrl || "https://via.placeholder.com/150",
  latitude: job.latitude || 0.0,
  longitude: job.longitude || 0.0,
  rating: job.rating,
  comment: job.comment,
  professionalEmail: job.professionalEmail,
  timeline: job.timeline,
  acceptedQuoteId: job.acceptedQuoteId,
});
