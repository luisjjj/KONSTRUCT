"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { IconBuilding } from "@/components/icons";
import DatePicker from "@/components/DatePicker";

const defaultPhases = [
  { title: "Foundation", description: "Excavation, concrete laying, foundation walls, and backfilling", order: 1 },
  { title: "Blockwork", description: "Wall construction, lintels, and floor slabs", order: 2 },
  { title: "Roofing", description: "Roof trusses, decking, and roofing sheets installation", order: 3 },
  { title: "Finishing", description: "Plastering, tiling, painting, plumbing, and electrical works", order: 4 },
  { title: "External Works", description: "Perimeter fencing, gate house, landscaping, and drainage", order: 5 },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("Residential");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [selectedPhases, setSelectedPhases] = useState<number[]>([0, 1, 2, 3, 4]);
  const [submitting, setSubmitting] = useState(false);

  const togglePhase = (idx: number) => setSelectedPhases((p) => p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
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
        title: defaultPhases[i].title,
        description: defaultPhases[i].description,
        order: idx + 1,
        budgetAllocation: phaseBudget,
      })),
    });

    if (project) {
      router.push(`/dashboard/projects/${project.id}`);
    } else {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Create New Project</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Set up your construction project in a few steps</p>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn("h-1.5 flex-1 rounded-full transition-colors", step >= s ? "bg-slate-900" : "bg-slate-200 dark:bg-slate-700")} />
          </div>
        ))}
      </div>

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
              {defaultPhases.map((phase, i) => (
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
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {step > 1 && <button onClick={() => setStep(step - 1)} disabled={submitting} className="flex-1 py-3 text-[14px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50">Back</button>}
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} disabled={step === 1 && !name} className="flex-1 py-3 text-[14px] font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">Continue</button>
        ) : (
          <button onClick={handleSubmit} disabled={!name || selectedPhases.length === 0 || submitting} className="flex-1 py-3 text-[14px] font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">
            {submitting ? "Creating..." : "Create Project"}
          </button>
        )}
      </div>
    </div>
  );
}
