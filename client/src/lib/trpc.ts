import { createTRPCReact } from "@trpc/react-query";

// Backend lives in a separate service (clyx-media-backend), so its router type is not
// available here. Procedures are untyped; the backend validates every input with zod.
export const trpc = createTRPCReact<any>() as any;
