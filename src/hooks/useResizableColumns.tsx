import React from "react";

type UseResizableOpts = {
  count: number;                  // number of columns
  initial?: number[];             // optional initial widths in px
  min?: number;                   // min width per column
  max?: number;                   // max width per column
};

export function useResizableColumns({ count, initial, min = 60, max = 640 }: UseResizableOpts) {
  const [widths, setWidths] = React.useState<number[]>(
    () => Array.from({ length: count }, (_, i) => initial?.[i] ?? 120)
  );
  const tableRef = React.useRef<HTMLTableElement | null>(null);
  const dir = typeof window !== "undefined" ? document.dir || "ltr" : "ltr";
  const inlineEdge = dir === "rtl" ? "left" : "right"; // handle side

  // Create a stable setter for a specific column
  const setWidth = React.useCallback((index: number, px: number) => {
    setWidths((prev) => {
      const next = [...prev];
      next[index] = Math.min(max, Math.max(min, Math.round(px)));
      return next;
    });
  }, [min, max]);

  // Start drag for a given column index
  const startResize = React.useCallback((index: number, startClientX: number) => {
    const table = tableRef.current;
    if (!table) return;
    const startWidth = widths[index];

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const delta = clientX - startClientX;
      const signed = dir === "rtl" ? -delta : delta;
      setWidth(index, startWidth + signed);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove as any);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove as any, { passive: false } as any);
      document.removeEventListener("touchend", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", onMove as any);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove as any, { passive: false } as any);
    document.addEventListener("touchend", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [dir, setWidth, widths]);

  const handleProps = (index: number) => ({
    onMouseDown: (e: React.MouseEvent) => startResize(index, e.clientX),
    onTouchStart: (e: React.TouchEvent) => startResize(index, e.touches[0].clientX),
    "data-colindex": index,
    style: {
      position: "absolute" as const,
      top: 0,
      [inlineEdge]: 0,
      width: 6,
      height: "100%",
      cursor: "col-resize",
      userSelect: "none" as const,
      touchAction: "none" as const,
    },
  });

  // Render a <colgroup> matching the widths
  const ColGroup = React.useCallback(() => (
    <colgroup>
      {widths.map((w, i) => <col key={i} style={{ width: `${w}px` }} />)}
    </colgroup>
  ), [widths]);

  return { tableRef, widths, setWidth, handleProps, ColGroup };
}

export const ResizableTH: React.FC<
  React.PropsWithChildren<{ index: number; handleProps: (i: number) => any; className?: string; }>
> = ({ index, handleProps, className, children }) => {
  return (
    <th className={className}>
      <div style={{ position: "relative", width: "100%" }}>
        <div style={{ padding: "8px 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {children}
        </div>
        <div
          {...handleProps(index)}
          style={{
            position: "absolute",
            top: 0,
            insetInlineEnd: "-7px",
            width: "15px",
            height: "100%",
            cursor: "col-resize",
            userSelect: "none",
            touchAction: "none",
          }}
        />
      </div>
    </th>
  );
};
