"use client";

import React, { createContext, useContext, useState } from "react";
import { WeeklySchedule } from "@/models/types/annualSchedule";

type Ctx = {
  selectedTeacherId?: string;
  setSelectedTeacherId: (id?: string) => void;
  schedule: Record<string, WeeklySchedule>;
  setSchedule: React.Dispatch<React.SetStateAction<Record<string, WeeklySchedule>>>;
};

const TeacherAnnualTableContext = createContext<Ctx | undefined>(undefined);

export const TeacherAnnualTableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // teacher filter state
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);
  // per-teacher schedule map: { [teacherId]: WeeklySchedule }
  const [schedule, setSchedule] = useState<Record<string, WeeklySchedule>>({});

  return (
    <TeacherAnnualTableContext.Provider
      value={{ selectedTeacherId, setSelectedTeacherId, schedule, setSchedule }}
    >
      {children}
    </TeacherAnnualTableContext.Provider>
  );
};

export const useTeacherAnnualTable = () => {
  const ctx = useContext(TeacherAnnualTableContext);
  if (!ctx) throw new Error("useTeacherAnnualTable must be used within TeacherAnnualTableProvider");
  return ctx;
};
