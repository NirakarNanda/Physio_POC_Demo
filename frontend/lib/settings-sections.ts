export interface SettingsSection {
  value: string;
  label: string;
  hint: string;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    value: "appointments",
    label: "Booking defaults",
    hint: "Your standard consultation fee, pre-filled on every booking.",
  },
  {
    value: "appearance",
    label: "Appearance",
    hint: "Light, dark, or follow this device automatically.",
  },
  {
    value: "data",
    label: "Data export",
    hint: "Download patients and appointments as CSV files.",
  },
  {
    value: "security",
    label: "Security",
    hint: "Change your sign-in password.",
  },
];

export function settingsSectionHref(value: string) {
  return `/settings?section=${encodeURIComponent(value)}`;
}
