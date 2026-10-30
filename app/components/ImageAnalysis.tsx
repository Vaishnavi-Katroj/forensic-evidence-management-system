
"use client";

import { useEffect, useState } from "react";

export default function ImageAnalysis() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState("");
  const [analysisType, setAnalysisType] = useState("");
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvidenceId, setNewEvidenceId] = useState("1");
  const [newImagePath, setNewImagePath] = useState("");
  const [newAnalysisType, setNewAnalysisType] = useState("");
  const [newResult, setNewResult] = useState("");
  const [newConfidence, setNewConfidence] = useState("0.90");

  async function fetchRecords() {
    try {
      const response = await fetch("/api/image-analysis");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Failed to load records");
      }

      setRecords(data.records);
    } catch {
      setError("Unable to load image analysis records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  function handleEdit(record: any) {
    setEditingId(record._id);
    setAnalysisType(record.analysisType);
    setResult(record.result);
    setConfidence(
      record.confidence !== null && record.confidence !== undefined
        ? String(record.confidence)
        : ""
    );
  }

  async function handleCreate() {
  try {
    const response = await fetch("/api/image-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        evidenceId: Number(newEvidenceId),
        imagePath: newImagePath,
        analysisType: newAnalysisType,
        result: newResult,
        confidence: Number(newConfidence),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to create record");
    }

    setShowAddForm(false);
    setNewEvidenceId("1");
    setNewImagePath("");
    setNewAnalysisType("");
    setNewResult("");
    setNewConfidence("0.90");

    await fetchRecords();

    alert("Image analysis record created successfully!");
  } catch (error) {
    alert(
      error instanceof Error ? error.message : "Unable to create record."
    );
  }
}

  async function handleUpdate(id: string) {
    try {
      const response = await fetch("/api/image-analysis", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          analysisType,
          result,
          confidence: confidence === "" ? null : Number(confidence),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Update failed");
      }

      setEditingId("");
      await fetchRecords();
      alert("Image analysis record updated successfully!");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to update record."
      );
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image analysis record?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/image-analysis?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }

      setRecords((previousRecords) =>
        previousRecords.filter((record) => record._id !== id)
      );
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to delete the record."
      );
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Image Analysis
      </h2>

      <div className="mb-5">
  <button
    onClick={() => setShowAddForm(!showAddForm)}
    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
  >
    {showAddForm ? "Cancel" : "+ Add New Analysis"}
  </button>
</div>

{showAddForm && (
  <div className="border border-gray-200 rounded-lg p-4 mb-5 space-y-3">
    <h3 className="font-semibold text-gray-800">
      Add Image Analysis Record
    </h3>

    <input
      type="number"
      min="1"
      placeholder="Evidence ID"
      value={newEvidenceId}
      onChange={(e) => setNewEvidenceId(e.target.value)}
      className="w-full border rounded-md p-2 text-sm"
    />

    <input
      type="text"
      placeholder="Image Path"
      value={newImagePath}
      onChange={(e) => setNewImagePath(e.target.value)}
      className="w-full border rounded-md p-2 text-sm"
    />

    <input
      type="text"
      placeholder="Analysis Type"
      value={newAnalysisType}
      onChange={(e) => setNewAnalysisType(e.target.value)}
      className="w-full border rounded-md p-2 text-sm"
    />

    <textarea
      placeholder="Analysis Result"
      value={newResult}
      onChange={(e) => setNewResult(e.target.value)}
      className="w-full border rounded-md p-2 text-sm"
      rows={3}
    />

    <input
      type="number"
      min="0"
      max="1"
      step="0.01"
      placeholder="Confidence (0 to 1)"
      value={newConfidence}
      onChange={(e) => setNewConfidence(e.target.value)}
      className="w-full border rounded-md p-2 text-sm"
    />

    <button
      onClick={handleCreate}
      disabled={
        !newEvidenceId ||
        Number(newEvidenceId) < 1 ||
        !newImagePath.trim() ||
        !newAnalysisType.trim() ||
        !newResult.trim() ||
        newConfidence === "" ||
        !Number.isFinite(Number(newConfidence)) ||
        Number(newConfidence) < 0 ||
        Number(newConfidence) > 1
      }
      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
    >
      Save Analysis
    </button>
  </div>
)}

      <p className="text-sm text-gray-500 mb-5">
        Image processing and comparison records stored in MongoDB.
      </p>

      {loading ? (
        <p className="text-gray-500">Loading records...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : records.length === 0 ? (
        <p className="text-gray-500">No image analysis records found.</p>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record._id}
              className="border border-gray-200 rounded-lg p-4"
            >
              {editingId === record._id ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">
                    Edit Image Analysis
                  </h3>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Analysis Type
                    </label>
                    <input
                      value={analysisType}
                      onChange={(e) => setAnalysisType(e.target.value)}
                      className="w-full border rounded-md p-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Result
                    </label>
                    <textarea
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      className="w-full border rounded-md p-2 text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Confidence (0 to 1)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={confidence}
                      onChange={(e) => setConfidence(e.target.value)}
                      className="w-full border rounded-md p-2 text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(record._id)}
                      disabled={
                        !analysisType.trim() ||
                        !result.trim() ||
                        (confidence !== "" &&
                          (Number(confidence) < 0 ||
                            Number(confidence) > 1 ||
                            !Number.isFinite(Number(confidence))))
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={() => setEditingId("")}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">
                      {record.analysisType}
                    </h3>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(record)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(record._id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Image:</strong> {record.imagePath}
                  </p>

                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Result:</strong> {record.result}
                  </p>

                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Confidence:</strong>{" "}
                    {record.confidence !== null &&
                    record.confidence !== undefined
                      ? `${(record.confidence * 100).toFixed(1)}%`
                      : "Not available"}
                  </p>

                  <p className="text-xs text-gray-400">
                    Processed: {new Date(record.processedAt).toLocaleString()}
                  </p>

                  {record.updatedAt && (
                    <p className="text-xs text-gray-400">
                      Updated: {new Date(record.updatedAt).toLocaleString()}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
