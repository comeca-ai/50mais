import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import {
  lessonsRouter,
  forumRouter,
  jobsRouter,
  companiesRouter,
  profileRouter,
} from "./community-router";
import {
  spacesRouter,
  progressRouter,
  eventsRouter,
  membersRouter,
  gamificationRouter,
  messagesRouter,
} from "./community2-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  lessons: lessonsRouter,
  forum: forumRouter,
  jobs: jobsRouter,
  companies: companiesRouter,
  profile: profileRouter,
  spaces: spacesRouter,
  progress: progressRouter,
  events: eventsRouter,
  members: membersRouter,
  gamification: gamificationRouter,
  messages: messagesRouter,
});

export type AppRouter = typeof appRouter;
