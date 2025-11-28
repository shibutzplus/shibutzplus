import React from "react";
import Preloader from "@/components/ui/Preloader/Preloader";

const SkeletonHistory: React.FC = () => {
    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        }}>
            <Preloader />
        </div>
    );
};

export default SkeletonHistory;
