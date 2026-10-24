import { BottomNav } from "@/components/bottom-nav";
import { getRepository } from "@/lib/db/repository";
import { LaunchView } from "./launch-view";

export const metadata = {
  title: "Stage 2: Launch Checklist Preview — GrowBox",
};

export default async function LaunchPreviewPage() {
  const repo = getRepository();
  const knowledgeChunks = await repo.getKnowledgeChunks();

  return (
    <div>
      <LaunchView knowledgeChunks={knowledgeChunks} />
      <BottomNav />
    </div>
  );
}
