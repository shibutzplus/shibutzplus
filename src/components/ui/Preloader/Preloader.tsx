import React from 'react';
import styles from './Preloader.module.css';

interface PreloaderProps {
    className?: string;
    style?: React.CSSProperties;
}

const Preloader: React.FC<PreloaderProps> = ({ className, style }) => {
    return (
        <div className={`${styles.wrapper} ${className || ''}`} style={style}>
            <div className={styles.loaderContainer}>
                <div className={styles.hLine}></div>
                <div className={styles.vLine}></div>
                <div className={styles.animSquare}></div>
            </div>
            <div className={styles.plusSign}></div>
        </div>
    );
};

export default Preloader;
