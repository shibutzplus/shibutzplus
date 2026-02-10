import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { WeeklySchedule } from '@/models/types/annualSchedule';
import { ClassType } from '@/models/types/classes';
import { TeacherType } from '@/models/types/teachers';
import { SubjectType } from '@/models/types/subjects';
import { RubikRegularBase64, RubikMediumBase64 } from '@/components/pdf/fontData';
import { getAnnualCellDisplayData, getAnnualScheduleDimensions } from '@/utils/annualCellDisplay';

// Register font using Base64 data
Font.register({
    family: 'Rubik',
    fonts: [
        { src: RubikRegularBase64 },
    ],
});
Font.register({
    family: 'RubikMedium',
    src: RubikMediumBase64,
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Rubik',
        padding: 20,
    },
    header: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'RubikMedium',
        direction: 'rtl',
    },
    subHeader: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Rubik',
        direction: 'rtl',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        borderRightWidth: 1,
        borderRightColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#000',
    },
    row: {
        flexDirection: 'row-reverse',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 40,
        alignItems: 'stretch',
    },
    headerRow: {
        backgroundColor: '#f0f0f0',
        fontFamily: 'RubikMedium',
        minHeight: 30,
    },
    cell: {
        padding: 4,
        textAlign: 'center',
        fontSize: 9,
        borderLeftWidth: 1,
        borderLeftColor: '#000',
        flexGrow: 1,
        justifyContent: 'center',
        width: '14%', // Approx 100/7
    },
    hourCell: {
        width: '5%',
        backgroundColor: '#e0e0e0',
        fontFamily: 'RubikMedium',
        flexGrow: 0,
        minWidth: 30,
    },
    headerCell: {
        backgroundColor: '#e0e0e0',
        fontSize: 10,
    },
    cellText: {
        fontSize: 8,
        marginBottom: 2,
        direction: 'rtl',
    },
    subjectText: {
        fontFamily: 'RubikMedium',
    },
    teacherText: {
        color: '#444',
    },
});

interface AnnualSchedulePdfProps {
    schedule: WeeklySchedule;
    selectedClassId: string;
    selectedTeacherId: string;
    classes: ClassType[];
    teachers: TeacherType[];
    subjects: SubjectType[];
    fromHour?: number;
    toHour?: number;
}

const DAYS_OF_WORK_WEEK = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];

const AnnualSchedulePdf: React.FC<AnnualSchedulePdfProps> = ({
    schedule,
    selectedClassId,
    selectedTeacherId,
    classes,
    teachers,
    subjects,
    fromHour = 1,
    toHour = 10,
}) => {
    // Determine title
    let title = "מערכת שנתית";
    if (selectedClassId) {
        const cls = classes.find(c => c.id === selectedClassId);
        if (cls) title += ` - ${cls.name}`;
    }
    if (selectedTeacherId) {
        const teacher = teachers.find(t => t.id === selectedTeacherId);
        if (teacher) {
            title += selectedClassId ? ` (מורה: ${teacher.name})` : ` - ${teacher.name}`;
        }
    }

    // Resolve Data Access Key
    // If class selected, context uses classId as key. If only teacher selected, teacherId.
    const scheduleKey = selectedClassId || selectedTeacherId;
    const currentSchedule = scheduleKey ? schedule[scheduleKey] : null;

    const renderCellContent = (day: string, hour: string) => {
        if (!currentSchedule) return null;

        const dayData = currentSchedule[day];
        if (!dayData) return null;

        const cellData = dayData[hour];
        if (!cellData) return null;

        const { subjectsText, secondaryText, shouldRender } = getAnnualCellDisplayData(
            cellData,
            selectedClassId,
            selectedTeacherId,
            subjects,
            teachers,
            classes
        );

        if (!shouldRender) return null;

        return (
            <View>
                {subjectsText ? <Text style={[styles.cellText, styles.subjectText]}>{subjectsText}</Text> : null}
                {secondaryText ? <Text style={[styles.cellText, styles.teacherText]}>{secondaryText}</Text> : null}
            </View>
        );
    };

    // Calculate rows to display
    const { rowsCount } = getAnnualScheduleDimensions(
        currentSchedule ? { [scheduleKey]: currentSchedule } : undefined,
        selectedClassId,
        selectedTeacherId,
        toHour,
        fromHour
    );

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Text style={styles.header}>{title}</Text>

                <View style={styles.table}>
                    {/* Header Row */}
                    <View style={[styles.row, styles.headerRow]}>
                        {/* Corner Cell (Hour Column Header) */}
                        <View style={[styles.cell, styles.hourCell]}>
                            <Text></Text>
                        </View>
                        {/* Day Headers (Note! Because of Hebrew its a must to add a real apostrophe) */}
                        {DAYS_OF_WORK_WEEK.map((dayLabel, index) => (
                            <View key={index} style={[styles.cell, styles.headerCell]}>
                                <Text>יום {dayLabel}׳</Text>
                            </View>
                        ))}
                    </View>

                    {/* Hours Rows */}
                    {Array.from({ length: rowsCount }, (_, i) => i + fromHour).map(hour => (
                        <View key={hour} style={styles.row}>
                            <View style={[styles.cell, styles.hourCell]}>
                                <Text>{hour}</Text>
                            </View>
                            {DAYS_OF_WORK_WEEK.map((dayChar, index) => (
                                <View key={index} style={styles.cell}>
                                    {renderCellContent(dayChar, hour.toString())}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};

export default AnnualSchedulePdf;
