
"use client";

import { useEffect, useState } from "react";

type Victim = {
  Victim_ID: number;
  Name: string;
  Age: number;
  Address: string | null;
};

const emptyForm = {
  Name: "",
  Age: "",
  Address: "",
};

export default function Victims() {
  const [victims, setVictims] = useState<Victim[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadVictims() {
    try {
      const response = await fetch("/api/victims");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load victims.");
      }

      setVictims(data.victims);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not load victims.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVictims();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(item: Victim) {
    setEditingId(item.Victim_ID);
    setForm({
      Name: item.Name,
      Age: String(item.Age),
      Address: item.Address || "",
    });
    setShowForm(true);
  }

  async function saveVictim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("/api/victims", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          Age: Number(form.Age),
          ...(editingId ? { Victim_ID: editingId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save victim.");
      }

      await loadVictims();
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      alert(data.message);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not save victim.");
    }
  }

  async function deleteVictim(id: number) {
    if (!window.confirm(`Delete Victim #${id}?`)) return;

    try {
      const response = await fetch(`/api/victims?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete victim.");
      }

      await loadVictims();
      alert(data.message);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not delete victim.");
    }
  }

  return (
    <section id="victims" className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">Victim Management</h3>
          <p className="mt-1 text-sm text-slate-500">
            Register and manage victim information.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
        >
          + Add Victim
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveVictim} className="mt-5 grid gap-4 sm:grid-cols-2">
          <h4 className="font-semibold sm:col-span-2">
            {editingId ? "Edit Victim" : "Register Victim"}
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
            placeholder="Address"
            value={form.Address}
            onChange={(e) => setForm({ ...form, Address: e.target.value })}
            className="rounded-lg border border-slate-300 p-2 sm:col-span-2"
            rows={3}
          />

          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {editingId ? "Update Victim" : "Save Victim"}
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
          <p className="text-sm text-slate-500">Loading victims...</p>
        ) : victims.length === 0 ? (
          <p className="text-sm text-slate-500">No victims found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Age</th>
                <th className="p-3">Address</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {victims.map((item) => (
                <tr key={item.Victim_ID}>
                  <td className="p-3">{item.Victim_ID}</td>
                  <td className="p-3 font-medium">{item.Name}</td>
                  <td className="p-3">{item.Age}</td>
                  <td className="p-3">{item.Address || "Not provided"}</td>
                  <td className="whitespace-nowrap p-3">
                    <button
                      onClick={() => openEditForm(item)}
                      className="mr-2 rounded bg-amber-500 px-3 py-1.5 text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteVictim(item.Victim_ID)}
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
