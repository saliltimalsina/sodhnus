import type { SVGProps } from "react";

// One line-icon family: 24px grid, 1.6 stroke, round caps.
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const icons = {
  passport: (p: IconProps) => (
    <Icon {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M9 16.5h6" />
    </Icon>
  ),
  land: (p: IconProps) => (
    <Icon {...p}>
      <path d="m3 7 6-3 6 3 6-3v13l-6 3-6-3-6 3z" />
      <path d="M9 4v13M15 7v13" />
    </Icon>
  ),
  health: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
      <path d="M12 9v6M9 12h6" />
    </Icon>
  ),
  tax: (p: IconProps) => (
    <Icon {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h4" />
    </Icon>
  ),
  id: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.5 16c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2M14 10h4M14 13.5h3" />
    </Icon>
  ),
  education: (p: IconProps) => (
    <Icon {...p}>
      <path d="m2 9 10-5 10 5-10 5z" />
      <path d="M6 11v5c2 1.7 4 2.5 6 2.5s4-.8 6-2.5v-5M22 9v6" />
    </Icon>
  ),
  home: (p: IconProps) => (
    <Icon {...p}>
      <path d="m3 11 9-7 9 7" />
      <path d="M5 9.5V20h14V9.5M10 20v-5h4v5" />
    </Icon>
  ),
  licence: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M3.5 10h6M14.5 10h6M12 14.5V21" />
    </Icon>
  ),
  work: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18" />
    </Icon>
  ),
  plane: (p: IconProps) => (
    <Icon {...p}>
      <path d="M10.5 13.5 3 11l1.5-1.5 7 1 4-4.5c1-1 2.8-1.5 3.5-.8s.2 2.5-.8 3.5L13.5 13l1 7L13 21.5z" />
    </Icon>
  ),
  family: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="8" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M3 20c0-3.3 2.2-6 5-6s5 2.7 5 6M14 20c0-2.5 1.3-4.5 3-4.5s3 2 3 4.5" />
    </Icon>
  ),
  vote: (p: IconProps) => (
    <Icon {...p}>
      <path d="M4 13h16v7H4zM8 13V6l6-2 2 5-5 4" />
    </Icon>
  ),
  building: (p: IconProps) => (
    <Icon {...p}>
      <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6M9 11h.01M15 11h.01" />
    </Icon>
  ),
  document: (p: IconProps) => (
    <Icon {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Icon>
  ),
  mapPin: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  ),
  arrow: (p: IconProps) => (
    <Icon {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  ),
  arrowUpRight: (p: IconProps) => (
    <Icon {...p}>
      <path d="M7 17 17 7M9 7h8v8" />
    </Icon>
  ),
  check: (p: IconProps) => (
    <Icon {...p}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Icon>
  ),
  mic: (p: IconProps) => (
    <Icon {...p}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    </Icon>
  ),
  info: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Icon>
  ),
  close: (p: IconProps) => (
    <Icon {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  ),
  pause: (p: IconProps) => (
    <Icon {...p}>
      <path d="M9 5v14M15 5v14" />
    </Icon>
  ),
  play: (p: IconProps) => (
    <Icon {...p}>
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </Icon>
  ),
  chevronLeft: (p: IconProps) => (
    <Icon {...p}>
      <path d="m15 5-7 7 7 7" />
    </Icon>
  ),
  chevronRight: (p: IconProps) => (
    <Icon {...p}>
      <path d="m9 5 7 7-7 7" />
    </Icon>
  ),
};

export type IconName = keyof typeof icons;
