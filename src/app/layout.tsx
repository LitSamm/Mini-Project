import type { Metadata } from "next";
import ScrollEffects from "@/components/scroll-effects";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anargya ITS — The Next Challenge Awaits",
  description:
    "Anargya ITS Formula EV Team. Discover the team, its journey, and what's next at GIIAS 2027.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <ScrollEffects>{children}</ScrollEffects>
      </body>
    </html>
  );
}
