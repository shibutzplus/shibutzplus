
"use client";

//
// Temporary page for running migrations - Will be removed after migration is done
//

import { useState, useTransition } from "react";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";

export default function InitPositionsPage() {
    const [schoolId, setSchoolId] = useState("ebrb8pj1ofvug78ratnbyd4o");
    const [date, setDate] = useState("");
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRunMigration = () => {
        setError(null);
        setResult(null);

        startTransition(async () => {
            try {
                const res = await fetch("/api/migrations/init-positions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ schoolId, date }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to run migration");
                }

                setResult(data);
            } catch (err: any) {
                setError(err.message || String(err));
            }
        });
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Initialize Daily Schedule Positions</h1>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        School ID
                    </label>
                    <input
                        type="text"
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter School ID"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specific Date (Optional)
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to update all days for this school.</p>
                </div>

                <div className="mt-6">
                    <ActionBtn
                        label={isPending ? "Running..." : "Run Migration"}
                        func={handleRunMigration}
                        isDisabled={isPending || !schoolId}
                        isLoading={isPending}
                        style={{}}
                    />
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                    <h3 className="font-bold mb-2">Error:</h3>
                    <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                </div>
            )}

            {result && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-900">
                    <h3 className="font-bold mb-2">Success!</h3>
                    <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
