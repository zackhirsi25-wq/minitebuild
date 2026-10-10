import { Onest } from "next/font/google";
import { THEME_SCRIPT } from "@/components/site-shell/theme-toggle";

// Full-screen pages with their own top bar instead of the site nav (template
// preview). Same tokens and font as the rest of the Minitebuild site.

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });

export default function PreviewLayout({ children }: LayoutProps<"/">) {
  return (
    // THEME_SCRIPT may switch data-theme before hydration, hence suppressHydrationWarning.
    <div className={`mb ${onest.variable} flex h-dvh flex-col`} data-theme="dark" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      {children}
    </div>
  );
}
