import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { DailySchedule, ColumnTypeValues, ColumnType } from '@/models/types/dailySchedule';
import { RubikRegularBase64, RubikMediumBase64 } from '@/components/pdf/fontData';
import { sortDailyColumnIdsByPosition } from '@/utils/sort';
import { getCellDisplayData } from '@/utils/dailyCellDisplay';

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
        flexDirection: 'row-reverse', // RTL: first child is right-most
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 30, // Minimum height for rows
        alignItems: 'stretch', // Ensure cells stretch to row height
    },
    headerRow: {
        backgroundColor: '#f0f0f0',
        fontFamily: 'RubikMedium',
    },
    cell: {
        padding: 4,
        textAlign: 'center',
        fontSize: 9,
        borderLeftWidth: 1,
        borderLeftColor: '#000',
        flexGrow: 1,
        justifyContent: 'center',
        width: '10%', // Base width, flexGrow will expand
        minWidth: 50,
    },
    headerCell: {
        backgroundColor: '#e0e0e0',
        fontFamily: 'RubikMedium',
        fontSize: 10,
    },
    rowNumCell: {
        width: 30,
        minWidth: 30,
        maxWidth: 30,
        backgroundColor: '#e0e0e0',
        fontFamily: 'RubikMedium',
        flexGrow: 0,
    },
    cellText: {
        marginBottom: 2,
        direction: 'rtl',
    },
    subTeacherText: {
        color: '#444',
        fontSize: 8,
        direction: 'rtl',
    },
    missingText: {
        color: 'red',
        fontSize: 8,
        direction: 'rtl',
    },
    headerText: {
        fontFamily: 'RubikMedium',
        direction: 'rtl',
    },
});

interface DailySchedulePdfProps {
    mainDailyTable: DailySchedule;
    selectedDate: string;
}

const COLOR_BY_TYPE: Record<string, string> = {
    missingTeacher: '#ED7A7A', // MissingTeacherColor
    existingTeacher: '#80B0FF', // ExistingTeacherColor
    event: '#6EBE6A', // EventColor
    empty: 'transparent',
};

const DailySchedulePdf: React.FC<DailySchedulePdfProps> = ({ mainDailyTable, selectedDate }) => {
    const schedule = mainDailyTable[selectedDate] || {};
    const columnIds = Object.keys(schedule);
    const sortedColumnIds = sortDailyColumnIdsByPosition(columnIds, schedule);

    // Build column types map once (similar to PreviewTable logic)
    const columnTypes: Record<string, ColumnType> = {};
    sortedColumnIds.forEach((colId) => {
        const columnData = schedule[colId];
        if (!columnData) return;

        const colFirstObj = columnData["1"] || Object.values(columnData).find((cell) => cell?.headerCol?.type);
        columnTypes[colId] = colFirstObj?.headerCol?.type || "event";
    });

    // Calculate the maximum hour that has data
    let maxHour = 0;
    columnIds.forEach((colId) => {
        const colData = schedule[colId];
        const columnType = columnTypes[colId] || 'empty';

        Object.keys(colData).forEach((hourKey) => {
            const hour = parseInt(hourKey);
            // Skip non-numeric keys or headerCol (if stored as a key, though usually nested)
            if (isNaN(hour)) return;

            const cell = colData[hourKey];
            const { text, subTeacherName, isMissing, isEmpty } = getCellDisplayData(cell, columnType);

            // If the cell produces any visible content, update maxHour
            if (!isEmpty) {
                if (hour > maxHour) {
                    maxHour = hour;
                }
            }
        });
    });

    // Ensure we have at least some rows if table is empty, or strictly follow maxHour
    // User requested removing empty end rows but keeping at least 6.
    const usedMaxHour = Math.max(maxHour, 6);
    const rows = Array.from({ length: usedMaxHour }, (_, i) => i + 1);

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Text style={styles.header}>מערכת יומית - {selectedDate}</Text>

                <View style={styles.table}>
                    {/* Header Row */}
                    <View style={[styles.row, styles.headerRow]}>
                        {/* Corner Cell (Rightmost because of row-reverse) */}
                        <View style={[styles.cell, styles.rowNumCell]}>
                            <Text></Text>
                        </View>

                        {/* Column Headers */}
                        {sortedColumnIds.map((colId) => {
                            const colData = schedule[colId];
                            // Find first cell with header data
                            const firstCellKey = Object.keys(colData).find(key => colData[key]?.headerCol);
                            const headerCol = colData[firstCellKey || "1"]?.headerCol;

                            let headerTitle = "";
                            let headerColor = "#e0e0e0";

                            if (headerCol) {
                                if (headerCol.type === ColumnTypeValues.event) {
                                    headerTitle = headerCol.headerEvent || "אירוע";
                                } else {
                                    headerTitle = headerCol.headerTeacher?.name || "";
                                }
                                headerColor = COLOR_BY_TYPE[headerCol.type] || "#e0e0e0";
                            }

                            return (
                                <View key={colId} style={[styles.cell, styles.headerCell, { backgroundColor: headerColor }]}>
                                    <Text style={styles.headerText}>{headerTitle}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Data Rows */}
                    {rows.map((hour) => (
                        <View key={hour} style={styles.row}>
                            {/* Row Number (Rightmost) */}
                            <View style={[styles.cell, styles.rowNumCell]}>
                                <Text style={styles.headerText}>{hour}</Text>
                            </View>

                            {/* Data Cells */}
                            {sortedColumnIds.map((colId) => {
                                const colData = schedule[colId];
                                const cell = colData?.[hour];
                                const columnType = columnTypes[colId] || 'empty';

                                const { text, subTeacherName, isMissing, isEmpty } = getCellDisplayData(cell, columnType);

                                return (
                                    <View key={colId} style={styles.cell}>
                                        {!isEmpty && (
                                            <>
                                                <Text style={styles.cellText}>{text}</Text>
                                                {subTeacherName ? (
                                                    <Text style={styles.subTeacherText}>{subTeacherName}</Text>
                                                ) : isMissing ? (
                                                    <Text style={styles.missingText}>אין ממלא מקום</Text>
                                                ) : null}
                                            </>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};

export default DailySchedulePdf;
