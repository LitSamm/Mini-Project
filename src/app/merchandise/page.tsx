import type { Metadata } from "next";
import MerchandiseExperience from "@/components/merchandise-experience";

export const metadata: Metadata = {
  title: "Merchandise — Anargya ITS",
  description: "Explore the Anargya ITS Formula EV Team merchandise catalogue.",
};

export default function MerchandisePage() {
  return <MerchandiseExperience />;
}
