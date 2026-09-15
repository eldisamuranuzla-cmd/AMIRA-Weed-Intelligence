AMIRA V29.2 — Multi Afdeling Historical Fix

Fixes:
- Historical dataset key is DATE + AFDELING, not DATE only.
- Same-date OC/OA/OB/OD/OE datasets can coexist.
- Uploading OE no longer overwrites OC on the same date.
- Afdeling is inferred from block code (OA/OB/OC/OD/OE) and stored in snapshot metadata.
- Main Dashboard Afdeling selector dynamically exposes available afdeling codes.
- Switching main Afdeling loads the latest historical snapshot for that afdeling when available.
- Multi Afdeling historical aggregation no longer uses a date-only Map.
- Existing P4/HA/HK/material logic is preserved.
- HeStI June 2026 baseline verified against supplied workbook: 155 blocks, total Luas Tanam 4,100.79 Ha.
