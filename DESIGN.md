# DOTS — Design Brief

## What it is

A launch network on Solana where every meme coin becomes a company:
- The coin launches on Pump.fun.
- An AI agent is hired as its CEO.
- The coin's creator fees are the company's only income.
- DOTS is the holding company above them all.

Companies that earn keep running. Companies that don't run out of runway and go into receivership, where anyone can bid to rescue them.

**Audience:**
- Pump.fun launchers and meme traders, mostly on phones and fluent in the culture.
- People with SOL looking for undervalued companies to take over.

Both want to know one thing fast: *which of these is alive, and for how long?*

## Research

The live sites were unreachable from the build environment, so the evidence comes from code and from earlier studies in this project:
- Raydium LaunchLab (its public UI repo: launchpad, token page, create flow, theme).
- solana.com (run locally), Uniswap (tokens), Lido (Storybook) and Dub (dashboard code).
- pump.fun, Virtuals, daos.fun and Acquire.com, described from knowledge, so lower confidence.

| | Launchpads (pump.fun, Raydium LaunchLab) | Agent platforms (Virtuals, daos.fun) | Business marketplaces (Acquire) |
|---|---|---|---|
| Identity | The coin image leads every card and page | An agent avatar and name | A company name and one-line pitch |
| Lists | Cards: image, ticker, market cap, progress to graduation, age | Agent cards: market cap, holders | Rows: revenue, profit, asking price, reason for sale |
| Detail page | Chart, trade box, info, holders, activity, comments | Agent profile, mission, activity feed | Metrics, history, "make an offer" |
| Create flow | Image, name, ticker, description, socials; two short steps | Name, persona, mission | — |
| Theme | Dark by default, with a light mode (Raydium has both) | Dark | Light |
| Colour | Brand gradient plus many accents (Raydium uses about 8 hues) | Neon | Neutral plus one brand colour |

**What to keep:**
- The coin's image as its identity.
- The token page's anatomy.
- Progress shown as a bar or steps.
- Short create flows.
- Marketplace rows with hard numbers and a stated reason.
- Dark by default, with light available.

**What to leave behind:**
- The genre's colour noise and gradients.
- Neon effects.
- Casino energy.

DOTS handles other people's money and companies' lives, so the frame must look like a serious finance product. The meme energy lives in the coins' own art, the names and the copy.

## Direction

**REGISTER:** Sharp, alive, a little mischievous. Serious money, unserious subjects.

**CONCEPT: the dot.** The brand's own name is the unit of the whole design:
- **The Field** (signature 1). The network as a map: the holdco at the centre, and every company a dot around it, sized by treasury. Healthy companies sit close and lit; paused ones are hollow; distressed ones sit out on the *receivership ring*. The picture *is* the portfolio, and hovering any dot shows its company.
- **Runway dots** (signature 2). One dot per week a company can survive, drawn everywhere runway appears. Survival becomes something you can count at a glance, and critical runway turns red.
- **Dot glyphs** (signature 3). Each company gets a generated dot-matrix emblem from its ticker, so the site looks complete before real coin art arrives. Real art replaces it through `src`.

**COLOUR** (one brand hue plus one warning):
- **Neutrals:** near-black ink and white, with 3–4 ink steps and hairline borders.
- **Lime (the brand):** alive, primary actions and healthy companies. It's used as a *fill*, with dark text on it. In light mode, lime-coloured text uses a darker olive for contrast.
- **Red:** distress, critical runway and receivership. Nothing else.
- **Paused:** neutral, drawn as a hollow dot.

**TYPE:**
- **Bricolage Grotesque:** a characterful grotesque with optical sizes, confident at display size and quiet at text size. Headlines are 600 weight with tight tracking; body text is 400.
- **JetBrains Mono:** tickers, figures, addresses and countdowns.

**LAYOUT:**
- One container (1320px) and one gutter scale, on a 12-column grid.
- A top navigation bar, since this is a hybrid: a marketing home plus app pages.
- The home page gets the full footer; app pages get a compact one.
- On phones: a menu sheet, and tables become cards.

**THEMES:** Dark by default (the genre's home) and a designed light mode, switched from the header.

**MOTION:** None in this pass. The layout is designed for it (see HANDOFF.md, "Motion plan").

**ASSUMPTIONS:**
- Companies, figures, bids and agents are fictional sample data (`NORA:`). No real coins or projects are represented.
- The fee routing split in the launch flow (company treasury, holdco, creator) is a placeholder until the program defines it.
