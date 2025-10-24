"use client";

import TopNavLayout from "@/components/layout/TopNavLayout/TopNavLayout";
import router from "@/routes";
import styles from "./PortalTopNav.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import PortalNav from "../../PortalNav/PortalNav";
import { usePortal } from "@/context/PortalContext";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import { usePathname } from "next/navigation";
import { errorToast } from "@/lib/toast";
import { usePollingUpdates } from "@/hooks/usePollingUpdates";

const PortalTopNav: React.FC = () => {
    const pathname = usePathname();
    const { hasUpdate, resetUpdate } = usePollingUpdates();

    const {
        teacher,
        selectedDate,
        isPortalLoading,
        publishDatesOptions,
        handleDayChange,
        fetchPortalScheduleDate,
        fetchPublishScheduleData,
        refreshPublishDates,
    } = usePortal();

    const handleRefresh = async () => {
        const datesRes = await refreshPublishDates();

        let response;
        if (pathname.includes(router.teacherPortal.p)) {
            response = await fetchPortalScheduleDate();
        } else {
            response = await fetchPublishScheduleData();
        }

        if (
            (!response.success && response.error !== "") ||
            (!datesRes.success && datesRes.error !== "")
        ) {
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
        }

        // reset update badge after successful refresh
        resetUpdate();
    };

    return (
        <TopNavLayout
            type="portal"
            childrens={{
                left: <PortalNav />,
                right: (
                    <div className={styles.rightContainer}>
                        <div>{`שלום ${teacher?.name ?? ""}`}</div>
                        <div className={styles.selectContainer}>
                            <DynamicInputSelect
                                options={publishDatesOptions}
                                value={selectedDate}
                                isDisabled={isPortalLoading}
                                onChange={handleDayChange}
                                isSearchable={false}
                                placeholder="בחר יום..."
                                hasBorder
                            />
                        </div>

                        <div
                            className={`${styles.refreshContainer} ${hasUpdate ? styles.refreshAlert : ""}`}
                        >
                            <IconBtn
                                Icon={<Icons.refresh size={26} />}
                                onClick={handleRefresh}
                                disabled={isPortalLoading}
                                isLoading={isPortalLoading}
                            />
                        </div>
                    </div>
                ),
            }}
        />
    );
};

export default PortalTopNav;
