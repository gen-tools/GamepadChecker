import "@/global.css";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop"; // <-- IMPORT THE NEW COMPONENT

// Import all your page components
import Index from "@/pages/Index";
import GamepadTester from "@/pages/GamepadTester";
import GpuTester from "@/pages/GpuTester";
import MicTester from "@/pages/MicTester";
import MidiTester from "@/pages/MidiTester";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import Privacy from "@/pages/Privacy";
import GamepadTesterGuide from "@/pages/GamepadTesterGuide";
import GpuTesterGuide from "@/pages/GpuTesterGuide";
import MicTesterGuide from "@/pages/MicTesterGuide";
import MidiTesterGuide from "@/pages/MidiTesterGuide";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="gamepad-tester-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Routes>
              {/* All your routes */}
              <Route path="/" element={<Index />} />
              <Route path="/gamepad-tester" element={<GamepadTester />} />
              {/* ... other routes ... */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);


export default App;
