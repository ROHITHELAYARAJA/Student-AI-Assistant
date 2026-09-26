# Blast learning studio

## Direction
An editorial workspace for sustained study: warm ivory surfaces, ink text, sage context panels, and violet actions. Serif display typography gives home and documents an identity, while system sans-serif keeps controls compact and readable. Existing architecture, sources, learning tools and AWS routing are retained.

## Design decisions
- Split the home screen into a clear starting point and a continuation panel, rather than copying the reference product's centered mascot composition.
- Keep the supplied Blast logo in the header. Avoid generated artwork, artificial statistics, subscription badges, or claims of learning progress that are not backed by data.
- Turn notebooks into a collection with visible descriptions, section/card counts, favorites, and progress.
- Give study content a white reading surface. Use restrained navigation and a consistent action hierarchy across lessons, notes, quizzes, flashcards, audio and sources.
- Provide useful starting prompts that fill the composer without issuing paid requests.
- Retain responsive navigation, keyboard focus indicators and reduced-motion support.

## Research
[Linear's interface refresh](https://linear.app/now/behind-the-latest-design-refresh) describes prioritizing task content over navigation chrome and making action placement consistent. [Notion's wiki guidance](https://www.notion.com/help/wikis-and-verified-pages) emphasizes organizing and finding knowledge. These informed hierarchy and discoverability; Blast's visual treatment is its own.

## Implementation
StudyWorkspace.tsx contains the new home composition. astra-theme.css supplies the workspace palette and component surfaces; astra-layout.css defines the editorial layout, responsive rules, and typography. The previous reference-theme.css has been removed. The frontend production build passed. This is an interface change; the previously confirmed AWS verification restriction on live generation is unchanged.

Browser verification: home and lesson screens both fit a 390px viewport without horizontal overflow. Starting prompts populate the composer, continuation opens the lesson, and all seven study-tool navigation items remain available. Verified using the local preview without live AI calls.
