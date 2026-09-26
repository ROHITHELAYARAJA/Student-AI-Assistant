# Supplied Blast cat artwork

All deployed images are unchanged copies from `Photos`. The remaining supplied images stay in that folder for future use. No generated replacements, filters, cropping, animation or external image hosting are used.

| Public file | Original filename suffix (26 September 2026) | Placement |
| --- | --- | --- |
| tutor.png | 10_30_41 AM-1.png | Header, tutor welcome, reply identity, greeting |
| reading.png | 10_31_06 AM-5.png | Home learning panel, study empty states |
| working.png | 10_31_17 AM-7.png | Generation and tutor loading states |
| graduate.png | 10_30_48 AM-2.png | Completed lesson heading |
| explorer.png | 10_33_29 AM-4.png | In-progress lesson heading, learning empty state |
| listening.png | 10_31_01 AM-4.png | Audio player and listening empty state |

`BlastMascot.tsx` centralizes the media slot. `mascot.css` keeps a square aspect ratio and contains the full image at avatar, small, medium and hero sizes. Larger art loads lazily. Decorative instances have empty alternative text. Future supplied videos can replace these slots while retaining each still as its poster; no video is assumed to exist yet.

## Verification

- Frontend production build passed.
- SHA-256 checks confirm all six public PNGs exactly match the supplied originals.
- At 390 × 844, home, example listening, and example chat pages have a 390px content width with no horizontal overflow.
- Home tutor/reading, lesson explorer, listening, and chat-header images loaded successfully at their intended square dimensions.
- Checks used the example notebook without paid AI requests. Live AI response/loading and real completion transitions were not exercised by these artwork checks.
