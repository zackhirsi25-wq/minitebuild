import { Onest } from "next/font/google";

// Full-screen pages with their own top bar instead of the site nav (template
// preview). Same tokens and font as the rest of the Minitebuild site.

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });

export default function PreviewLayout({ children }: LayoutProps<"/">) {
  return <div className={`mb ${onest.variable} flex h-dvh flex-col`}>{children}</div>;
}
