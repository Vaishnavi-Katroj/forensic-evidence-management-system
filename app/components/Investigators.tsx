
"use client";

import { useEffect, useState } from "react";

type Investigator = {
  Investigator_ID: number;
  Name: string;
  Badge_No: string;
  Investigator_Rank: string;
  Contact_No: string;
};

const emptyForm = {
  Name: "",
  Badge_No: "",
  Investigator_Rank: "",
  Contact_No: "",
};

export default function Investigators() {
  const [investigators, setInvestigators] = useState<Investigator[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadInvestigators() {
    try {
      const response = await fetch("/api/investigators");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load investigators.");
      }

      setInvestigators(data.investigators);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not load investigators.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvestigators();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(item: Investigator) {
    setEditingId(item.Investigator_ID);
    setForm({
      Name: item.Name,
      Badge_No: item.Badge_No,
      Investigator_Rank: item.Investigator_Rank,
      Contact_No: item.Contact_No,
    });
    setShowForm(true);
  }

  async function saveInvestigator(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("/api/investigators", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(editingId ? { Investigator_ID: editingId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save investigator.");
      }

      await loadInvestigators();
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      alert(data.message);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not save investigator.");
    }
  }

  async function deleteInvestigator(id: number) {
    if (!window.confirm(`Delete Investigator #${id}?`)) return;

    try {
      const response = await fetch(`/api/investigators?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete investigator.");
      }

      await loadInvestigators();
      alert(data.message);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not delete investigator.");
    }
  }

  return (
    <section id="investigators" className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">Investigator Management</h3>
          <p className="mt-1 text-sm text-slate-500">
            Register and manage investigation officers.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
        >
          + Add Investigator
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveInvestigator} className="mt-5 grid gap-4 sm:grid-cols-2">
          <h4 className="font-semibold sm:col-span-2">
            {editingId ? "Edit Investigator" : "Register Investigator"}
          </h4>

          <input
            required
            placeholder="Full Name"
            value={form.Name}
            onChange={(e) => setForm({ ...form, Name: e.target.value })}
            className="rounded-lg border border-slate-300 p-2"
          />

          <input
            required
            placeholder="Badge Number"
            value={form.Badge_No}
            onChange={(e) => setForm({ ...form, Badge_No: e.target.value })}
            className="rounded-lg border border-slate-300 p-2"
          />

          <input
            required
            placeholder="Rank / Designation"
            value={form.Investigator_Rank}
            onChange={(e) => setForm({ ...form, Investigator_Rank: e.target.value })}
            className="rounded-lg border border-slate-300 p-2"
          />

          <input
            required
            type="tel"
            pattern="[0-9]{10,15}"
            placeholder="Contact Number (10–15 digits)"
            value={form.Contact_No}
            onChange={(e) => setForm({ ...form, Contact_No: e.target.value })}
            className="rounded-lg border border-slate-300 p-2"
          />

          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {editingId ? "Update Investigator" : "Save Investigator"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-slate-500">Loading investigators...</p>
        ) : investigators.length === 0 ? (
          <p className="text-sm text-slate-500">No investigators found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Badge No.</th>
                <th className="p-3">Rank</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {investigators.map((item) => (
                <tr key={item.Investigator_ID}>
                  <td className="p-3">{item.Investigator_ID}</td>
                  <td className="p-3 font-medium">{item.Name}</td>
                  <td className="p-3">{item.Badge_No}</td>
                  <td className="p-3">{item.Investigator_Rank}</td>
                  <td className="p-3">{item.Contact_No}</td>
                  <td className="whitespace-nowrap p-3">
                    <button
                      onClick={() => openEditForm(item)}
                      className="mr-2 rounded bg-amber-500 px-3 py-1.5 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteInvestigator(item.Investigator_ID)}
                      className="rounded bg-red-600 px-3 py-1.5 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
