"use client";
import React from "react";
import styles from "./annualSchedule.module.css";
import { DAYS_OF_WORK_WEEK, HOURS_IN_DAY } from "@/utils/time";

const SkeletonCell: React.FC = () => (
  <td className={styles.scheduleCell}>
    <div
      style={{
        height: 100,
        borderRadius: 6,
        background: "#e0e0e0",
        width: 305,
        margin: "0 auto",
        marginTop: 8,
        marginBottom: 8,
        animation: "skeleton-loading 1.4s ease-in-out infinite alternate"
      }}
    />
  </td>
);

const SkeletonRow: React.FC<{ hour: number }> = ({ hour }) => (
  <tr>
    <td className={styles.hourCell}>
      <div
        style={{
          height: 24,
          width: 36,
          borderRadius: 6,
          background: "#e0e0e0",
          margin: "0 auto",
          animation: "skeleton-loading 1.4s ease-in-out infinite alternate"
        }}
      />
    </td>
    {DAYS_OF_WORK_WEEK.map((_, colIdx) => (
      <SkeletonCell key={colIdx} />
    ))}
  </tr>
);

const SkeletonAnnualSchedule: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.whiteBox}>
        <div className={styles.tableContainer}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th className={styles.hourHeader}></th>
                {DAYS_OF_WORK_WEEK.map((day, idx) => (
                  <th className={styles.dayHeader} key={day + idx}>
                    <div
                      style={{
                        height: 20,
                        width: 60,
                        borderRadius: 6,
                        background: "#e0e0e0",
                        margin: "0 auto",
                        animation: "skeleton-loading 1.4s ease-in-out infinite alternate"
                      }}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: HOURS_IN_DAY }, (_, i) => (
                <SkeletonRow key={i + 1} hour={i + 1} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx global>{`
        @keyframes skeleton-loading {
          0% {
            background-color: #e0e0e0;
          }
          100% {
            background-color: #c8c8c8;
          }
        }
      `}</style>
    </div>
  );
};

export default SkeletonAnnualSchedule;
