# Contract: `studiolo.vantage/1`

One-way release package from Studiolo (author) to The Vantage (publisher). The Vantage never reads Studiolo.

**Endpoint:** `POST /api/import/studiolo`

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `X-Studiolo-Timestamp` | Unix seconds at send time. Rejected if more than 5 minutes off. |
| `X-Studiolo-Signature` | `sha256=` + hex HMAC-SHA256 of `` `${timestamp}.${rawBody}` `` keyed with `VANTAGE_IMPORT_SECRET` |

**Body**

```json
{
  "schema": "studiolo.vantage/1",
  "package_id": "piece-uuid-or-slug",
  "version": 1,
  "piece": {
    "id": "studiolo piece id",
    "title": "Gratitude",
    "category": "P",
    "program": "AAPEX",
    "module_number": 1,
    "one_line": "optional",
    "gene_question": "optional, Nolan-authored",
    "minutes": 14
  },
  "format": "self-paced lesson",
  "body_md": "Markdown body",
  "assets": [{ "name": "cover", "url": "https://…", "alt": "…" }],
  "author_of_record": "Nolan Langford",
  "approved_at": "2026-11-20T18:00:00.000Z"
}
```

`format` is one of Studiolo's 17: book chapter, workbook pages, cohort lesson plan, self-paced lesson, talk outline, slide outline, socratic assessment, program blueprint, article, newsletter, social carousel, quote cards, worksheet, skill sheet, resource bank, narrative story, lyric sketch.

**Responses:** `201 {id, status:"draft"}` new draft · `200 {…, duplicate:true}` same `package_id`+`version` already received · `401` bad/missing/stale signature · `422` schema rejected · `503` secret not configured.

**Landing:** a self-paced lesson with `program` + `module_number` becomes that module's body; newsletter → Library newsletter (public); skill sheet / worksheet → skill sheet; book chapter / workbook pages → book; anything else → article. Every package lands as a draft. Publishing re-runs the public rules and needs Nolan (checkbox + author of record).
