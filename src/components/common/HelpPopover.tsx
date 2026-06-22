import { useState, type ReactNode } from "react";

interface HelpPopoverProps {
  label: string;
  children: ReactNode;
}

/**
 * Accessible help popover triggered by a small "?" button.
 * Shows content above the trigger on focus/hover.
 */
export function HelpPopover({ label, children }: HelpPopoverProps) {
  const [visible, setVisible] = useState(false);
  const id = `popover-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <span className="popover-anchor">
      <button
        type="button"
        className="popover-trigger"
        aria-label={`Help: ${label}`}
        aria-describedby={id}
        aria-expanded={visible}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        ?
      </button>
      {visible && (
        <span
          id={id}
          role="tooltip"
          className="popover-content"
          aria-live="polite"
        >
          {children}
        </span>
      )}
    </span>
  );
}
