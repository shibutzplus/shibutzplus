"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// For the installatiion process:
// This component handles the dynamic start_url based on the user's context 
// Teacher Portal vs Manager Portal

// Change the version only when you change the design of the manifest (icon, color, name)
const APP_VERSION = "2.0.0";

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

            const manifestUrl = `/api/manifest?start_url=${encodeURIComponent(startUrl)}&v=${APP_VERSION}`;

            // Find existing link or create new one
            let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'manifest';
                document.head.appendChild(link);
            }

            const fullManifestUrl = window.location.origin + manifestUrl;
            if (link.href !== fullManifestUrl) {
                link.href = manifestUrl;
            }
        };

        updateManifest();
        window.addEventListener("teacher_data_updated", updateManifest);
        return () => window.removeEventListener("teacher_data_updated", updateManifest);
    }, [pathname]);

    return null;
};

export default DynamicManifest;
