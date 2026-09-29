# Handoff: DOTS web (v1, static)

The whole UI is built, moves, and runs on fictional sample data. No component fetches anything. Data comes in through imports from `src/data/` and props.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run lint       # oxlint
```

## Design system

- **Brief and rationale:** `DESIGN.md` covers what DOTS is, the research, what we kept from the category and what we changed, colour, type, layout and assumptions.
- **Tokens:** `src/styles/index.css`.
  - Every colour is a role variable (`--bg`, `--surface`, `--ink-2`, `--line`, `--lime`, `--red`…). Light values are in `:root` and dark values in `.dark`, exposed to Tailwind through `@theme inline` (`bg-surface`, `text-ink-3`, `border-line`…).
- **Colour rules:**
  - **Neutrals** for everything.
  - **Lime** means *alive*: active companies, earning, the primary action.
  - **Red** means *in receivership*, and nothing else.
  - In light mode, lime text uses `text-lime-text` for contrast.
- **Themes:** dark is the default. The choice is stored in `localStorage.theme` (only `'light'` is saved). `index.html` applies it before first paint. `useTheme()` in `src/lib/theme.ts` switches it, and `ThemeSwitch` sits in the header.
- **Type:** Bricolage Grotesque (display and UI) and JetBrains Mono (figures, tickers, labels), both self-hosted.
  - Custom sizes: `text-display / h1 / h2 / h3 / lead / stat`.
  - These are registered in `src/lib/cn.ts`; add any new size there too, or `cn()` drops it.
- **Primitives:** `src/components/ui/` has `Button` (`buttonClass` lives in `lib/button.ts`), `Dialog`, `Field`, `Segmented`, `Status`, `Section`, `PageHeader` and `Figures`, and `Notice`.

## The three signature pieces

`src/components/dots/` holds the visual language: everything is a dot.

| Component | What it shows |
|---|---|
| `NetworkField` | The holdco at the centre and every company as a dot. **Distance from the centre = runway** (closer means safer), **size = treasury**. Lime means active and hollow means paused. Red dots sit on the dashed receivership ring, and their line to the holdco is cut. It has separate wide and narrow geometry, and labels flip inward near the edges. |
| `RunwayDots` | One dot per week of runway at today's burn. It turns red below 21 days. |
| `DotGlyph` | A mirrored 5×5 emblem generated from the ticker (`lib/seeded.ts`). The centre dot carries the status. Pass `src` to show real coin art instead. |

## Pages

| Route | Page | Reads | Actions to wire |
|---|---|---|---|
| `/` | `Home` | `companies`, `listings`, `networkStats`, `holdco` | links only |
| `/network` | `Network` | `companies`, `holdco` (filter, search and sort are local) | — |
| `/company/:id` | `Company` | one `Company` (with `agent`, `jobs`, `artifacts`, `timeline`), its `Listing` if any | Trade link, rescue bid |
| `/receivership` | `Receivership` | `listings`, `bids`, `networkStats`; `?bid=<companyId>` opens the bid dialog | `BidDialog` `onSubmit` |
| `/launch` | `Launch` | none | `LaunchDraft` → the launch transactions (`lib/launch.ts`) |

Types are in `src/types/index.ts` (`Company`, `Agent`, `Job`, `Artifact`, `Listing`, `Bid`, `NetworkStats`).

## Wiring

- **Wiring points:** search for `NORA:`. There are 30 markers, each a spot for real data or a real transaction.
- **Wallet:** `Shell` holds a mock wallet (`wallet.ts` → `useWallet()`); replace it with the Solana wallet adapter. The launch and bid flows already ask for a wallet before signing.
- **States:** every data view has loading, empty and error designs. Preview them with `?state=loading|empty|error` (`useDemoState()` in `lib/hooks.ts`), and replace that hook with your query status.
- **Time:** sample data is pinned to `sampleNow` (`data/network.ts`) so countdowns are stable. Use `Date.now()` when live.
- **Fee routing** (80% treasury, 10% holdco, 10% creator) in `lib/launch.ts` is a placeholder until the program defines it.
- **The runway rule** (pause under 21 days, receivership at zero) is described in copy and in `critical()` in `lib/format.ts`. Keep them in sync with the program.

## Motion

The principle, the signature moments and the supporting system are in `DESIGN.md` → MOTION. Here's where each part lives.

**Stack and tokens**
- `motion` (LazyMotion `strict` + `domMax`, so write `m.*`, never `motion.*`) and `MotionConfig reducedMotion="user"`, both in `App.tsx`.
- Tokens are in `src/lib/motion.ts`: eases, springs (`SPRING_POP` is a dot landing) and `VIEWPORT`.
- CSS keyframes (breathe, flatline, heartbeat, ping `.live-dot`, dot-wave, caret, glyph ripple) sit at the bottom of `src/styles/index.css`, with the reduced-motion guard.

**Primitives** (`src/components/motion/`)

| Component | What it is |
|---|---|
| `Reveal`, `Stagger`, `Item` | Entrances |
| `CountUp` | Numbers that settle, then glide |
| `Rolling` | Digit-by-digit characters |
| `Countdown` | Ticking auction clock |
| `MaskLine`, `DotPeriod` | Headline lines and the dot full stop |
| `DotsLoader` | The logo's hopping dot |
| `DotBurst` | Celebration |

**Live stores** (`src/lib/live.ts`)
- **`useNow()`:** one shared one-second clock for every countdown and "ago". It starts at `sampleNow`. **When wiring, return `Date.now()`.**
- **`useHoldcoTreasury()` / `addToHoldco()`:** the holdco treasury. Fee pulses in the Field add to it. **When wiring, subscribe to the holdco account** and let pulses be purely visual (or drive them from real fee events).

**Simulated activity to replace** (all marked `NORA:`)

| Where | What's simulated |
|---|---|
| `NetworkField` | Fee pulses, picked by 30-day fees |
| `AgentConsole` | New log lines (`nextAction`); stream real agent actions instead |
| `Launch` | The newcomer company placed in the success map |

**Pausing and performance**
- Loops pause when their element is off screen (`useInView`) or the tab is hidden.
- The Field animates attributes on a few circles at a time.
- `DotGrid` draws on a canvas only while the pointer moves over the hero.

## Checks run on this build

- **Sweep:** 13 routes (including every `?state=`, 404 and unknown company) at 360, 390, 768, 1024 and 1440, in dark and light. There is no horizontal overflow and there are no console errors.
- **Launch flow:** driven end to end at 390 and 1440, covering validation, wallet connect, signing and success (the birth map).
- **Bid flow:** driven end to end at 390 and 1440, covering the minimum-bid error, the plan requirement, the bid itself (the rescue burst) and "My bids" (the top bid rolls up).
- **Motion frames** captured for the hero intro, the lifecycle loops, the agent log, the theme reveal and phone.
- **Reduced motion:** the end state renders at once, with no errors.
- **Static checks:** `tsc -b`, `oxlint` and `vite build` all pass.
