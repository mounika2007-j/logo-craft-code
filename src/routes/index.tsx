import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { LogoGenerator } from "@/components/LogoGenerator";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "LogoForge — AI Logo Generator" },
      { name: "description", content: "Generate stunning logos with AI. Get production-ready code for frontend, backend, and database integration." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background bg-grid relative">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">LogoForge</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">AI-Powered</span>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-16 pb-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="gradient-text">Generate logos</span>
              <br />
              <span className="text-foreground">in seconds</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Describe your vision, pick a style, and get a production-ready logo with code snippets for your stack.
            </p>
          </motion.div>
        </section>

        {/* Generator */}
        <section className="pb-20">
          <LogoGenerator />
        </section>
      </div>
    </div>
  );
}
