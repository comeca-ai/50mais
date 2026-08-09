import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  sessions,
  spaces,
  spaceCategories,
  posts,
  comments,
  reactions,
  follows,
  courses,
  modules,
  lessons,
  lessonProgress,
  events,
  eventRsvps,
  messages,
  jobs,
  applications,
  notifications,
  pointsLedger,
  userBadges,
  badges,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  sessions: many(sessions),
  posts: many(posts),
  comments: many(comments),
  applications: many(applications),
  rsvps: many(eventRsvps),
  notifications: many(notifications),
  pontos: many(pointsLedger),
  badges: many(userBadges),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const spaceCategoriesRelations = relations(
  spaceCategories,
  ({ many }) => ({ spaces: many(spaces) }),
);

export const spacesRelations = relations(spaces, ({ one, many }) => ({
  categoria: one(spaceCategories, {
    fields: [spaces.categoriaId],
    references: [spaceCategories.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  space: one(spaces, { fields: [posts.spaceId], references: [spaces.id] }),
  comments: many(comments),
  reactions: many(reactions),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  reactions: many(reactions),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, { fields: [reactions.userId], references: [users.id] }),
  post: one(posts, { fields: [reactions.postId], references: [posts.id] }),
  comment: one(comments, {
    fields: [reactions.commentId],
    references: [comments.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  de: one(users, { fields: [follows.deUserId], references: [users.id] }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  progresso: many(lessonProgress),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  rsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, { fields: [eventRsvps.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRsvps.userId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  de: one(users, { fields: [messages.deUserId], references: [users.id] }),
  para: one(users, { fields: [messages.paraUserId], references: [users.id] }),
}));

export const jobsRelations = relations(jobs, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, { fields: [applications.jobId], references: [jobs.id] }),
  user: one(users, { fields: [applications.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const pointsLedgerRelations = relations(pointsLedger, ({ one }) => ({
  user: one(users, { fields: [pointsLedger.userId], references: [users.id] }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  usuarios: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}));
