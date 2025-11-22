"use client";

import React, { useState } from "react";
import styles from "./DailyPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import { useMobileSize } from "@/hooks/useMobileSize";
import router from "@/routes";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import { useDailyTableContext } from "@/context/DailyTableContext";
import usePublish from "@/hooks/usePublish";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";
import { EventColor, ExistingTeacherColor, MissingTeacherColor } from "@/style/root";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import MobileNavLayout from "../../MobileNavLayout/MobileNavLayout";

type DailyPageLayoutProps = {
    children: React.ReactNode;
};

export default function DailyPageLayout({ children }: DailyPageLayoutProps) {
    const {
        addNewEmptyColumn,
        daysSelectOptions,
        selectedDate,
        isLoading,
        isEditMode,
        handleDayChange,
        changeDailyMode,
    } = useDailyTableContext();

    const {
        publishDailySchedule,
        isLoading: publishLoading,
        onShareLink,
        isDisabled,
    } = usePublish();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isMobile = useMobileSize();

    return (
        <>
            <div className={styles.pageLayout}>
                <header className={styles.topNavLayout}>
                    <section className={styles.topNavSection}>
                        <div className={styles.topNavRight}>
                            <HamburgerButton
                                onClick={() => setIsMenuOpen((v) => !v)}
                                isOpen={isMenuOpen}
                            />
                            <h3>{router.dailySchedule.title}</h3>
                            {!isMobile ? (
                                <div className={styles.topNavSelectContainer}>
                                    <div className={styles.selectContainer}>
                                        <DynamicInputSelect
                                            options={daysSelectOptions()}
                                            value={selectedDate}
                                            isDisabled={isLoading || !isEditMode}
                                            onChange={handleDayChange}
                                            isSearchable={false}
                                            placeholder="בחרו יום..."
                                            hasBorder
                                        />
                                    </div>

                                    {isEditMode ? (
                                        <>
                                            <ActionBtn
                                                type={ColumnTypeValues.missingTeacher}
                                                Icon={<Icons.addTeacher size={16} />}
                                                label="שיבוץ למורה חסר"
                                                isDisabled={isLoading}
                                                style={{
                                                    borderLeft: `10px solid ${MissingTeacherColor}`,
                                                }}
                                                func={() =>
                                                    addNewEmptyColumn(
                                                        ColumnTypeValues.missingTeacher,
                                                    )
                                                }
                                            />
                                            <ActionBtn
                                                type={ColumnTypeValues.existingTeacher}
                                                Icon={<Icons.addTeacher size={16} />}
                                                label="שיבוץ למורה נוכח"
                                                isDisabled={isLoading}
                                                style={{
                                                    borderLeft: `10px solid ${ExistingTeacherColor}`,
                                                }}
                                                func={() =>
                                                    addNewEmptyColumn(
                                                        ColumnTypeValues.existingTeacher,
                                                    )
                                                }
                                            />
                                            <ActionBtn
                                                type={ColumnTypeValues.event}
                                                Icon={<Icons.event size={16} />}
                                                label="שיבוץ ארוע"
                                                isDisabled={isLoading}
                                                style={{ borderLeft: `10px solid ${EventColor}` }}
                                                func={() =>
                                                    addNewEmptyColumn(ColumnTypeValues.event)
                                                }
                                            />
                                        </>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                        <div className={styles.topNavLeft}>
                            <div className={styles.topNavBtnContainer}>
                                <span title="תצוגה מקדימה">
                                    <IconBtn
                                        title="תצוגה מקדימה כפי שמורים רואים את המערכת"
                                        Icon={
                                            isEditMode ? (
                                                <Icons.eye size={20} />
                                            ) : (
                                                <Icons.edit size={20} />
                                            )
                                        }
                                        onClick={changeDailyMode}
                                        disabled={publishLoading}
                                        hasBorder
                                    />
                                </span>

                                <span title="פרסום">
                                    <IconBtn
                                        Icon={
                                            isDisabled ? (
                                                <Icons.success2 size={20} />
                                            ) : (
                                                <Icons.publish size={20} />
                                            )
                                        }
                                        isLoading={publishLoading}
                                        onClick={publishDailySchedule}
                                        disabled={isDisabled}
                                        hasBorder
                                    />
                                </span>

                                <span title="שיתוף קישור למורים מן המניין">
                                    <IconBtn
                                        Icon={<Icons.share size={16} />}
                                        onClick={onShareLink}
                                        disabled={publishLoading}
                                        hasBorder
                                    />
                                </span>
                            </div>
                            <Logo size="S" />
                        </div>
                    </section>
                    {isMobile ? (
                        <div className={styles.bottomNav}>
                            <DynamicInputSelect
                                options={daysSelectOptions()}
                                value={selectedDate}
                                isDisabled={isLoading}
                                onChange={handleDayChange}
                                isSearchable={false}
                                placeholder="בחר יום..."
                                hasBorder
                            />
                        </div>
                    ) : null}
                </header>
                <main className={styles.mainContent}>{children}</main>
            </div>
            {isMobile ? (
                <MobileNavLayout>
                    <ActionBtn
                        type={ColumnTypeValues.missingTeacher}
                        Icon={<Icons.addTeacher size={16} />}
                        label="חסר"
                        isDisabled={isLoading}
                        style={{
                            borderTop: `10px solid ${MissingTeacherColor}`,
                        }}
                        func={() => addNewEmptyColumn(ColumnTypeValues.missingTeacher)}
                    />
                    <ActionBtn
                        type={ColumnTypeValues.existingTeacher}
                        Icon={<Icons.addTeacher size={16} />}
                        label="נוכח"
                        isDisabled={isLoading}
                        style={{
                            borderTop: `10px solid ${ExistingTeacherColor}`,
                        }}
                        func={() => addNewEmptyColumn(ColumnTypeValues.existingTeacher)}
                    />
                    <ActionBtn
                        type={ColumnTypeValues.event}
                        Icon={<Icons.event size={16} />}
                        label="אירוע"
                        isDisabled={isLoading}
                        style={{ borderTop: `10px solid ${EventColor}` }}
                        func={() => addNewEmptyColumn(ColumnTypeValues.event)}
                    />
                </MobileNavLayout>
            ) : null}
            <HamburgerNav
                hamburgerType="private"
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
}
