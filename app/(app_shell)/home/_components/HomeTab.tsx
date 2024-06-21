"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { genresData } from "@/lib/data/genresData";
import { useQueryState } from "nuqs";

export default function HomeTab() {
  const [tab, setTab] = useQueryState("tab", { history: "push" });

  return (
    <Tabs
      value={tab ?? "all"}
      onValueChange={setTab}
      className="flex w-full justify-center"
    >
      <TabsList className="mx-2 my-0 inline-table text-center lg:my-2 2xl:mx-0">
        <TabsTrigger value="all">
          <div className="flex items-center">
            <span className="mr-1 text-xl">📚</span>All
          </div>
        </TabsTrigger>
        {genresData.map((g) => (
          <TabsTrigger key={g.name} value={g.name}>
            <div className="flex items-center">
              <span className="mr-1 text-xl">{g.emoji}</span> {g.name}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
