"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { usePublicPortal } from "@/context/PublicPortalContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { DailyScheduleType } from "@/models/types/dailySchedule";

const TeacherPortalPage = () => {
    const params = useParams();
    const teacherId = params.teacherId as string;
    const { teacher, populateTeacherTable } = usePublicPortal();

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        const setTeacher = async () => {
            if (blockRef.current) {
                const response = await populateTeacherTable(teacherId);
                if (response) {
                    blockRef.current = false;
                } else {
                    errorToast(messages.dailySchedule.error);
                }
            }
        };
        setTeacher();
    }, [teacherId]);

    const { teacherTableData } = usePublicPortal();

    // Map hour to row
    const hourRows: { [hour: number]: DailyScheduleType | undefined } = {};
    teacherTableData.forEach((row: DailyScheduleType) => {
        hourRows[row.hour] = row;
    });

    return (
        <div>
            <h1>מערכת שעות יומית</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>שעה</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>כיתה</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>מקצוע</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>אירוע</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>חומרי לימוד</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>קישורים</th>
                    </tr>
                </thead>
                <tbody>
                    {[1,2,3,4,5,6,7].map(hour => {
                        const row = hourRows[hour];
                        return (
                            <tr key={hour}>
                                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{hour}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{row?.class?.name || ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{row?.subject?.name || ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{row?.eventTitle || row?.event || ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}></td>
                                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherPortalPage;
