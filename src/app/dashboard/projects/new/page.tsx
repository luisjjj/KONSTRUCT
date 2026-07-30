"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { IconBuilding } from "@/components/icons";
import DatePicker from "@/components/DatePicker";

interface Template {
  name: string;
  type: string;
  description: string;
  phases: { title: string; description: string; order: number }[];
}

const templates: Template[] = [
  {
    name: "3-Bedroom Bungalow",
    type: "Residential",
    description: "Standard 3-bedroom bungalow with self-contained kitchen, living room, and dining",
    phases: [
      { title: "Foundation", description: "Excavation, strip foundation, German floor, and backfilling", order: 1 },
      { title: "Blockwork", description: "Walling, lintels, floor slab, and decking", order: 2 },
      { title: "Roofing", description: "Trusses, bamboo ceiling, roofing sheets, and fascia", order: 3 },
      { title: "Plastering & Screeding", description: "Internal and external plastering, floor screeding", order: 4 },
      { title: "Finishing", description: "Tiling, painting, plumbing, electrical, and POP ceiling", order: 5 },
      { title: "External Works", description: "Perimeter fence, gate, septic tank, borehole, and landscaping", order: 6 },
    ],
  },
  {
    name: "2-Storey Duplex",
    type: "Residential",
    description: "4-bedroom duplex with boys quarter, double kitchen, and spacious living areas",
    phases: [
      { title: "Foundation", description: "Deep foundation, pile work, ground floor slab", order: 1 },
      { title: "Ground Floor Blockwork", description: "Ground floor walls, stairs, first floor slab", order: 2 },
      { title: "First Floor Blockwork", description: "First floor walls, staircase to roof, roof slab", order: 3 },
      { title: "Roofing", description: "Trusses, decking, roofing, and waterproofing", order: 4 },
      { title: "Mechanical & Electrical", description: "Plumbing, electrical wiring, AC ducting, elevator shaft", order: 5 },
      { title: "Finishing", description: "Tiling, painting, POP, kitchen fittings, wardrobes", order: 6 },
      { title: "External Works", description: "Fencing, gate house, swimming pool area, landscaping", order: 7 },
    ],
  },
  {
    name: "Shop/Commercial Unit",
    type: "Commercial",
    description: "Single or double shop unit with store room and toilet facility",
    phases: [
      { title: "Foundation", description: "Excavation, foundation, and floor slab", order: 1 },
      { title: "Blockwork & Roofing", description: "Walling, lintels, roof trusses, and sheets", order: 2 },
      { title: "Finishing", description: "Plastering, painting, tiling, shutters/doors", order: 3 },
      { title: "Electrical & Plumbing", description: "Wiring, lighting, socket outlets, water supply", order: 4 },
    ],
  },
  {
    name: "Warehouse",
    type: "Industrial",
    description: "Open span warehouse with loading bay, office space, and security post",
    phases: [
      { title: "Site Clearing & Foundation", description: "Clearing, grading, foundation, and floor slab", order: 1 },
      { title: "Structural Steel", description: "Column erection, beam installation, bracing", order: 2 },
      { title: "Cladding & Roofing", description: "Wall cladding, roofing sheets, gutters", order: 3 },
      { title: "Floor & Finishing", description: "Floor treatment, office partition, painting", order: 4 },
      { title: "MEP Works", description: "Electrical, plumbing, fire suppression, loading bay", order: 5 },
    ],
  },
  {
    name: "Renovation",
    type: "Renovation",
    description: "Existing building renovation — painting, plumbing, electrical, and structural repairs",
    phases: [
      { title: "Assessment & Demolition", description: "Structural assessment, demolition of damaged sections", order: 1 },
      { title: "Structural Repairs", description: "Wall repairs, roof repairs, floor repairs", order: 2 },
      { title: "MEP Upgrades", description: "Re-wiring, re-plumbing, new fixtures", order: 3 },
      { title: "Finishing", description: "Plastering, tiling, painting, new fittings", order: 4 },
    ],
  },
  {
    name: "Custom",
    type: "Residential",
    description: "Start from scratch with your own custom phases",
    phases: [],
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject, currentUser } = useStore();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("Residential");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [phases, setPhases] = useState(templates[0].phases);
  const [selectedPhases, setSelectedPhases] = useState<number[]>([0, 1, 2, 3, 4]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const applyTemplate = (idx: number) => {
    const t = templates[idx];
    setSelectedTemplate(idx);
    setProjectType(t.type);
    setDescription(t.description);
    setPhases(t.phases);
    setSelectedPhases(t.phases.map((_, i) => i));
    if (t.name !== "Custom") setName(t.name);
  };

  const togglePhase = (idx: number) => setSelectedPhases((p) => p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const budget = parseInt(totalBudget.replace(/[^0-9]/g, "")) || 0;
    const phaseBudget = Math.round(budget / selectedPhases.length);

    const project = await createProject({
      name,
      description,
      projectType,
      location,
      address,
      totalBudget: budget,
      startDate,
      expectedEndDate,
      phases: selectedPhases.map((i, idx) => ({
        title: phases[i].title,
        description: phases[i].description,
        order: idx + 1,
        budgetAllocation: phaseBudget,
      })),
    });

    if (project) {
      // Send project created email
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "projectCreated",
          to: currentUser?.email,
          projectName: project.name,
          projectType: projectType || "Residential",
        }),
      }).catch(() => {});
      router.push(`/dashboard/projects/${project.id}`);
    } else {
      setError("Failed to create project. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Create New Project</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Set up your construction project in a few steps</p>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Choose a Template</h2>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mb-4">Start with a pre-built template or create from scratch</p>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t, i) => (
                <button key={i} onClick={() => { applyTemplate(i); setStep(1); }}
                  className={cn("text-left p-4 rounded-xl border-2 transition-all", selectedTemplate === i ? "border-slate-900 bg-slate-50 dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 hover:border-slate-300")}>
                  <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{t.name}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">{t.description}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">{t.phases.length} phases · {t.type}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= s ? "bg-slate-900" : "bg-slate-200 dark:bg-slate-700")} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Project Details</h2>
            <div>
              <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Project Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" placeholder="e.g. My Dream House" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all min-h-[80px] resize-none" placeholder="Brief description of the project" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Project Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {["Residential", "Commercial", "Industrial"].map((t) => (
                  <button key={t} onClick={() => setProjectType(t)} className={cn("rounded-xl border-2 p-3 text-sm font-medium transition-all", projectType === t ? "border-slate-900 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Location & Budget</h2>
            <div>
              <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" placeholder="e.g. Lekki Phase 1, Lagos" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Full Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" placeholder="e.g. 15 Admiralty Way" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1.5">Total Budget (NGN)</label>
              <input type="text" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} className="w-full px-4 py-3 text-[14px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all" placeholder="e.g. 50000000" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatePicker label="Start Date" value={startDate} onChange={setStartDate} placeholder="Select start date" />
              <DatePicker label="Expected End Date" value={expectedEndDate} onChange={setExpectedEndDate} placeholder="Select end date" min={startDate || undefined} />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Project Phases</h2>
            <p className="text-[13px] text-slate-400 dark:text-slate-500">Select the phases for your project</p>
            <div className="space-y-2.5">
              {phases.map((phase, i) => (
                <button key={i} onClick={() => togglePhase(i)} className={cn("w-full text-left rounded-xl border-2 p-4 transition-all", selectedPhases.includes(i) ? "border-slate-900 bg-slate-50 dark:bg-slate-800" : "border-slate-200 dark:border-slate-700 hover:border-slate-300")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0", selectedPhases.includes(i) ? "bg-slate-900 border-slate-900" : "border-slate-300 dark:border-slate-600")}>
                      {selectedPhases.includes(i) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{phase.title}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{phase.description}</div>
                    </div>
                  </div>
                </button>
              ))}
              {phases.length === 0 && (
                <p className="text-[13px] text-slate-400 dark:text-slate-500 text-center py-4">Add your own phases in the next steps</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {step > 0 && <button onClick={() => setStep(step - 1)} disabled={submitting} className="flex-1 py-3 text-[14px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50">Back</button>}
        {step === 0 && <button onClick={() => setStep(1)} className="flex-1 py-3 text-[14px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm">Continue</button>}
        {step > 0 && step < 3 && (
          <button onClick={() => setStep(step + 1)} disabled={step === 1 && !name} className="flex-1 py-3 text-[14px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">Continue</button>
        )}
        {step === 3 && (
          <button onClick={handleSubmit} disabled={!name || selectedPhases.length === 0 || submitting} className="flex-1 py-3 text-[14px] font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">
            {submitting ? "Creating..." : "Create Project"}
          </button>
        )}
      </div>
    </div>
  );
}
