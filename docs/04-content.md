# Content pipeline

## Scope

- 40 buildings across 8 architecture types (about 5 per type) to start.
- Which 8 types is the author's call. The schema doesn't care.

## Sourcing from Wikimedia Commons

Allowed licenses:

| License | OK? | Obligation |
| --- | --- | --- |
| Public domain / PD-mark | Yes | None (credit as a courtesy) |
| CC0 | Yes | None (credit as a courtesy) |
| CC BY (any version) | Yes | Credit author, license, link; note changes |
| CC BY-SA (any version) | Yes | Same as BY; our resized copies are also BY-SA |
| GFDL-only, or anything "non-free" / fair use | No | Skip |

Notes:

- Check each file page individually. License tags vary per file.
- **Freedom of panorama:** some countries (e.g. France, Italy) don't allow free
  photos of recent copyrighted buildings, and Commons sometimes deletes those files.
  Prefer older buildings or countries with freedom of panorama for anything
  built in the last ~70 years, or accept a small risk.

## Workflow (no code yet; this describes the eventual tool)

1. **Manifest.** The author fills a spreadsheet/CSV with one row per photo: building
   slug, Commons file URL, photo position, and the style label.
2. **Fetch script** reads the manifest, calls the Commons API for each file, and records
   author, license, license URL and attribution text automatically.
3. **Process:** download the original, crop to a portrait ratio (~2:3 for cards),
   resize (e.g. 1080px tall), convert to WebP, strip metadata, save under an opaque id.
4. **Seed:** load items, photos and attributes into the database. Profile copy comes
   from a separate file the author edits.

The manifest contains the style labels, so it lives in `content/private/`, which is
gitignored (D16). Keep a backup copy outside the repo. Anything public (photo credits,
profile copy) can be committed. Anything that reveals a style can't.

## Attribution

CC BY / BY-SA require credit. The plan:

- A **Credits screen** reachable from the about menu and the results screen, listing
  every photo's author, license and source link.
- Not shown on the card itself during swiping, because Commons pages and categories give
  the style away (see 02).
- Note "cropped and resized" as the change made.

## Copy guidelines (for later)

- Profile copy can be pointed, but shouldn't name the style outright while the label is
  supposed to be hidden.
- Building names: invent persona names ("Gerald, 54") rather than real building names,
  which are easy to look up. The author decides.
