import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {RouterProvider} from "react-router-dom";
import {router} from "./router.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "@/components/ui/toaster";
import {ThemeProvider} from "@/components/theme-provider";
import {AclProvider} from "@/auth/AclProvider.tsx";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import "react-photo-view/dist/react-photo-view.css";
import {initBrand} from "@/lib/brand";

// Initialize brand-specific favicon and title
initBrand();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        <TooltipProvider>
          <AclProvider>
            <RouterProvider router={router} />
          </AclProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
