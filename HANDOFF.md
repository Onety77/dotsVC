# Handoff: DOTS web (v1, static)

The whole UI is built and runs on fictional sample data. Nothing moves yet; that's deliberate, and the motion plan below says what should move next. No component fetches anything. Data comes in through imports from `src/data/` and props.

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

- **Wiring points:** search for `NORA:`. There are 24 markers, each a spot for real data or a real transaction.
- **Wallet:** `Shell` holds a mock wallet (`wallet.ts` → `useWallet()`); replace it with the Solana wallet adapter. The launch and bid flows already ask for a wallet before signing.
- **States:** every data view has loading, empty and error designs. Preview them with `?state=loading|empty|error` (`useDemoState()` in `lib/hooks.ts`), and replace that hook with your query status.
- **Time:** sample data is pinned to `sampleNow` (`data/network.ts`) so countdowns are stable. Use `Date.now()` when live.
- **Fee routing** (80% treasury, 10% holdco, 10% creator) in `lib/launch.ts` is a placeholder until the program defines it.
- **The runway rule** (pause under 21 days, receivership at zero) is described in copy and in `critical()` in `lib/format.ts`. Keep them in sync with the program.

## Motion plan (next session)

The layout was designed so that each of these can be added without changing structure. Recommended stack: `motion` (LazyMotion + `m.*`), expo-out easing at 150–600ms, and springs for state changes. Honour `prefers-reduced-motion` everywhere by showing end states and stopping loops.

**Signature motion (the product explaining itself)**
1. **Field: the network breathes.**
   - Active dots pulse very slowly, and each has its own phase from its seed.
   - Every few seconds a small lime *fee pulse* travels along a line from a company to the holdco, so creator fees are visibly flowing in.
   - The holdco dot swells slightly when a pulse arrives.
2. **Field: distress drifts.** On first view, receivership dots start on their normal ring and drift out to the dashed outer ring, and their line visibly snaps (a stroke-dash cut). This happens once, not on a loop.
3. **Runway dots drain.**
   - On view, the dots fill left to right up to the runway.
   - On distressed companies the last lit dot blinks red, slowly.
   - In the launch preview the dots re-fill as the daily budget changes.
4. **Countdowns tick.** Auction clocks count down live (digit roll on seconds), and the last six hours turn red. This is already coloured; it only needs a timer.
5. **Lifecycle diagrams play.** Each of the four stage SVGs on Home animates its own verb when scrolled into view:
   - **Launch:** a dot appears.
   - **Hire:** an agent dot attaches.
   - **Earn:** fees flow in.
   - **Survive, or be sold:** a dot fades, goes red and moves to a new owner.
6. **Glyph reveal.** `DotGlyph` dots pop in from the centre outwards (staggered by distance) the first time a company appears, and the status dot lands last.

**Supporting motion**
- **Page entrances:**
  - The header stays still.
  - The page head rises in, then sections stagger at 60ms in reading order.
  - Figures count up once, rounded to their final precision.
- **Price chart:** the line draws on first view and when switching ranges. The hover readout follows with a spring.
- **Agent console:** the latest log line types in, and job status pills cross-fade when they change.
- **Lists:** table rows and listing cards glide to their new places when you filter or sort (`layout`).
- **Segmented and nav:** the active pill slides between options (`layoutId`).
- **Launch flow:**
  - Steps slide horizontally.
  - The step dots fill.
  - The preview card updates with small spring settles.
  - On success, the new company's dot flies into a mini network.
- **Bid dialog:** the sheet or modal rises in. On success the company glyph's red centre dot turns lime.
- **Theme switch:** a circular View Transition reveal from the switch.

## Checks run on this build

- **Sweep:** 13 routes (including every `?state=`, 404 and unknown company) at 360, 390, 768, 1024 and 1440, in dark and light. There is no horizontal overflow and there are no console errors.
- **Launch flow:** driven end to end at 390 and 1440, covering validation, wallet connect, signing and success.
- **Bid flow:** driven end to end at 390 and 1440, covering the minimum-bid error, the plan requirement, the bid itself and "My bids".
- **Static checks:** `tsc -b`, `oxlint` and `vite build` all pass.
