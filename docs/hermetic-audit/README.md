# Mystic Hermetic Correspondence Audit

This directory is the human-review layer for the Hermetic Kabbalah product. It is intentionally separate from the report generator. A row must not be treated as approved for customer delivery just because it exists in a CSV.

## Files to review

- `01-planetary-spheres.csv`: seven traditional planets, Sephiroth, virtues, imbalances, and planetary weekdays.
- `02-zodiac-paths.csv`: the twelve zodiacal signs, Hebrew letters, Golden Dawn Tarot trumps, and path numbers.
- `03-shem-quinances.csv`: the 72 five-degree angelic quinances used by the current Golden Dawn-style framework.

Open the files in Excel or Google Sheets. Change `audit_status` to `approved`, `corrected`, or `rejected`, add the page/table from your book in `book_reference`, and record any correction in `review_note`.

## Source policy

The current framework is explicitly **Golden Dawn Hermetic Qabalah**, not Jewish Kabbalah and not a claim of a universal correspondence system.

Primary review sources:

1. Aleister Crowley, *Liber 777 / 777 Revised*: planetary, Sephiroth, colors, paths, Tarot, metals, perfumes, and decanic tables. Use the edition you own as the audit authority. A reference copy is available at <https://hermetic.com/_media/93beast.fea.st/files/section1/777/liber_777_revised.pdf>.
2. Golden Dawn *Shem ha-Mephorash* table: angel name, five-degree placement, planetary attribution, meaning, and Psalm reference. Reference transcription: <https://www.tarrdaniel.com/documents/Thelemagick/gd/publication/english/Schemhamphorash.html>.
3. Israel Regardie, *The Golden Dawn*: use the edition/page you own to resolve conflicts in Golden Dawn material.

## Important audit rules

- The 72-angel source table runs **Leo through Cancer**, not Aries through Pisces. The CSV keeps the ordinary zodiacal sort for convenience but includes `golden_dawn_number` so the original sequence can be checked.
- The current generator may use only `approved` or `corrected` data once this audit is complete. Until then, the rows remain `needs_manual_review`.
- Do not copy whole tables or long quotations into customer PDFs. Store concise factual correspondences and cite the source in this audit layer.
- The product must never promise angelic protection, material outcomes, healing, initiation, or authority over another person. Any practice belongs to the selected natal testimony and remains contemplative, voluntary, and safe.

## Current coverage and gaps

The CSVs cover the data currently used in the generator: seven planetary spheres, zodiacal paths, and 72 quinances. They do **not** yet constitute a complete extraction of every *Liber 777* column. Color scales, metals, perfumes, decanic Tarot minors, and other materia must be added only after row-level audit from the chosen edition.
