import { createTRPCReact } from "@trpc/react-query";

// Backend lives in a separate service now, so no shared router type is
// available here for compile-time procedure checking.
export const trpc = createTRPCReact<any>();
