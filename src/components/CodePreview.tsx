import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Code2, Database, Server } from "lucide-react";

interface CodePreviewProps {
  imageUrl: string;
  prompt: string;
}

const tabs = [
  { id: "frontend", label: "Frontend", icon: Code2 },
  { id: "backend", label: "Backend", icon: Server },
  { id: "database", label: "Database", icon: Database },
] as const;

function getFrontendCode(imageUrl: string): string {
  return `// React Component — Logo.tsx
import React from "react";

export function Logo({ size = 64, className = "" }) {
  return (
    <img
      src="${imageUrl.substring(0, 60)}..."
      alt="Company Logo"
      width={size}
      height={size}
      className={\`object-contain \${className}\`}
      loading="lazy"
    />
  );
}

// Usage in your app:
// <Logo size={48} className="rounded-lg" />
// <Logo size={128} /> {/* Hero section */}`;
}

function getBackendCode(): string {
  return `// Express.js — routes/logo.ts
import express from "express";
import multer from "multer";
import sharp from "sharp";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload logo endpoint
router.post("/api/logo/upload", upload.single("logo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Resize for different use cases
  const sizes = [32, 64, 128, 256, 512];
  const variants = await Promise.all(
    sizes.map(async (size) => {
      const buffer = await sharp(req.file!.buffer)
        .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer();
      return { size, buffer: buffer.toString("base64") };
    })
  );

  res.json({ variants, originalSize: req.file.size });
});

// Serve logo by size
router.get("/api/logo/:size", async (req, res) => {
  const size = parseInt(req.params.size);
  const logo = await db.logos.findFirst({
    where: { size },
    orderBy: { createdAt: "desc" },
  });
  if (!logo) return res.status(404).json({ error: "Logo not found" });
  
  res.set("Content-Type", "image/png");
  res.set("Cache-Control", "public, max-age=31536000");
  res.send(Buffer.from(logo.data, "base64"));
});

export default router;`;
}

function getDatabaseCode(): string {
  return `-- PostgreSQL Schema for Logo Storage

CREATE TABLE logos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  prompt      TEXT,
  style       VARCHAR(50) NOT NULL DEFAULT 'minimal',
  mime_type   VARCHAR(50) NOT NULL DEFAULT 'image/png',
  file_size   INTEGER NOT NULL,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  data        TEXT NOT NULL,  -- base64 encoded
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE logo_variants (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_id   UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
  size      INTEGER NOT NULL,
  data      TEXT NOT NULL,
  UNIQUE(logo_id, size)
);

-- Index for fast lookups
CREATE INDEX idx_logos_created ON logos(created_at DESC);
CREATE INDEX idx_variants_logo ON logo_variants(logo_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER logos_updated
  BEFORE UPDATE ON logos
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();`;
}

export function CodePreview({ imageUrl, prompt }: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("frontend");
  const [copied, setCopied] = useState(false);

  const codeMap = {
    frontend: getFrontendCode(imageUrl),
    backend: getBackendCode(),
    database: getDatabaseCode(),
  };

  const code = codeMap[activeTab];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border px-4">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code Block */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed font-[family-name:var(--font-mono)]">
          <code className="text-surface-foreground">{code}</code>
        </pre>
      </div>
    </motion.div>
  );
}
