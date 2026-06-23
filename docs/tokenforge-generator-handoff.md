# Tokenforge Generator handoff flow

This document describes the intended public-demo-safe handoff between the three front-facing pieces:

1. **Portfolio gallery** inspires the customer and may provide a source/gallery link.
2. **Tokenforge Generator** customizes or previews a print and exports request metadata as JSON.
3. **Tokenforge PrintDesk** validates that JSON and submits it to Supabase for owner review.

## JSON handoff shape

PrintDesk expects the generator payload schema `tokenforge.print-request.v1`. The supported top-level fields are:

- `source`: generator metadata and optional handoff details.
- `customer`: display name, contact, and customer notes.
- `item`: item name, description, gallery URL, image URL, model URL, and preview URL.
- `print`: category, material, nozzle, layer height, colors, estimates, quantity, and print notes.
- `attachments`: package/STL/preview/metadata paths when the generator has local artifacts.
- `pricingMode`: `quote`, `family`, or `free`.
- `state`: initial handoff state from the generator, normally `new` / `not_quoted` / `not_requested`.

## Request movement

```text
Portfolio Gallery
  -> customer chooses or references a print idea
Tokenforge Generator
  -> customer customizes or previews the request
  -> generator exports tokenforge.print-request.v1 JSON
Tokenforge PrintDesk
  -> validates JSON
  -> submits through Supabase
  -> owner reviews the queue item oldest-first
  -> owner marks reviewing, accepted, quote needed, quote sent, printing, ready, done, or declined
```

## Public-demo-safe behavior

- PrintDesk does not request payment at JSON submission time.
- `pricingMode: "family"` and `pricingMode: "free"` are wording/queue-review signals first.
- Quote/payment remains owner-driven and manual-link-only in this pass.
- No service-role keys or provider secrets belong in the frontend.
- Supabase remains the source of truth; localStorage is not used for queue persistence.

## Owner review states

The owner queue groups requests into demo-friendly stages:

- New
- Reviewing
- Accepted / Quote Sent
- Printing
- Ready
- Done
- Declined

The owner can update request status, save internal notes, mark a quote as needed, or mark a quote as sent. Creating an actual quote still belongs in the existing Quotes / Payments tab.

## Current implementation notes

The frontend validates and maps generator JSON into the existing `submit_print_request` Supabase RPC. The payload is also summarized into the saved request description and material notes so older Supabase functions still preserve the important handoff context even before newer database metadata columns are fully used.
