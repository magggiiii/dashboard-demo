const flag = (value: string | undefined, fallback = false): boolean => {
  if (value == null) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

export interface UiSystemFlags {
  uiV2: boolean;
  shell: boolean;
  sidebars: boolean;
  charts: boolean;
  dataGrid: boolean;
}

export const getUiSystemFlags = (): UiSystemFlags => {
  const uiV2 = flag(process.env.NEXT_PUBLIC_UI_V2, false);
  return {
    uiV2,
    shell: uiV2 && flag(process.env.NEXT_PUBLIC_UI_V2_SHELL, true),
    sidebars: uiV2 && flag(process.env.NEXT_PUBLIC_UI_V2_SIDEBARS, true),
    charts: uiV2 && flag(process.env.NEXT_PUBLIC_UI_V2_CHARTS, true),
    dataGrid: uiV2 && flag(process.env.NEXT_PUBLIC_UI_V2_DATA_GRID, true),
  };
};
