import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import {
  lessonsRouter,
  forumRouter,
  jobsRouter,
  companiesRouter,
  profileRouter,
} from "./community-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  lessons: lessonsRouter,
  forum: forumRouter,
  jobs: jobsRouter,
  companies: companiesRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
