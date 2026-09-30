import Image from "next/image";
import type { ReactNode } from "react";
import abroad from "@/public/photos/abroad.jpg";
import education from "@/public/photos/education.jpg";
import { icons } from "./icons";

const FEATURES = [
  "Find Lok Sewa vacancies matched to your qualifications.",
  "Book a passport visit and get a reminder of what to bring.",
  "Follow a land transfer (namsari) step by step.",
  "Draft a ward recommendation letter to take to your ward.",
  "Renew your family’s health insurance.",
  "Track everything you need before working abroad.",
  "Check SEE results.",
];

export function ComingSoon() {
  const screens = [<LokSewa key="a" />, <Passport key="b" />, <Land key="c" />, <Sifaris key="d" />, <Health key="e" />, <Abroad key="f" />, <Results key="g" />];

  return (
    <section className="overflow-hidden bg-[linear-gradient(#fff,#f3f6fb_30%,#f3f6fb_70%,#fff)] py-28 sm:py-40">
      <div className="site-container text-center">
        <h2 className="type-display">More coming for Nepal</h2>
        <p lang="ne" className="mt-2 text-lg text-ink-3">
          नेपालका लागि अझ धेरै आउँदैछ
        </p>
      </div>
      <ul className="sr-only" aria-label="Services planned next">
        {FEATURES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <div aria-hidden="true" className="group relative mt-16 sm:mt-20">
        <div className="flex w-max gap-6 [animation:drift_90s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-start gap-6">
              {screens.map((screen, i) => (
                <div key={i} className={i % 2 ? "mt-12" : ""}>
                  {screen}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Screen({ width, children, title, ne }: { width: number; children: ReactNode; title: string; ne?: string }) {
  return (
    <div className="squircle overflow-hidden rounded-[28px] bg-white shadow-card" style={{ width }}>
      <div className="flex items-baseline justify-between gap-3 px-5 pt-5">
        <p className="text-[15px] font-semibold tracking-[-0.01em]">{title}</p>
        {ne && (
          <p lang="ne" className="text-[12px] text-ink-3">
            {ne}
          </p>
        )}
      </div>
      <div className="p-5 pt-4">{children}</div>
    </div>
  );
}

const Button = ({ children, tone = "#002664" }: { children: ReactNode; tone?: string }) => (
  <span className="inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-medium text-white" style={{ backgroundColor: tone }}>
    {children}
  </span>
);

function LokSewa() {
  const jobs = [
    { role: "Kharidar", office: "District Administration Office", closes: "Kartik 18" },
    { role: "Nayab Subba", office: "Ministry of Home Affairs", closes: "Kartik 25" },
    { role: "Computer Operator", office: "Land Revenue Office", closes: "Mangsir 2" },
  ];
  return (
    <Screen width={360} title="Top 3 matches for you" ne="लोक सेवा">
      <p className="-mt-2 mb-3 text-[12px] text-ink-3">Based on your +2 in management</p>
      <ul className="space-y-2">
        {jobs.map((job, i) => (
          <li key={job.role} className={`flex items-center gap-3 rounded-2xl border p-3 ${i === 0 ? "border-[#9dbcf0] bg-[#f4f8ff]" : "border-line"}`}>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky text-blue">
              <icons.work className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold">{job.role}</span>
              <span className="block truncate text-[11px] text-ink-3">{job.office}</span>
            </span>
            <span className="text-right text-[11px] text-ink-3">
              Closes
              <span className="block font-medium text-crimson">{job.closes}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end">
        <Button>Apply</Button>
      </div>
    </Screen>
  );
}

function Passport() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const offset = 3;
  const toNe = (n: number) => String(n).replace(/\d/g, (d) => "०१२३४५६७८९"[Number(d)]);
  return (
    <Screen width={330} title="Book a passport visit" ne="राहदानी">
      <p className="-mt-2 mb-3 text-[12px] text-ink-3">District Administration Office, Kathmandu</p>
      <p lang="ne" className="text-[12px] font-medium">
        कार्तिक २०८३
      </p>
      <div lang="ne" className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] text-ink-3">
        {["आइत", "सोम", "मंगल", "बुध", "बिही", "शुक्र", "शनि"].map((d) => (
          <span key={d}>{d}</span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {days.map((d) => (
          <span
            key={d}
            className={`grid aspect-square place-items-center rounded-full text-[11px] ${d === 12 ? "bg-blue-deep text-white" : (d + offset) % 7 === 0 ? "text-crimson/60" : "text-ink"}`}
          >
            {toNe(d)}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {["10:00", "10:30", "11:00", "11:30"].map((t) => (
          <span key={t} className={`rounded-full border px-2.5 py-1 text-[11px] ${t === "10:30" ? "border-blue-deep bg-blue-deep text-white" : "border-line"}`}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <Button>Book 10:30</Button>
      </div>
    </Screen>
  );
}

function Land() {
  const steps = ["Documents checked", "Tax paid", "Deed registered", "Ownership certificate"];
  return (
    <Screen width={380} title="Land transfer" ne="नामसारी">
      <div className="overflow-hidden rounded-2xl bg-[#f4fbfa]">
        <svg viewBox="0 0 340 130" className="w-full" aria-hidden="true">
          <path
            d="M0 20 70 10 90 60 10 70Z M70 10 160 14 150 58 90 60Z M160 14 240 8 250 56 150 58Z M240 8 340 18 330 64 250 56Z M10 70 90 60 100 120 0 126Z M90 60 150 58 170 118 100 120Z M250 56 330 64 340 124 260 120Z"
            fill="#fff"
            stroke="#8cc5bf"
          />
          <path d="M150 58 250 56 260 120 170 118Z" fill="#1b6660" fillOpacity="0.2" stroke="#1b6660" strokeWidth="1.6" />
          <text x="196" y="94" fontSize="11" fill="#1b6660" fontFamily="var(--font-sans)" fontWeight="600">482</text>
        </svg>
      </div>
      <p className="mt-3 text-[13px] font-semibold">Kitta no. 482 · Ward 5, Lalitpur</p>
      <p className="text-[11px] text-ink-3">0-4-2-0 ropani</p>
      <ol className="mt-3 space-y-1.5">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2 text-[12px]">
            <span className={`grid size-4 place-items-center rounded-full ${i < 2 ? "bg-[#1b6660] text-white" : "border border-ink-4"}`}>
              {i < 2 && <icons.check className="size-2.5" strokeWidth="3" />}
            </span>
            <span className={i < 2 ? "" : "text-ink-3"}>{step}</span>
          </li>
        ))}
      </ol>
    </Screen>
  );
}

function Sifaris() {
  return (
    <Screen width={320} title="Recommendation letter" ne="सिफारिस">
      <div lang="ne" className="relative rounded-2xl border border-line bg-[#fffdf8] p-4 font-deva text-[11px] leading-[1.7]">
        <p className="text-center font-semibold">वडा कार्यालय</p>
        <p className="text-center text-ink-3">वडा नं. ५</p>
        <p className="mt-2">विषय: सिफारिस सम्बन्धमा</p>
        {[100, 92, 96, 70].map((w, i) => (
          <span key={i} className="mt-1.5 block h-1.5 rounded-full bg-[#eee8da]" style={{ width: `${w}%` }} />
        ))}
        <svg viewBox="0 0 40 40" className="absolute right-4 bottom-3 size-10 rotate-[-10deg]" aria-hidden="true">
          <circle cx="20" cy="20" r="17" fill="none" stroke="#a3122f" strokeOpacity="0.6" strokeWidth="1.4" />
          <circle cx="20" cy="20" r="11" fill="none" stroke="#a3122f" strokeOpacity="0.6" strokeDasharray="2 1.6" />
        </svg>
      </div>
      <div className="mt-4 flex gap-2">
        <Button tone="#a3122f">Download PDF</Button>
        <span className="inline-flex h-9 items-center rounded-full border border-line px-4 text-[13px]">Edit</span>
      </div>
    </Screen>
  );
}

function Health() {
  const members = ["Ram (you)", "Sita", "Aarav", "Maya", "Hari"];
  const tones = ["#003893", "#a3122f", "#1b6660", "#8a5a12", "#5b3aa0"];
  return (
    <Screen width={330} title="Renew health insurance" ne="स्वास्थ्य बीमा">
      <ul className="space-y-1.5">
        {members.map((m, i) => (
          <li key={m} className="flex items-center gap-2.5 rounded-xl bg-snow px-3 py-2 text-[12px]">
            <span className="grid size-6 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: tones[i] }}>
              {m[0]}
            </span>
            <span className="flex-1">{m}</span>
            <span className="grid size-4 place-items-center rounded bg-[#1f6b3a] text-white">
              <icons.check className="size-2.5" strokeWidth="3" />
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] text-ink-3">
          Family of 5
          <span lang="ne" className="block font-serif text-[20px] text-ink">
            रु ३,५००
          </span>
        </span>
        <Button tone="#1f6b3a">Renew</Button>
      </div>
    </Screen>
  );
}

function Abroad() {
  const steps = [
    ["Passport", true],
    ["Medical test", true],
    ["Orientation", true],
    ["Insurance", false],
    ["Labour permit", false],
  ] as const;
  return (
    <div className="squircle w-[340px] overflow-hidden rounded-[28px] bg-white shadow-card">
      <div className="relative h-32">
        <Image src={abroad} alt="" fill sizes="340px" className="object-cover" />
        <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur">3 of 5 done</span>
      </div>
      <div className="p-5">
        <p className="text-[15px] font-semibold">Going abroad for work</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {steps.map(([label, done]) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${done ? "bg-sky text-blue" : "border border-line text-ink-2"}`}
            >
              {done && <icons.check className="size-3" strokeWidth="2.6" />}
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Results() {
  return (
    <div className="squircle w-[300px] overflow-hidden rounded-[28px] bg-white shadow-card">
      <div className="relative h-36">
        <Image src={education} alt="" fill sizes="300px" className="object-cover object-[50%_60%]" />
      </div>
      <div className="p-5">
        <p className="text-[15px] font-semibold">SEE results</p>
        <div className="mt-3 rounded-xl border border-line px-3 py-2 text-[12px] text-ink-3">Symbol no. 0231 4567 A</div>
        <div className="mt-3 flex items-end justify-between">
          <span className="text-[12px] text-ink-3">
            GPA
            <span className="block font-serif text-[28px] leading-none text-ink">3.65</span>
          </span>
          <Button>View grades</Button>
        </div>
      </div>
    </div>
  );
}
