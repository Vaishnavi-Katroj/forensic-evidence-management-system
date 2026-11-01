
"use client";

import { useEffect, useState } from "react";

type Suspect = {
  Suspect_ID: number;
  Name: string;
  Age: number;
  Criminal_Record: string | null;
};

const emptyForm = {
  Name: "",
  Age: "",
  Criminal_Record: "",
};

export default function Suspects() {
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadSuspects() {
    try {
      const response = await fetch("/api/suspects");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load suspects.");
      }

      setSuspects(data.suspects);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not load suspects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuspects();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(item: Suspect) {
    setEditingId(item.Suspect_ID);
    setForm({
      Name: item.Name,
      Age: String(item.Age),
      Criminal_Record: item.Criminal_Record || "",
    });
    setShowForm(true);
  }

  async function saveSuspect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("/api/suspects", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          Age: Number(form.Age),
          ...(editingId ? { Suspect_ID: editingId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save suspect.");
      }

      await loadSuspects();
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      alert(data.message);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not save suspect.");
    }
  }

  async function deleteSuspect(id: number) {
    if (!window.confirm(`Delete Suspect #${id}?`)) return;

    try {
      const response = await fetch(`/api/suspects?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete suspect.");
      }

      await loadSuspects();
      alert(data.message);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not delete suspect.");
    }
  }

  return (
    <section id="suspects" className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">Suspect Management</h3>
          <p className="mt-1 text-sm text-slate-500">
            Register and manage suspect information.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
        >
          + Add Suspect
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveSuspect} className="mt-5 grid gap-4 sm:grid-cols-2">
          <h4 className="font-semibold sm:col-span-2">
            {editingId ? "Edit Suspect" : "Register Suspect"}
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
            type="number"
            min="0"
            max="150"
            placeholder="Age"
            value={form.Age}
            onChange={(e) => setForm({ ...form, Age: e.target.value })}
            className="rounded-lg border border-slate-300 p-2"
          />

          <textarea
            placeholder="Criminal Record (optional)"
            value={form.Criminal_Record}
            onChange={(e) => setForm({ ...form, Criminal_Record: e.target.value })}
            className="rounded-lg border border-slate-300 p-2 sm:col-span-2"
            rows={3}
          />

          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {editingId ? "Update Suspect" : "Save Suspect"}
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
          <p className="text-sm text-slate-500">Loading suspects...</p>
        ) : suspects.length === 0 ? (
          <p className="text-sm text-slate-500">No suspects found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Age</th>
                <th className="p-3">Criminal Record</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {suspects.map((item) => (
                <tr key={item.Suspect_ID}>
                  <td className="p-3">{item.Suspect_ID}</td>
                  <td className="p-3 font-medium">{item.Name}</td>
                  <td className="p-3">{item.Age}</td>
                  <td className="p-3">{item.Criminal_Record || "Not provided"}</td>
                  <td className="whitespace-nowrap p-3">
                    <button
                      onClick={() => openEditForm(item)}
                      className="mr-2 rounded bg-amber-500 px-3 py-1.5 text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteSuspect(item.Suspect_ID)}
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
