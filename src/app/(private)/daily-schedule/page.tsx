"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import DailyTable from "@/components/dailyScheduleTable/DailyTable/DailyTable";
import DailySkeleton from "@/components/layout/skeleton/DailySkeleton/DailySkeleton";
import { useDailyTableContext } from "@/context/DailyTableContext";
import styles from "./DailySchedule.module.css";

const DailySchedulePage: NextPage = () => {
  const { isLoading } = useDailyTableContext();

  // Run scroll sync only after data is loaded and DOM is rendered
  useEffect(() => {
    if (isLoading) return;

    const inner = document.querySelector<HTMLElement>('[class*="scrollableContent"]');
    const bar = document.getElementById("bottomScroller") as HTMLElement | null;
    if (!inner || !bar) return;

    const barInner = bar.firstElementChild as HTMLElement;
    const measured = (inner.querySelector("table") as HTMLElement) || inner;

    const max = (el: HTMLElement) => Math.max(0, el.scrollWidth - el.clientWidth);
    const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

    let ratio = 1;
    let lock = false;
    let rafId: number | null = null;

    const recalc = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        lock = true;

        const mInnerBefore = max(inner) || 1;
        const relInner = inner.scrollLeft / mInnerBefore;

        const needWidth = measured.scrollWidth;
        if (barInner.style.width !== needWidth + "px") {
          barInner.style.width = needWidth + "px";
        }

        const mBar = max(bar);
        const mInner = max(inner);
        ratio = mInner ? mBar / mInner : 1;

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

    const ro1 = new ResizeObserver(() => recalc());
    const ro2 = new ResizeObserver(() => recalc());
    ro1.observe(measured);
    ro2.observe(inner);

    window.addEventListener("resize", recalc, { passive: true });
    bar.addEventListener("scroll", onBar, { passive: true });
    inner.addEventListener("scroll", onInner, { passive: true });

    recalc();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro1.disconnect();
      ro2.disconnect();
      window.removeEventListener("resize", recalc);
      bar.removeEventListener("scroll", onBar);
      inner.removeEventListener("scroll", onInner);
    };
  }, [isLoading]);

  if (isLoading) return <DailySkeleton />;

  return (
    <section className={styles.container}>
      <DailyTable />
      <div
        id="bottomScroller"
        className={styles.bottomScroller}
        aria-label="horizontal scroller"
      >
        <div className={styles.bottomInner} />
      </div>
    </section>
  );
};

export default DailySchedulePage;
