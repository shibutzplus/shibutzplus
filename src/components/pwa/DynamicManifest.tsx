"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// For the installatiion process:
// This component handles the dynamic start_url based on the user's context 
// Teacher Portal vs Manager Portal

const DynamicManifest = () => {
    const pathname = usePathname();

    useEffect(() => {
        const updateManifest = () => {
            let startUrl = window.location.origin + '/';
            // Only use specific teacher URL if we are currently in the Teacher Portal (public views)
            const isTeacherPortal = pathname.includes('/teacher-material/') ||
                pathname.includes('/schedule-view/') ||
                pathname.includes('/faq-teachers');

            if (isTeacherPortal) {
                try {
                    const teacherData = localStorage.getItem('teacher_data');
                    if (teacherData) {
                        const teacher = JSON.parse(teacherData);
                        if (teacher.schoolId && teacher.id) {
                            startUrl = window.location.origin + '/teacher-material/' + teacher.schoolId + '/' + teacher.id;
                        }
                    }
                } catch (e) {
                    console.error("Error reading teacher data for manifest", e);
                }
            }

            const timestamp = new Date().getTime();
            const manifestUrl = '/api/manifest?start_url=' + encodeURIComponent(startUrl) + '&ts=' + timestamp;

            // Find existing link or create new one
            let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'manifest';
                document.head.appendChild(link);
            }

            // Only update if changed to avoid unnecessary re-fetches (though browser might handle it)
            if (link.href !== window.location.origin + manifestUrl) {
                link.href = manifestUrl;
            }
        };

        updateManifest();

        window.addEventListener("teacher_data_updated", updateManifest);

        return () => {
            window.removeEventListener("teacher_data_updated", updateManifest);
        };
    }, [pathname]);

    return null;
};

export default DynamicManifest;
