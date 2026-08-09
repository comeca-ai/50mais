import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  spaces,
  forumPosts,
  forumComments,
  jobs,
  jobInterests,
  events,
  eventRsvps,
  messages,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  posts: many(forumPosts),
  comments: many(forumComments),
  jobInterests: many(jobInterests),
  rsvps: many(eventRsvps),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  author: one(users, { fields: [forumPosts.authorId], references: [users.id] }),
  space: one(spaces, {
    fields: [forumPosts.spaceId],
    references: [spaces.id],
  }),
  comments: many(forumComments),
}));

export const spacesRelations = relations(spaces, ({ many }) => ({
  posts: many(forumPosts),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  rsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
  user: one(users, { fields: [eventRsvps.userId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  de: one(users, { fields: [messages.deUserId], references: [users.id] }),
  para: one(users, { fields: [messages.paraUserId], references: [users.id] }),
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
