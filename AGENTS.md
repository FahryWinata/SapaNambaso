# AGENTS.md: SAPA NAMBASO

For any UI, copy, layout, or code task in this repository:
1. Read `DESIGN.md` first for visual direction, verified WCAG AA color tokens, typography scale, and dial settings (`ENERGY 1 / RHYTHM 2 / MOTION 1`).
2. Apply all active `antislop` rules (`antislop`, `antislop-ui`, `antislop-code`, `antislop-human`, `antislop-copywriting`, `antislop-layoutmobile`) as the quality filter.
3. Never use em-dashes or en-dashes in UI text, data, or comments. Use natural Indonesian connectors (`sampai`, `s.d.`, commas, or colons).
4. Never hardcode public website copy or media assets outside the CMS data layer (`data/sapa-nambaso-db.json` and `src/seed.js`).
5. Verify contrast with `contrast-check.py` and run `npm test` after every change.

