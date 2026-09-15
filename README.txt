AMIRA V31 - CPT ENGINE 05/06/07 FIX

ENGINE 05 = source of truth T_MATERIAL actual usage. Block is taken directly from T_MATERIAL when available; SIC is only fallback.
ENGINE 06 = source of truth Excel prescription, retaining CWC1-4 and PTC1-4 internally plus WDC1-4.
ENGINE 07 = actual material minus base material per block and spray family.

CPT reporting:
- CWC + PTC (Path Chemist + TPH Chemist) are reported as CPT.
- CPT1 base = CWC1 + PTC1; CPT2 = CWC2 + PTC2; CPT3 = CWC3 + PTC3; CPT4 = CWC4 + PTC4.
- Actual CWC and PTC usage is combined by block + subtype + material before reconciliation.
- WDC is reconciled separately against WDC1-4.
- Material Balance includes every block that has actual material in T_MATERIAL, including blocks without material base (shown as NO BASE rather than hidden).

History remains local IndexedDB in this build. Supabase cloud sync is not included in V31.
