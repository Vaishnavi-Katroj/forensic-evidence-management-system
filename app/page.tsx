
"use client";

import { useEffect, useState } from "react";
import Investigators from "./components/Investigators";
import ImageAnalysis from "./components/ImageAnalysis";
import Suspects from "./components/Suspects";
import Victims from "./components/Victims";

type CaseRecord = {
  Case_ID: number;
  Case_Title: string;
  Case_Type: string | null;
  Status: string | null;
  Investigator_ID: number;
  Evidence_Count: number;
};

export default function Home() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [investigators, setInvestigators] = useState<any[]>([]);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<number | null>(null);

const [caseForm, setCaseForm] = useState({
  Case_Title: "",
  Case_Type: "Cyber Crime",
  Date_Reported: "",
  Status: "Under Investigation",
  Investigator_ID: "",
});
  const [investigatorCount, setInvestigatorCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [editingEvidenceId, setEditingEvidenceId] = useState<number | null>(null);  
  const [evidenceForm, setEvidenceForm] = useState({
      Evidence_Type: "Digital Evidence",
      Description: "",
      Collection_Date: "",
      Storage_Location: "",
      Case_ID: "",
      Lab_ID: "",    
   });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);

  const [analysts, setAnalysts] = useState<any[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);

  const [reportForm, setReportForm] = useState({
    Evidence_ID: "",
    Analyst_ID: "",
    Report_Date: "",
    Findings: "",
    Conclusion: "",
  });

  
async function updateCaseStatus(caseId: number, status: string) {
  try {
    const response = await fetch("/api/cases", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ caseId, status }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Status update failed.");
    }

    setCases((previousCases) =>
      previousCases.map((item) =>
        item.Case_ID === caseId
          ? { ...item, Status: status }
          : item
      )
    );
  } catch (error) {
    console.error("Status update failed:", error);
    alert("Could not update case status. Please try again.");
  }
}

function openAddCaseForm() {
  setEditingCaseId(null);
  setCaseForm({
    Case_Title: "",
    Case_Type: "Cyber Crime",
    Date_Reported: "",
    Status: "Under Investigation",
    Investigator_ID: "",
  });
  setShowCaseForm(true);
}

function openEditCaseForm(item: any) {
  setEditingCaseId(item.Case_ID);
  setCaseForm({
    Case_Title: item.Case_Title,
    Case_Type: item.Case_Type || "Cyber Crime",
    Date_Reported: String(item.Date_Reported).slice(0, 10),
    Status: item.Status || "Under Investigation",
    Investigator_ID: String(item.Investigator_ID),
  });
  setShowCaseForm(true);
}

