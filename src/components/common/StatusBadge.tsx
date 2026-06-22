import type { RequestStatus, PaymentStatus } from "../../types/printRequest";

const REQUEST_STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  submitted:         { label: "Submitted",        className: "badge-info" },
  reviewing:         { label: "Reviewing",         className: "badge-primary" },
  needs_more_info:   { label: "Needs Info",        className: "badge-warning" },
  accepted:          { label: "Accepted",          className: "badge-success" },
  accepted_for_quote:{ label: "Accept for Quote",  className: "badge-primary" },
  quote_draft:       { label: "Quote Draft",       className: "badge-muted" },
  quoted:            { label: "Quoted",            className: "badge-primary" },
  quote_viewed:      { label: "Quote Viewed",      className: "badge-info" },
  quote_accepted:    { label: "Quote Accepted",    className: "badge-success" },
  payment_pending:   { label: "Payment Pending",   className: "badge-warning" },
  paid:              { label: "Paid",              className: "badge-success" },
  printing:          { label: "Printing",          className: "badge-accent" },
  ready_for_pickup:  { label: "Ready for Pickup",  className: "badge-success" },
  shipped:           { label: "Shipped",           className: "badge-success" },
  completed:         { label: "Completed",         className: "badge-success" },
  declined:          { label: "Declined",          className: "badge-error" },
  canceled:          { label: "Canceled",          className: "badge-muted" },
  archived:          { label: "Archived",          className: "badge-muted" },
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  not_required: { label: "Not Required", className: "badge-muted" },
  not_started:  { label: "Not Started",  className: "badge-muted" },
  pending:      { label: "Pending",      className: "badge-warning" },
  paid:         { label: "Paid",         className: "badge-success" },
  waived:       { label: "Waived",       className: "badge-info" },
  failed:       { label: "Failed",       className: "badge-error" },
  refunded:     { label: "Refunded",     className: "badge-warning" },
};

interface StatusBadgeProps {
  status: RequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = REQUEST_STATUS_CONFIG[status] ?? { label: status, className: "badge-muted" };
  return (
    <span className={`badge ${config.className}`} title={config.label}>
      {config.label}
    </span>
  );
}

interface PaymentBadgeProps {
  status: PaymentStatus;
}

export function PaymentBadge({ status }: PaymentBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status] ?? { label: status, className: "badge-muted" };
  return (
    <span className={`badge ${config.className}`} title={config.label}>
      {config.label}
    </span>
  );
}
