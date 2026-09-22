import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { deleteSiteContent, deleteSiteMedia, insertSiteMedia, listPageContent, listSiteContent, listSiteMedia, upsertSiteContent } from "./db";
import { storagePut } from "./storage";

const contentInput = z.object({ id: z.number().optional(), page: z.string().min(1).max(80), section: z.string().min(1).max(120), content: z.string().min(1), sortOrder: z.number().int().min(0).max(9999).optional() });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  content: router({
    list: publicProcedure.query(() => listSiteContent()),
    page: publicProcedure.input(z.object({ page: z.string() })).query(({ input }) => listPageContent(input.page)),
    adminList: adminProcedure.query(() => listSiteContent()),
    upsert: adminProcedure.input(contentInput).mutation(({ input, ctx }) => upsertSiteContent({ ...input, updatedBy: ctx.user.id })),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteSiteContent(input.id)),
  }),
  media: router({
    list: publicProcedure.query(() => listSiteMedia()),
    adminList: adminProcedure.query(() => listSiteMedia()),
    upload: adminProcedure.input(z.object({ name: z.string().min(1).max(255), mimeType: z.string().min(1), base64: z.string().min(1) })).mutation(async ({ input, ctx }) => { const data = Buffer.from(input.base64.replace(/^data:[^;]+;base64,/, ""), "base64"); const uploaded = await storagePut(`clyx-media/${Date.now()}-${input.name}`, data, input.mimeType); const id = await insertSiteMedia({ name: input.name, url: uploaded.url, fileKey: uploaded.key, mimeType: input.mimeType, updatedBy: ctx.user.id }); return { id, ...uploaded }; }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteSiteMedia(input.id)),
  }),
});
export type AppRouter = typeof appRouter;
