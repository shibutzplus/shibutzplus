"use client";

import React, { useEffect } from "react";
import { useMainContext } from "@/context/MainContext";
import { useAnnualByTeacher } from "@/context/AnnualByTeacherContext";
//NOT IN USE
// Simple inline select to keep it minimal
const TeacherAnnualTopActions: React.FC = () => {
  const { teachers } = useMainContext();
  const { selectedTeacherId, setSelectedTeacherId } = useAnnualByTeacher();

  // Auto select first teacher on initial load
  useEffect(() => {
    if (!selectedTeacherId && teachers?.length) {
      setSelectedTeacherId(teachers[0].id);
    }
  }, [teachers, selectedTeacherId, setSelectedTeacherId]);

  if (!teachers?.length) return null;

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeacherId(e.target.value || undefined);
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <label htmlFor="teacherSelect" style={{ fontWeight: 600 }}>בחר מורה</label>
      <select
        id="teacherSelect"
        value={selectedTeacherId ?? ""}
        onChange={onChange}
        style={{ padding: "6px 8px", minWidth: 220 }}
      >
        {teachers.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
};

export default TeacherAnnualTopActions;
