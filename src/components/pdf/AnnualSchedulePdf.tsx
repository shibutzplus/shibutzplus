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
        padding: 16,
    },
    header: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'RubikMedium',
        color: '#1e293b',
        direction: 'rtl',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: '#E1E1EC',
        borderRadius: 6,
        padding: 2.5,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    row: {
        flexDirection: 'row-reverse',
        marginBottom: 2.5,
        alignItems: 'stretch',
    },
    headerRow: {
        marginBottom: 2.5,
    },
    cellWrapper: {
        flexGrow: 1,
        flexBasis: 0,
        paddingHorizontal: 1.5,
        justifyContent: 'center',
    },
    hourCell: {
        width: 26,
        flexGrow: 0,
        flexShrink: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hourText: {
        fontSize: 10.5,
        fontFamily: 'RubikMedium',
        color: '#475569',
        textAlign: 'center',
    },
    headerCell: {
        backgroundColor: '#E1E1EC',
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    headerText: {
        fontSize: 10,
        fontFamily: 'RubikMedium',
        color: '#334155',
        textAlign: 'center',
    },
    cellCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#CBD5E1',
        paddingVertical: 3,
        paddingHorizontal: 2,
        width: '100%',
        minHeight: 46,
        justifyContent: 'center',
        alignItems: 'center',
    },
    singleGroup: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    primaryText: {
        fontSize: 9.5,
        fontFamily: 'RubikMedium',
        color: '#334155',
        textAlign: 'center',
        lineHeight: 1.2,
    },
    subjectChip: {
        backgroundColor: '#FFFFFF',
        borderWidth: 0.8,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingVertical: 1.5,
        paddingHorizontal: 6,
        marginTop: 2.5,
        alignSelf: 'center',
    },
    subjectChipText: {
        fontSize: 7.5,
        fontFamily: 'Rubik',
        color: '#475569',
        textAlign: 'center',
    },
    subjectPlain: {
        alignSelf: 'center',
    },
    multiGroups: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    assignmentRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 1.5,
    },
    primaryInlineText: {
        fontSize: 7.5,
        fontFamily: 'RubikMedium',
        color: '#334155',
        textAlign: 'center',
        marginLeft: 3,
    },
    subjectChipSmall: {
        backgroundColor: '#FFFFFF',
        borderWidth: 0.6,
        borderColor: '#CBD5E1',
        borderRadius: 6,
        paddingVertical: 1,
        paddingHorizontal: 4,
        alignSelf: 'center',
    },
    subjectChipSmallText: {
        fontSize: 6.5,
        fontFamily: 'Rubik',
        color: '#475569',
        textAlign: 'center',
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
    let title = "מערכת שבועית";
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
        if (!currentSchedule) {
            return <View style={styles.cellCard} />;
        }

        const dayData = currentSchedule[day];
        if (!dayData) {
            return <View style={styles.cellCard} />;
        }

        const cellData = dayData[hour];
        if (!cellData) {
            return <View style={styles.cellCard} />;
        }

        const { assignmentGroups, shouldRender } = getAnnualCellDisplayData(
            cellData,
            selectedClassId,
            selectedTeacherId,
            subjects,
            teachers,
            classes
        );

        if (!shouldRender || assignmentGroups.length === 0) {
            return <View style={styles.cellCard} />;
        }

        const isSingle = assignmentGroups.length === 1;

        if (isSingle) {
            const group = assignmentGroups[0];
            return (
                <View style={styles.cellCard}>
                    <View style={styles.singleGroup}>
                        {group.primaryText ? (
                            <Text style={styles.primaryText}>{group.primaryText}</Text>
                        ) : null}
                        {group.subjectText ? (
                            <View style={group.primaryText ? styles.subjectChip : styles.subjectPlain}>
                                <Text style={group.primaryText ? styles.subjectChipText : styles.primaryText}>
                                    {group.subjectText}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.cellCard}>
                <View style={styles.multiGroups}>
                    {assignmentGroups.map((group, idx) => (
                        <View key={idx} style={styles.assignmentRow}>
                            {group.primaryText ? (
                                <Text style={styles.primaryInlineText}>{group.primaryText}</Text>
                            ) : null}
                            {group.subjectText ? (
                                <View style={group.primaryText ? styles.subjectChipSmall : styles.subjectPlain}>
                                    <Text style={group.primaryText ? styles.subjectChipSmallText : styles.primaryInlineText}>
                                        {group.subjectText}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    ))}
                </View>
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
                        <View style={styles.hourCell}>
                            <Text></Text>
                        </View>
                        {/* Day Headers */}
                        {DAYS_OF_WORK_WEEK.map((dayLabel, index) => (
                            <View key={index} style={styles.cellWrapper}>
                                <View style={styles.headerCell}>
                                    <Text style={styles.headerText}>יום {dayLabel}׳</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Hours Rows */}
                    {Array.from({ length: rowsCount }, (_, i) => i + fromHour).map(hour => (
                        <View key={hour} style={styles.row}>
                            <View style={styles.hourCell}>
                                <Text style={styles.hourText}>{hour}</Text>
                            </View>
                            {DAYS_OF_WORK_WEEK.map((dayChar, index) => (
                                <View key={index} style={styles.cellWrapper}>
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
