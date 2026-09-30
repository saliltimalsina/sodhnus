import { AskDock } from "@/components/ask-dock";
import { AskProvider } from "@/components/ask-provider";
import { ComingSoon } from "@/components/coming-soon";
import { FeatureRows } from "@/components/features/feature-rows";
import { Hero } from "@/components/hero";
import { ManyOffices } from "@/components/many-offices";
import { Manifesto } from "@/components/manifesto";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <AskProvider>
      <div id="top">
        <SiteHeader />
        <main>
          <Hero />
          <Manifesto />
          <FeatureRows />
          <ManyOffices />
          <ComingSoon />
        </main>
        <SiteFooter />
        <AskDock />
      </div>
    </AskProvider>
  );
}
