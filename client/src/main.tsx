import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App";
import { primeFirstPage } from "./lib/siteContent";
import NotFound from "./pages/NotFound";
import "./index.css";

// Temporary: every address on the site, /admin included, shows the 404 page. Set to false to bring the site back.
const SITE_OFFLINE = true;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Query Error]", event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Mutation Error]", event.mutation.state.error);
  }
});

// The first page's content starts downloading now, in parallel with the page's code.
if (!SITE_OFFLINE) primeFirstPage(queryClient);

// The tRPC client (and superjson) is only needed by the admin panel, so it is created in admin/AdminApp.tsx
// and downloaded with that page instead of with every visitor's first page load.
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {SITE_OFFLINE ? <NotFound showHomeButton={false} /> : <App />}
  </QueryClientProvider>
);
