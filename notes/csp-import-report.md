# CSP import report (2026-11-17)

Sources: TN `D21321918` (Tennessee Academic Standards: Mathematics K-4th Year, valid 2023, Published, license field empty, rights holder D2L Corporation). KY `D21015096` (Kentucky Academic Standards: Mathematics, valid 2019, Published, CC BY 3.0 US, rights holder D2L Corporation). Older documents (TN 2010, 2016; KY 2010) are Deprecated and were not imported.

## Tennessee: CSP vs tests/standards.json
- Saved rows: 150. CSP content standards K-5 (practice standards excluded): 153.
- Code sets: all 150 saved codes exist in CSP. CSP-only: 2.NBT.A.3, K.CC.C.7, K.CC.C.8 (3 rows the saved file lacks; check whether they are in the 2023 revision and add them as Gap/Supported rows).
- Text comparison, 150 common codes, after whitespace normalization:
  - identical: 85
  - punctuation or hyphenation only: 11 (for example "half circles" vs "half-circles")
  - CSP text is a prefix of saved text: 33 (saved keeps "For example", "NOTE" and Table references that CSP drops)
  - other: 21
- Saved-data defects found by the comparison:
  - 10 saved rows start with a lowercase fragment of the previous heading: 1.OA.B.3, 1.OA.B.4, 3.MD.A.1, 3.MD.A.2, 3.MD.C.5, 3.MD.C.6, 3.MD.C.7, 3.MD.D.8, 4.NF.B.3, 4.NF.B.4 (for example "subtraction. Apply properties...", "to addition. Recognize...").
  - Typo in 2.MD.D.9: "horizonal".
- CSP splits multi-part standards (3.MD.A.1.a, 3.MD.C.7.a to d, ...) into child rows. The importer folds them into the parent as `components`.
- CSP drops examples and notes, so it is less complete than the Instructional Focus text for 33 rows. Recommendation: keep current Tennessee text, fix the 10 leaks and the typo, add the 3 missing rows, and use CSP for GUIDs and as the shared pipeline for other states.

## Kentucky
- 149 K-5 content standards (23 K, 21 G1, 26 G2, 25 G3, 28 G4, 26 G5) plus 8 practice standards per grade.
- Codes are `KY.<grade>.<domain>.<n>` with no cluster letter, so the TN codes do not map by code. Grades 4 and 5 have 28 and 26 rows against TN's 28 and 25.
- Texts contain HTML (`<ul><li>`) that the importer must strip, and some "standards" are short heading-like lines ("Solve multistep problems.", "Compose shapes.") with the substance in sub-bullets.
- Text similarity alone is not a reliable crosswalk: 30 rows match a TN row at 0.85 or higher, 45 at 0.6 to 0.85, 74 below 0.6. KY regroups standards (one KY row can cover several TN rows, for example KY.5.NF.1 covers TN 5.NF.A.1 and A.2). The crosswalk is a hand-reviewed table.
- KY content with no obvious TN counterpart and likely generator gaps: categorical data investigation (KY.1.MD.4), statistical questions and data collection (KY.5.MD.2), numerical pattern generation (KY.5.OA.3), and lines of symmetry (KY.4.G.3), which Tennessee covers under different wording.
