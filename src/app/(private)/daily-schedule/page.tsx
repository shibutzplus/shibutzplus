"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import DailyTable from "@/components/dailyScheduleTable/DailyTable/DailyTable";
import styles from "./DailySchedule.module.css";
import MobileNav from "@/components/navigation/MobileNav/MobileNav";
import { useMobileSize } from "@/hooks/useMobileSize";

const DailySchedulePage: NextPage = () => {
  const isMobile = useMobileSize();

  // replace your whole useEffect with this one (English-only comments)
  useEffect(() => {
    const inner = document.querySelector<HTMLElement>('[class*="scrollableContent"]');
    const bar = document.getElementById("bottomScroller") as HTMLElement | null;
    if (!inner || !bar) return;

    const barInner = bar.firstElementChild as HTMLElement;
    const measured = (inner.querySelector("table") as HTMLElement) || inner;

    const max = (el: HTMLElement) => Math.max(0, el.scrollWidth - el.clientWidth);
    const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

    let ratio = 1;
    let lock = false;        // prevents feedback loops
    let rafId: number | null = null;

    const recalc = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        lock = true;

        // keep relative position before we mutate widths
        const mInnerBefore = max(inner) || 1;
        const relInner = inner.scrollLeft / mInnerBefore;

        const needWidth = measured.scrollWidth;
        if (barInner.style.width !== needWidth + "px") {
          barInner.style.width = needWidth + "px";
        }

        const mBar = max(bar);
        const mInner = max(inner);
        ratio = mInner ? mBar / mInner : 1;

        // restore by relative position (stable even if ranges changed)
        const innerX = clamp(Math.round(relInner * (mInner || 0)), 0, mInner);
        const barX = clamp(Math.round(innerX * ratio), 0, mBar);

        if (inner.scrollLeft !== innerX) inner.scrollLeft = innerX;
        if (bar.scrollLeft !== barX) bar.scrollLeft = barX;

        lock = false;
      });
    };

    const onBar = () => {
      if (lock) return;
      lock = true;
      inner.scrollLeft = bar.scrollLeft / (ratio || 1);
      lock = false;
    };

    const onInner = () => {
      if (lock) return;
      lock = true;
      bar.scrollLeft = inner.scrollLeft * (ratio || 1);
      lock = false;
    };

    // listen to true size changes only (typing won't trigger this)
    const ro1 = new ResizeObserver(() => recalc());
    const ro2 = new ResizeObserver(() => recalc());
    ro1.observe(measured);
    ro2.observe(inner);

    window.addEventListener("resize", recalc, { passive: true });
    bar.addEventListener("scroll", onBar, { passive: true });
    inner.addEventListener("scroll", onInner, { passive: true });

    // initial alignment
    recalc();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro1.disconnect();
      ro2.disconnect();
      window.removeEventListener("resize", recalc);
      bar.removeEventListener("scroll", onBar);
      inner.removeEventListener("scroll", onInner);
    };
  }, []);


  return (
    <section className={styles.container}>
      <DailyTable />
      <div id="bottomScroller" className={styles.bottomScroller} aria-label="horizontal scroller">
        <div className={styles.bottomInner} />
      </div>
      {isMobile ? <MobileNav /> : null}
    </section>
  );
};

export default DailySchedulePage;