async function saveCase(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  try {
    const response = await fetch("/api/cases", {
      method: editingCaseId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...caseForm,
        Investigator_ID: Number(caseForm.Investigator_ID),
        ...(editingCaseId ? { Case_ID: editingCaseId } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not save case.");
    }

    const updatedResponse = await fetch("/api/cases");
    const updatedData = await updatedResponse.json();

    if (!updatedResponse.ok || !updatedData.success) {
      throw new Error("Case saved, but the list could not be refreshed.");
    }

    setCases(updatedData.cases);
    setInvestigatorCount(updatedData.counts.investigatorCount);
    setReportCount(updatedData.counts.reportCount);
    setShowCaseForm(false);
    setEditingCaseId(null);

    alert(data.message);
  } catch (error) {
    console.error("Saving case failed:", error);
    alert(error instanceof Error ? error.message : "Could not save case.");
  }
}

async function deleteCase(caseId: number) {
  const confirmed = window.confirm(
    `Are you sure you want to delete CASE-${String(caseId).padStart(3, "0")}?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/cases?id=${caseId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not delete case.");
    }

    setCases((previousCases) =>
      previousCases.filter((item) => item.Case_ID !== caseId)
    );

    alert(data.message);
  } catch (error) {
    console.error("Deleting case failed:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Could not delete case. It may have linked records."
    );
  }
}

function openAddReportForm() {
  setEditingReportId(null);
  setReportForm({
    Evidence_ID: "",
    Analyst_ID: "",
    Report_Date: "",
    Findings: "",
    Conclusion: "",
  });
  setShowReportForm(true);
}

function openEditReportForm(report: any) {
  setEditingReportId(report.Report_ID);
  setReportForm({
    Evidence_ID: String(report.Evidence_ID),
    Analyst_ID: String(report.Analyst_ID),
    Report_Date: new Date(report.Report_Date).toISOString().split("T")[0],
    Findings: report.Findings,
    Conclusion: report.Conclusion,
  });
  setShowReportForm(true);
}

async function saveReport(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  try {
    const response = await fetch("/api/reports", {
      method: editingReportId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...reportForm,
        Evidence_ID: Number(reportForm.Evidence_ID),
        Analyst_ID: Number(reportForm.Analyst_ID),
        ...(editingReportId ? { Report_ID: editingReportId } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not save report.");
    }

    const updatedResponse = await fetch("/api/reports");
    const updatedData = await updatedResponse.json();

    if (!updatedResponse.ok || !updatedData.success) {
      throw new Error("Report saved, but the list could not be refreshed.");
    }

    setReports(updatedData.reports);
    setShowReportForm(false);
    setEditingReportId(null);
    setReportForm({
      Evidence_ID: "",
      Analyst_ID: "",
      Report_Date: "",
      Findings: "",
      Conclusion: "",
    });

    alert(data.message);
  } catch (error) {
    console.error("Saving report failed:", error);
    alert(error instanceof Error ? error.message : "Could not save report.");
  }
}

async function deleteReport(reportId: number) {
  const confirmed = window.confirm(
    `Are you sure you want to delete Report #${reportId}?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/reports?id=${reportId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not delete report.");
    }

    setReports((previousReports) =>
      previousReports.filter((report) => report.Report_ID !== reportId)
    );

    alert(data.message);
  } catch (error) {
    console.error("Deleting report failed:", error);
    alert(error instanceof Error ? error.message : "Could not delete report.");
  }
}

function openAddEvidenceForm() {
  setEditingEvidenceId(null);
  setEvidenceForm({
    Evidence_Type: "Digital Evidence",
    Description: "",
    Collection_Date: "",
    Storage_Location: "",
    Case_ID: "",
    Lab_ID: "",
  });
  setShowEvidenceForm(true);
}

function openEditEvidenceForm(item: any) {
  setEditingEvidenceId(item.Evidence_ID);
  setEvidenceForm({
    Evidence_Type: item.Evidence_Type,
    Description: item.Description,
    Collection_Date: new Date(item.Collection_Date).toISOString().split("T")[0],
    Storage_Location: item.Storage_Location,
    Case_ID: String(item.Case_ID),
    Lab_ID: String(item.Lab_ID),
  });
  setShowEvidenceForm(true);
}

async function saveEvidence(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  try {
    const response = await fetch("/api/evidence", {
      method: editingEvidenceId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...evidenceForm,
        Case_ID: Number(evidenceForm.Case_ID),
        Lab_ID: Number(evidenceForm.Lab_ID),
        ...(editingEvidenceId ? { Evidence_ID: editingEvidenceId } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not save evidence.");
    }

    const updatedResponse = await fetch("/api/evidence");
    const updatedData = await updatedResponse.json();

    if (!updatedResponse.ok || !updatedData.success) {
      throw new Error("Evidence saved, but the list could not be refreshed.");
    }

    setEvidence(updatedData.evidence);
    setShowEvidenceForm(false);
    setEditingEvidenceId(null);
    alert(data.message);
  } catch (error) {
    console.error("Saving evidence failed:", error);
    alert(error instanceof Error ? error.message : "Could not save evidence.");
  }
}

async function deleteEvidence(evidenceId: number) {
  const confirmed = window.confirm(
    `Are you sure you want to delete Evidence #${evidenceId}?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/evidence?id=${evidenceId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not delete evidence.");
    }

    setEvidence((previousEvidence) =>
      previousEvidence.filter((item) => item.Evidence_ID !== evidenceId)
    );

    alert(data.message);
  } catch (error) {
    console.error("Deleting evidence failed:", error);
    alert(error instanceof Error ? error.message : "Could not delete evidence.");
  }
}

function openAddEvidenceForm() {
  setEditingEvidenceId(null);
  setEvidenceForm({
    Evidence_Type: "Digital Evidence",
    Description: "",
    Collection_Date: "",
    Storage_Location: "",
    Case_ID: "",
    Lab_ID: "",
  });
  setShowEvidenceForm(true);
}

function openEditEvidenceForm(item: any) {
  setEditingEvidenceId(item.Evidence_ID);
  setEvidenceForm({
    Evidence_Type: item.Evidence_Type,
    Description: item.Description,
    Collection_Date: new Date(item.Collection_Date).toISOString().split("T")[0],
    Storage_Location: item.Storage_Location,
    Case_ID: String(item.Case_ID),
    Lab_ID: String(item.Lab_ID),
  });
  setShowEvidenceForm(true);
}

async function saveEvidence(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  try {
    const response = await fetch("/api/evidence", {
      method: editingEvidenceId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...evidenceForm,
        Case_ID: Number(evidenceForm.Case_ID),
        Lab_ID: Number(evidenceForm.Lab_ID),
        ...(editingEvidenceId ? { Evidence_ID: editingEvidenceId } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not save evidence.");
    }

    const updatedResponse = await fetch("/api/evidence");
    const updatedData = await updatedResponse.json();

    if (!updatedResponse.ok || !updatedData.success) {
      throw new Error("Evidence saved, but the list could not be refreshed.");
    }

    setEvidence(updatedData.evidence);
    setShowEvidenceForm(false);
    setEditingEvidenceId(null);
    alert(data.message);
  } catch (error) {
    console.error("Saving evidence failed:", error);
    alert(error instanceof Error ? error.message : "Could not save evidence.");
  }
}



useEffect(() => {
  async function loadCases() {
    try {
      const response = await fetch("/api/cases");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Could not load cases from MySQL.");
      }

      setCases(data.cases);
      setInvestigatorCount(data.counts.investigatorCount);
      setReportCount(data.counts.reportCount);
    } catch {
      setError("Unable to load cases. Please check the database connection.");
    } finally {
      setLoading(false);
    }
  }

  async function loadEvidence() {
    try {
      const response = await fetch("/api/evidence");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Could not load evidence.");
      }

      setEvidence(data.evidence);
    } catch (error) {
      console.error("Evidence fetch failed:", error);
    }
  }

  async function loadInvestigators() {
  try {
    const response = await fetch("/api/investigators");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Could not load investigators.");
    }

    setInvestigators(data.investigators);
  } catch (error) {
    console.error("Investigators fetch failed:", error);
  }
}

  async function loadAnalysts() {
  try {
    const response = await fetch("/api/analysts");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Could not load analysts.");
    }

    setAnalysts(data.analysts);
  } catch (error) {
    console.error("Analysts fetch failed:", error);
  }
}
  
async function loadReports() {
  try {
    const response = await fetch("/api/reports");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Could not load reports.");
    }

    setReports(data.reports);
  } catch (error) {
    console.error("Reports fetch failed:", error);
  }
}

async function loadAuditHistory() {
  try {
    const response = await fetch("/api/audit", {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not load audit history.");
    }

    setAuditHistory(data.history);
    console.log("Audit history loaded:", data.history);
  } catch (error) {
    console.error("Audit history fetch failed:", error);
  }
}


  loadCases();
  loadEvidence();
  loadInvestigators();
  loadAnalysts();
  loadReports();
  loadAuditHistory();
}, []);


  const stats = [
    {
      label: "Total Cases",
      value: String(cases.length).padStart(2, "0"),
      detail: "Registered cases",
    },
    {
      label: "Evidence Items",
      value: String(
        cases.reduce((total, item) => total + Number(item.Evidence_Count), 0)
      ).padStart(2, "0"),
      detail: "Evidence linked to these cases",
    },
    {
      label: "Investigators",
      value: String(investigatorCount).padStart(2, "0"),
      detail: "Registered investigators",
    },
    {
      label: "Forensic Reports",
      value: String(reportCount).padStart(2, "0"),
      detail: "Reports stored in database",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-slate-950 text-white md:flex">
        <div className="border-b border-slate-800 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Forensic Systems
          </p>
          <h1 className="mt-2 text-xl font-bold">Evidence Portal</h1>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <a href="#" className="block rounded-lg bg-cyan-500/15 px-4 py-3 font-medium text-cyan-300">
            Dashboard
          </a>
          <a href="#cases" className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800">
            Case Management
          </a>
          <a href="#evidence" className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800">
            Evidence Records
          </a>
          <a href="#reports" className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800">
            Forensic Reports
          </a>
        </nav>

        <div className="border-t border-slate-800 p-5 text-xs text-slate-400">
          DBMS Level 3 Project
          <p className="mt-1">Academic demonstration</p>
        </div>
      </aside>

      <section className="md:ml-64">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 md:px-10">
          <div>
            <p className="text-sm text-slate-500">Forensic Evidence Management</p>
            <h2 className="mt-1 text-2xl font-bold">Dashboard</h2>
          </div>
          <div className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600">
            MySQL Connected
          </div>
        </header>

        <div className="space-y-8 p-6 md:p-10">
          <div className="rounded-2xl bg-slate-900 p-7 text-white md:p-9">
            <p className="text-sm font-medium text-cyan-300">INVESTIGATION OVERVIEW</p>
            <h3 className="mt-3 max-w-2xl text-3xl font-bold leading-tight">
              Manage cases, evidence and forensic investigations in one place.
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              A centralized workspace for tracking case records, laboratory
              evidence and forensic examination reports.
            </p>
            <a href="#cases" className="mt-6 inline-block rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
              View registered cases
            </a>
          </div>

          <section>
            <div className="mb-4">
              <h3 className="text-lg font-bold">Database Overview</h3>
              <p className="mt-1 text-sm text-slate-500">
                Case statistics loaded from your forensic database.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold">{stat.value}</p>
                  <p className="mt-2 text-xs text-slate-500">{stat.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="cases" className="rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
              <div>
                <h3 className="font-bold">Registered Cases</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Records retrieved from MySQL
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {loading ? "Loading..." : `${cases.length} cases`}
                </span>

                <button
                   onClick={openAddCaseForm}
                   className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
                   >
                    + Add Case
                </button>
            </div>
            </div>
             
             {showCaseForm && (
  <form onSubmit={saveCase} className="space-y-4 border-b border-slate-200 p-5">
    <h4 className="font-semibold">
      {editingCaseId ? "Edit Case" : "Add New Case"}
    </h4>

    <div>
      <label className="mb-1 block text-sm font-medium">Case Title</label>
      <input
        required
        type="text"
        value={caseForm.Case_Title}
        onChange={(e) =>
          setCaseForm({ ...caseForm, Case_Title: e.target.value })
        }
        className="w-full rounded-lg border border-slate-300 p-2"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">Case Type</label>
      <select
        required
        value={caseForm.Case_Type}
        onChange={(e) =>
          setCaseForm({ ...caseForm, Case_Type: e.target.value })
        }
        className="w-full rounded-lg border border-slate-300 p-2"
      >
        <option value="Cyber Crime">Cyber Crime</option>
        <option value="Property Crime">Property Crime</option>
        <option value="Fraud">Fraud</option>
        <option value="Violent Crime">Violent Crime</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">Date Reported</label>
      <input
        required
        type="date"
        value={caseForm.Date_Reported}
        onChange={(e) =>
          setCaseForm({ ...caseForm, Date_Reported: e.target.value })
        }
        className="w-full rounded-lg border border-slate-300 p-2"
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">Status</label>
      <select
        required
        value={caseForm.Status}
        onChange={(e) =>
          setCaseForm({ ...caseForm, Status: e.target.value })
        }
        className="w-full rounded-lg border border-slate-300 p-2"
      >
        <option value="Under Investigation">Under Investigation</option>
        <option value="Evidence Collected">Evidence Collected</option>
        <option value="Under Forensic Analysis">Under Forensic Analysis</option>
        <option value="Closed">Closed</option>
      </select>
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium">Investigator</label>
      <select
        required
        value={caseForm.Investigator_ID}
        onChange={(e) =>
          setCaseForm({ ...caseForm, Investigator_ID: e.target.value })
        }
        className="w-full rounded-lg border border-slate-300 p-2"
      >
        <option value="">Select Investigator</option>
        {investigators.map((investigator) => (
         <option
           key={investigator.Investigator_ID}
           value={investigator.Investigator_ID}
          >
           {investigator.Name} - {investigator.Badge_No}
        </option>
      ))}
      </select>
    </div>

    <div className="flex gap-3">
      <button
        type="submit"
        className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
      >
        {editingCaseId ? "Update Case" : "Save Case"}
      </button>

      <button
        type="button"
        onClick={() => {
          setShowCaseForm(false);
          setEditingCaseId(null);
        }}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
      >
        Cancel
      </button>
    </div>
  </form>
)}

            {loading ? (
              <p className="p-5 text-sm text-slate-500">Loading case records...</p>
            ) : error ? (
              <p className="p-5 text-sm text-red-600">{error}</p>
            ) : cases.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No cases found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Case ID</th>
                      <th className="px-5 py-4">Case Title</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Evidence</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cases.map((item) => (
                      <tr key={item.Case_ID} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-4 font-medium">
                          CASE-{String(item.Case_ID).padStart(3, "0")}
                        </td>
                        <td className="min-w-56 px-5 py-4 font-medium">{item.Case_Title}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{item.Case_Type ?? "—"}</td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <select
                             value={item.Status}
                             onChange={(e) =>
                             updateCaseStatus(item.Case_ID, e.target.value)
                             }
                             className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                           >
                            <option value="Under Investigation">Under Investigation</option>
                            <option value="Evidence Collected">Evidence Collected</option>
                            <option value="Under Forensic Analysis">Under Forensic Analysis</option>
                            <option value="Closed">Closed</option>
                        </select>
                     </td>
                        <td className="px-5 py-4">{Number(item.Evidence_Count)}</td>
                        <td className="whitespace-nowrap px-5 py-4">
                           <div className="flex gap-2">
                             <button
                                onClick={() => openEditCaseForm(item)}
                                className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white hover:bg-amber-600"
                                >
                               Edit
                            </button>

                            <button
                              onClick={() => deleteCase(item.Case_ID)}
                               className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                             >
                               Delete
                           </button>
                      </div>
                     </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section id="evidence" className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
  <div className="flex items-center justify-between gap-3">
    <div>
      <h3 className="font-bold">Evidence Management</h3>
      <p className="mt-1 text-sm text-slate-500">
        Add and manage collected evidence records.
      </p>
    </div>

    <button
      onClick={openAddEvidenceForm}
      className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
    >
      + Add Evidence
    </button>
  </div>

  {showEvidenceForm && (
    <form onSubmit={saveEvidence} className="mt-5 space-y-4">
      <h4 className="font-semibold">
        {editingEvidenceId ? "Edit Evidence" : "Add New Evidence"}
      </h4>

      <div>
        <label className="mb-1 block text-sm font-medium">Evidence Type</label>
        <select
          required
          value={evidenceForm.Evidence_Type}
          onChange={(e) =>
            setEvidenceForm({ ...evidenceForm, Evidence_Type: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 p-2"
        >
          <option value="Digital Evidence">Digital Evidence</option>
          <option value="Physical Evidence">Physical Evidence</option>
          <option value="Documentary Evidence">Documentary Evidence</option>
          <option value="Biological Evidence">Biological Evidence</option>
        </select>
      </div>

      {([
        ["Description", "Description"],
        ["Collection_Date", "Collection Date"],
        ["Storage_Location", "Storage Location"],
        ["Case_ID", "Case ID"],
        ["Lab_ID", "Lab ID"],
      ] as const).map(([field, label]) => (
        <div key={field}>
          <label className="mb-1 block text-sm font-medium">{label}</label>
          <input
            required
            type={
              field === "Collection_Date"
                ? "date"
                : field === "Case_ID" || field === "Lab_ID"
                ? "number"
                : "text"
            }
            min={
              field === "Case_ID" || field === "Lab_ID" ? 1 : undefined
            }
            value={evidenceForm[field]}
            onChange={(e) =>
              setEvidenceForm({ ...evidenceForm, [field]: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 p-2"
          />
        </div>
      ))}

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
        >
          {editingEvidenceId ? "Update Evidence" : "Save Evidence"}
        </button>

        <button
          type="button"
          onClick={() => setShowEvidenceForm(false)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )}
</div>
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-bold">Evidence Management</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Record collected evidence, its storage location, collection
                date and associated case.
              </p>
              <div className="mt-4 text-sm font-medium text-slate-500">
{evidence.length === 0 ? (
  <p>No evidence records found.</p>
) : (
  <div className="space-y-4">
    {evidence.map((item) => (
      <div
        key={item.Evidence_ID}
        className="rounded-lg border border-gray-200 p-4"
      >
        <h3 className="font-semibold">
          Evidence #{item.Evidence_ID} — {item.Evidence_Type}
        </h3>
        <p className="mt-1 text-sm">{item.Description}</p>
        <p className="mt-2 text-sm text-gray-600">
          Case ID: CASE-{String(item.Case_ID).padStart(3, "0")}
        </p>
        <p className="text-sm text-gray-600">
           Collection Date:{" "}
           {new Date(item.Collection_Date).toLocaleDateString("en-IN")}
        </p>
        <p className="text-sm text-gray-600">
           Storage: {item.Storage_Location}
        </p>
        <p className="text-sm text-gray-600">
          Lab ID: {item.Lab_ID}
        </p>
        <div className="mt-4 flex gap-2">
          <button
             onClick={() => openEditEvidenceForm(item)}
             className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
           Edit
         </button>

         <button
            onClick={() => deleteEvidence(item.Evidence_ID)}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
             Delete
        </button>
       </div>
      </div>
    ))}
  </div>
)}
</div>
            </article>
            <article id="reports" className="rounded-xl border border-slate-200 bg-white p-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h3 className="font-bold">Forensic Reports</h3>
      <p className="mt-2 text-sm text-slate-600">
        Organize analyst findings and conclusions linked to evidence records.
      </p>
    </div>

    <button
      onClick={openAddReportForm}
      className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
    >
      + Add Report
    </button>
  </div>

  {showReportForm && (
    <form onSubmit={saveReport} className="mt-5 space-y-4">
      <h4 className="font-semibold">
        {editingReportId ? "Edit Report" : "Add New Report"}
      </h4>

      <div>
        <label className="mb-1 block text-sm font-medium">Evidence</label>
        <select
          required
          value={reportForm.Evidence_ID}
          onChange={(e) =>
            setReportForm({ ...reportForm, Evidence_ID: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 p-2"
        >
          <option value="">Select Evidence</option>
          {evidence.map((item) => (
            <option key={item.Evidence_ID} value={item.Evidence_ID}>
              Evidence #{item.Evidence_ID} - {item.Evidence_Type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Analyst</label>
        <select
          required
          value={reportForm.Analyst_ID}
          onChange={(e) =>
            setReportForm({ ...reportForm, Analyst_ID: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 p-2"
        >
          <option value="">Select Analyst</option>
          {analysts.map((analyst) => (
            <option key={analyst.Analyst_ID} value={analyst.Analyst_ID}>
              {analyst.Name} - {analyst.Specialization}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Report Date</label>
        <input
          required
          type="date"
          value={reportForm.Report_Date}
          onChange={(e) =>
            setReportForm({ ...reportForm, Report_Date: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 p-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Findings</label>
        <textarea
          required
          value={reportForm.Findings}
          onChange={(e) =>
            setReportForm({ ...reportForm, Findings: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 p-2"
          rows={3}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Conclusion</label>
        <textarea
          required
          value={reportForm.Conclusion}
          onChange={(e) =>
            setReportForm({ ...reportForm, Conclusion: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 p-2"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
        >
          {editingReportId ? "Update Report" : "Save Report"}
        </button>

        <button
          type="button"
          onClick={() => setShowReportForm(false)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )}

  <div className="mt-4 space-y-4">
    {reports.length === 0 ? (
      <p className="text-sm text-slate-500">No forensic reports found.</p>
    ) : (
      reports.map((report) => (
        <div
          key={report.Report_ID}
          className="rounded-lg border border-slate-200 p-4"
        >
          <h4 className="font-semibold">Report #{report.Report_ID}</h4>

          <p className="mt-2 text-sm text-slate-600">
            Case ID: CASE-{String(report.Case_ID).padStart(3, "0")}
          </p>

          <p className="text-sm text-slate-600">
            Report Date:{" "}
            {new Date(report.Report_Date).toLocaleDateString("en-IN")}
          </p>

          <p className="text-sm text-slate-600">
            Analyst ID: {report.Analyst_ID}
          </p>

          <p className="mt-2 text-sm">
            <strong>Findings:</strong> {report.Findings}
          </p>

          <p className="mt-2 text-sm">
            <strong>Conclusion:</strong> {report.Conclusion}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => openEditReportForm(report)}
              className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              Edit
            </button>

            <button
              onClick={() => deleteReport(report.Report_ID)}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ))
    )}
  </div>
</article>
          </section>
            <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="mb-4 text-xl font-semibold text-slate-800">
    Case Status History
  </h2>

  {auditHistory.length === 0 ? (
    <p className="text-sm text-slate-500">
      No status changes recorded yet.
    </p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Case ID</th>
            <th className="px-4 py-3">Previous Status</th>
            <th className="px-4 py-3">New Status</th>
            <th className="px-4 py-3">Changed At</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {auditHistory.map((record) => (
            <tr key={record.Audit_ID}>
              <td className="px-4 py-3">
                CASE-{String(record.Case_ID).padStart(3, "0")}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {record.Old_Status}
              </td>
              <td className="px-4 py-3 font-medium text-slate-800">
                {record.New_Status}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {new Date(record.Changed_At).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>

<Investigators />
<Suspects />
<Victims />
<ImageAnalysis />


          <footer className="pb-4 text-center text-xs text-slate-500">
            Forensic Evidence Management System · Academic demonstration
          </footer>
        </div>
      </section>
    </main>

  );
}
