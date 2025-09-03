import type React from "react";
import type { TopKind } from "./CommonTopNav";

export type CommonTopNavConfig = {
  kind: TopKind;
  greetingName?: string | null;
  actions?: React.ReactNode;
  dropdowns?: React.ReactNode;
  usePageTitle?: boolean;
  sticky?: boolean;
  showHamburger?: boolean;
};

export const commonTopNavDefaults: CommonTopNavConfig = {
  kind: "list",
  usePageTitle: true,
  sticky: true,
  showHamburger: true,
};

export const makeCommonTopNav = (
  overrides: Partial<CommonTopNavConfig>
): CommonTopNavConfig => ({ ...commonTopNavDefaults, ...overrides });
