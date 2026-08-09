import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  forumPosts,
  forumComments,
  jobs,
  jobInterests,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  posts: many(forumPosts),
  comments: many(forumComments),
  jobInterests: many(jobInterests),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  author: one(users, { fields: [forumPosts.authorId], references: [users.id] }),
  comments: many(forumComments),
}));

export const forumCommentsRelations = relations(forumComments, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumComments.postId],
    references: [forumPosts.id],
  }),
  author: one(users, {
    fields: [forumComments.authorId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ many }) => ({
  interests: many(jobInterests),
}));

export const jobInterestsRelations = relations(jobInterests, ({ one }) => ({
  job: one(jobs, { fields: [jobInterests.jobId], references: [jobs.id] }),
  user: one(users, { fields: [jobInterests.userId], references: [users.id] }),
}));
