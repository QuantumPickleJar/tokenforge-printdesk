# Tokenforge print request intake

This document describes the public-demo-safe path from the portfolio gallery to Tokenforge Generator and then into Tokenforge Printdesk.

## Flow

1. **Portfolio gallery** inspires or selects a print and can hand off gallery metadata to Tokenforge Generator.
2. **Tokenforge Generator** lets the user customize or package the request and export a `tokenforge.print-request.v1` JSON payload.
3. **Printdesk owner login** protects the import wizard. The JSON intake is available only after owner auth at `/owner/intake`.
4. **Generator Intake** accepts pasted JSON or an uploaded `.json` file, validates the payload, previews the queue entry, and imports it.
5. **Owner queue** receives the item as a normal request for review, status updates, manual quote handling, and notes.

No payment is requested automatically by this intake. `pricingMode` only changes owner-facing wording and initial request/payment flags.

## Supported payload shape

The intake expects this schema marker:

```json
{
  "schema": "tokenforge.print-request.v1"
}
```

The payload may include:

- `source.handoff`, `source.generatorVersion`, and `source.projectName`
- `customer.displayName`, `customer.contact`, and `customer.notes`
- `item.name`, `item.description`, `item.galleryUrl`, `item.imageUrl`, `item.modelUrl`, and `item.previewUrl`
- `print.category`, `print.material`, nozzle/layer settings, colors, estimates, quantity, and notes
- `attachments.packagePath`, `attachments.stlPath`, `attachments.previewPath`, and `attachments.metadataPath`
- optional `pricingMode`: `quote`, `family`, or `free`

## Owner-only behavior

The intake wizard is intentionally not part of the public `/request` flow. It is routed through `/owner/intake`, which is wrapped by the same owner auth guard as the dashboard.

This means public demo users can still submit normal quote requests, but only the owner can import generator-created JSON directly into the queue.

## Import mapping

When a valid payload is imported:

- request title comes from `item.name`, then `source.projectName`, then a fallback title
- request description is summarized from gallery/model/preview links, print details, quantity, and notes
- requester fields come from `customer.displayName` and `customer.contact`
- `pricingMode: quote` becomes a public quote request with payment not started
- `pricingMode: family` becomes a family/free request with payment not required
- `pricingMode: free` becomes a family/free request with payment waived
- safe `http`/`https` model/package links are stored as the model source URL
- local package paths and metadata paths are preserved in owner notes

## Invalid JSON

Invalid JSON, the wrong schema, or malformed field types fail validation in the wizard and do not create queue rows.

## Current limitations

- The import does not upload generated packages or STL files; it stores links and local paths as queue metadata.
- The owner still performs final printability review and manual quote handling.
- No payment provider is called from this flow.
- The default sample JSON is for smoke testing and should not be treated as production customer data.
