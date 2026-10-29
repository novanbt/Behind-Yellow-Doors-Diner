# Behind Yellow Doors Diner — Multi-Outlet Web Experience

An immersive brand experience and interactive entrance portal for **Behind Yellow Doors Diner** in Varanasi, India.

---

## 🚪 Architecture & Routes

| Route | Page | Experience & Vibe |
| :--- | :--- | :--- |
| **`/`** | **Entrance Portal** | Fullscreen 3D yellow door that swings open on scroll to present **"CHOOSE YOUR DOOR"** with two distinct destination cards. |
| **`/sigra`** | **Sigra Outlet** | Relaxed, social, lively, welcoming, and experience-driven diner featuring 40+ board games, double smash burgers, and an outdoor terrace. |
| **`/sigra-menu`** | **Sigra Menu** | Dedicated Food & Beverages menu page strictly sourced from official Sigra PDFs (Buffet of the Day, 24 Food categories, 5 Beverage bars, real-time live search & category filters). |
| **`/bhojuveer`** | **Bhojuveer Outlet** | Refined, contemporary, aesthetic, garden-inspired, and minimal bistro with a botanical glasshouse, single-origin coffee lab, and artisan sourdough. |
| **`/bhojuveer-menu`** | **Bhojuveer Menu** | Dedicated Food & Beverages menu page for the Bhojuveer outlet with full categorised food & beverage lists, dietary tags, and interactive search. |

---

## 🌟 Highlights

### 1. Entrance Portal (`/`)
- **Interactive 3D Yellow Door**: Covers the entire frame (`100vw` × `100dvh`). As you scroll, it swings open along its 3D left hinge with procedural audio (brass latch click & wooden hinge creak).
- **"CHOOSE YOUR DOOR" Reveal**:
  - **Heading**: `CHOOSE YOUR DOOR`
  - **Subtitle**: *“Two different spaces. Two different moods. The same love for good food.”*
  - **Destination A (Sigra)**: Warm social dining imagery, relaxed atmosphere tags, signature quote, and **ENTER SIGRA** button.
  - **Destination B (Bhojuveer)**: Refined garden conservatory imagery, contemporary aesthetic tags, editorial quote, and **ENTER BHOJUVEER** button.

### 2. Sigra Outlet Experience (`/sigra`)
- **Atmosphere**: Relaxed, social, lively, welcoming, and experience-driven.
- **Narrative**: *“Good food, great company, and a little friendly competition. Come for your favourites, stay for the conversations.”*
- **Features**:
  - Board Game Library with 40+ games
  - Signature diner smash burgers, loaded animal fries, and Lotus Biscoff freakshakes
  - Outdoor social terrace deck under hanging fairy lights
  - 3-Row infinite horizontal marquee testimonials section featuring verified diner impressions
  - Direct WhatsApp table/booth reservation integration (+91 6393138560)
  - Location: Plot 14, Mahmoorganj-Sigra Main Road, Sigra, Varanasi

### 3. Bhojuveer Outlet Experience (`/bhojuveer`)
- **Atmosphere**: Refined, contemporary, aesthetic, garden-inspired, and minimal.
- **Narrative**: *“A thoughtfully designed space for beautiful meals, relaxed conversations, and memorable moments.”*
- **Features**:
  - Sunlit botanical glasshouse & living green courtyard
  - Specialty V60 & Chemex pour-over coffee lab
  - Contemporary bistro cuisine: Burrata tartines, wild mushroom truffle bowls, hand-folded agnolotti, burnt Basque cheesecake
  - 3-Row infinite horizontal marquee testimonials section featuring 30 verified diner impressions
  - Direct WhatsApp table reservation integration (+91 9151805152)
  - Location: Artistik Abode, SH 2/215-2, Sikraul, Bhojuveer, Varanasi, Uttar Pradesh 221002

### 4. Interactive Outlet Selector
- Available on every page in the header.
- Displays the currently active outlet (`📍 Sigra` or `🌿 Bhojuveer`).
- One-click popover allows instantaneous switching between outlets or returning to the main 3D yellow door portal.

### 5. Custom Favicon Suite
- Pixel-perfect vector SVG favicon with dark/light theme adaptation
- Multi-resolution ICO bundle (16x16, 32x32, 48x48)
- High-res Apple Touch and Android Chrome web app icons
- Web manifest with brand color `#f5b800`

---

## 🚀 Local Server

To run locally:
```bash
node server.js
```
Then visit [http://localhost:3000](http://localhost:3000).
