import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Download, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { generateLogo } from "@/utils/logo.functions";
import { CodePreview } from "@/components/CodePreview";

const styles = [
  { id: "minimal" as const, label: "Minimal", emoji: "◯" },
  { id: "bold" as const, label: "Bold", emoji: "■" },
  { id: "vintage" as const, label: "Vintage", emoji: "✦" },
  { id: "futuristic" as const, label: "Futuristic", emoji: "◇" },
  { id: "organic" as const, label: "Organic", emoji: "❋" },
];

export function LogoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<(typeof styles)[number]["id"]>("minimal");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLogoFn = useServerFn(generateLogo);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const result = await generateLogoFn({ data: { prompt: prompt.trim(), style } });
      if (result.error) {
        setError(result.error);
      } else {
        setImageUrl(result.imageUrl);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `logo-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Generator Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-border bg-card p-6 md:p-8"
      >
        {/* Prompt Input */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Describe your logo
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A phoenix rising from flames for a tech startup called Nova..."
            className="w-full h-28 rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-[family-name:var(--font-display)]"
            maxLength={500}
          />
        </div>

        {/* Style Selector */}
        <div className="mt-6 space-y-3">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Style
          </label>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  style === s.id
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <span className="mr-1.5">{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8">
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-xl glow-primary"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Generating your logo...
              </>
            ) : (
              <>
                <Wand2 />
                Generate Logo
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Result Section */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive"
          >
            {error}
          </motion.div>
        )}

        {imageUrl && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 space-y-8"
          >
            {/* Logo Preview */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Your Logo</h2>
                </div>
                <Button onClick={handleDownload} variant="secondary" size="sm">
                  <Download className="w-4 h-4" />
                  Download PNG
                </Button>
              </div>
              <div className="flex justify-center rounded-xl bg-background p-8 border border-border">
                <img
                  src={imageUrl}
                  alt="Generated logo"
                  className="max-w-sm w-full h-auto rounded-lg"
                />
              </div>
            </div>

            {/* Code Previews */}
            <CodePreview imageUrl={imageUrl} prompt={prompt} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
