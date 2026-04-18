# 🛍️ AI SmartShop — AI-Powered E-Commerce Platform

> A production-ready, hackathon-winning e-commerce platform that combines a modern Amazon-inspired storefront with **Explainable AI**, a **conversational shopping assistant**, **image-based recommendations**, and a **custom product request pipeline**.

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Backend Architecture](#-backend-architecture)
6. [AI Capabilities](#-ai-capabilities)
7. [Database Schema](#-database-schema)
8. [Setup & Installation](#-setup--installation)
9. [Running the Project](#-running-the-project)
10. [Environment Variables](#-environment-variables)
11. [Deployment](#-deployment)
12. [Demo Flow](#-demo-flow-for-hackathon)

---

## 🚀 Overview

**AI SmartShop** is a full-stack e-commerce web application built to showcase how AI can transform online shopping. It blends a polished Amazon/Shopify-style UI with intelligent features like behavior-driven product recommendations, an AI chatbot that understands user context, image-based style matching, and a "custom product request" flow that uses AI to find alternatives or log manufacturing requests.

The app is built on **React + Vite + Tailwind CSS** on the frontend and **Lovable Cloud (Supabase)** on the backend, with **Google Gemini 2.5 Flash** powering all AI features via the Lovable AI Gateway (no API keys required).

---

## ✨ Key Features

### 🛒 Shopping & Commerce
- **Product Catalog** — 12+ curated products across Fashion, Shoes, Bags, Electronics, Gadgets, Home
- **Category Navigation** — URL-synced filtering with case-insensitive matching and skeleton loaders
- **Voice Search** — Browser-based speech recognition for hands-free product search
- **Wishlist** — Save favorite items with persistent storage
- **Cart System** — Add/remove/update quantities with real-time totals
- **Checkout Flow** — Multi-step checkout with saved addresses, multiple payment methods (Card / UPI / COD), delivery fee logic (Free above ₹999), and animated payment success overlay
- **Order History** — View past orders with status badges (pending, processing, shipped, delivered)

### 🤖 AI-Powered Features
- **AI Shopping Chatbot (SmartBot)** — Conversational assistant that streams responses, renders interactive product cards inline, and uses behavior context to personalize suggestions
- **AI Recommendations** — Personalized product picks based on interest selection or **uploaded style image** (analyzes color tone, style, category)
- **Explainable AI (XAI)** — Every AI suggestion shows *why* it was recommended (e.g., *"Recommended because you browse Electronics often"*)
- **Custom Product Request** — User describes an ideal product → AI searches catalog → if no match, logs request for "manufacturing"
- **Behavior Tracking** — Centralized context capturing search history, clicked products, and category preferences for AI logic
- **Checkout Upsell** — AI-driven "Frequently bought together" suggestions during checkout

### 👤 Authentication & Users
- Email/password sign-up & login (Lovable Cloud Auth)
- Persistent sessions with auto-refresh tokens
- Protected routes for orders, checkout, and admin

### 📊 Admin Dashboard
- Revenue, order count, and custom request KPIs
- Category distribution pie chart
- Top products bar chart (Recharts)
- AI impact metrics

### 🎨 Design & UX
- **Amazon-inspired UI** — Dark navy navbar, orange accents, premium spacing
- **Framer Motion animations** — Smooth micro-interactions and page transitions
- **Fully responsive** — Mobile-first with hamburger menu
- **Skeleton loaders** for perceived performance
- **Toast notifications** for all user actions
- **Semantic design tokens** via Tailwind + CSS variables (HSL)

---

## 🧰 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite 5** | Build tool & dev server |
| **TypeScript 5** | Type safety |
| **Tailwind CSS v3** | Utility-first styling |
| **shadcn/ui** | Accessible, themeable component primitives |
| **React Router v6** | Client-side routing |
| **TanStack Query** | Server state management |
| **Framer Motion** | Animations |
| **Recharts** | Admin dashboard charts |
| **Lucide React** | Icon system |
| **Sonner** | Toast notifications |

### Backend (Lovable Cloud — powered by Supabase)
| Service | Purpose |
|---|---|
| **PostgreSQL** | Relational database |
| **Row-Level Security (RLS)** | Per-user data access policies |
| **Supabase Auth** | Email/password authentication |
| **Edge Functions (Deno)** | Serverless AI endpoints |
| **Lovable AI Gateway** | Access to Gemini models without API keys |

### AI Models
- **`google/gemini-2.5-flash`** — Used for chatbot, recommendations, image analysis, and custom request matching (fast, multimodal, cost-effective)

---

## 📁 Project Structure

```
ai-smartshop/
├── public/                          # Static assets
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── assets/                      # Generated images
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives (button, card, dialog, etc.)
│   │   ├── AIChatbot.tsx            # Floating SmartBot chat widget
│   │   ├── ExplainBadge.tsx         # XAI reasoning chip on product cards
│   │   ├── Footer.tsx
│   │   ├── HeroBanner.tsx
│   │   ├── NavLink.tsx
│   │   ├── Navbar.tsx               # Sticky nav with search, voice, cart, wishlist
│   │   └── ProductCard.tsx          # Product tile with add-to-cart + wishlist
│   │
│   ├── context/
│   │   ├── AuthContext.tsx          # Supabase auth state + signIn/signUp/signOut
│   │   ├── BehaviorContext.tsx      # Tracks searches, clicks, generates explanations
│   │   ├── CartContext.tsx          # Cart state with localStorage persistence
│   │   └── WishlistContext.tsx      # Wishlist state with localStorage persistence
│   │
│   ├── data/
│   │   └── products.ts              # Product catalog + Category type
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts            # Supabase client (auto-generated)
│   │       └── types.ts             # DB types (auto-generated)
│   │
│   ├── lib/
│   │   └── utils.ts                 # cn() helper
│   │
│   ├── pages/
│   │   ├── Index.tsx                # Home / product grid (with category filter)
│   │   ├── ProductDetail.tsx        # Single product view
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx         # Address + payment + AI upsell
│   │   ├── OrderSuccessPage.tsx
│   │   ├── OrdersPage.tsx           # User order history
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── RecommendationsPage.tsx  # AI Picks (interest + image upload)
│   │   ├── WishlistPage.tsx
│   │   ├── AdminPage.tsx            # Analytics dashboard
│   │   ├── CustomRequestPage.tsx    # Describe a product → AI matches or logs
│   │   └── NotFound.tsx
│   │
│   ├── App.tsx                      # Router + provider tree
│   ├── App.css
│   ├── index.css                    # Design tokens (CSS variables / HSL)
│   ├── main.tsx                     # App entry point
│   └── vite-env.d.ts
│
├── supabase/
│   ├── config.toml                  # Supabase project config
│   ├── migrations/                  # SQL migrations (auto-managed)
│   └── functions/
│       ├── ai-chat/index.ts         # Streaming chatbot endpoint
│       ├── ai-recommend/index.ts    # Image + interest recommendations
│       └── ai-custom-request/index.ts # Custom product matcher
│
├── .env                             # Auto-generated (Supabase URL + keys)
├── components.json                  # shadcn/ui config
├── tailwind.config.ts               # Tailwind theme + design tokens
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔧 Backend Architecture

### Edge Functions

All AI features run as Supabase Edge Functions (Deno) and call the **Lovable AI Gateway** — no third-party API keys required.

#### 1. `ai-chat` — Streaming Conversational Assistant
- **Input**: `{ messages, productCatalog, userContext }`
- **Behavior**: Streams responses (SSE) from Gemini 2.5 Flash. Injects `userContext` (search history + cart) into the system prompt so suggestions are personalized. Uses `[PRODUCT:id]` markers in replies that the frontend parses and renders as interactive product cards.

#### 2. `ai-recommend` — Personalized Recommendations
- **Input**: `{ interest, imageBase64?, productCatalog }`
- **Behavior**: When an image is uploaded, Gemini analyzes its **style, color tone, and category**, then matches catalog items. Uses **tool calling** to return structured JSON: `{ recommendedIds, explanation, style, colorTone, suggestedCategory }`.

#### 3. `ai-custom-request` — Custom Product Matcher
- **Input**: `{ description, productCatalog }`
- **Behavior**: User describes an ideal product. Gemini searches the catalog and returns `{ matchedIds, explanation }`. If nothing matches, the user can submit a "manufacturing request" stored in `custom_product_requests` for admin review.

### Authentication
- Powered by Lovable Cloud Auth (Supabase Auth under the hood)
- Email/password flow with persistent sessions
- `AuthContext` exposes `user`, `session`, `signIn`, `signUp`, `signOut`

---

## 🧠 AI Capabilities

### Explainable AI (XAI)
Every AI-driven section shows transparent reasoning:
- **Product cards** — *"Recommended because you searched for sneakers"*
- **Checkout upsell** — *"Frequently bought together based on similar users"*
- **Chatbot** — *"Since you have running shoes in your cart, try these socks…"*

The `BehaviorContext` (in `src/context/BehaviorContext.tsx`) is the single source of truth for user signals:
- `searchHistory[]` (last 20)
- `clickedProductIds[]` (last 30)
- `clickedCategories[]`
- `getExplanation(category, sectionType)` — returns human-readable reasoning
- `behaviorSummary` — compact string sent to AI as context

### Image-Based Style Matching
Upload a photo on the **AI Picks** page → Gemini analyzes it and recommends matching catalog products with detected style (Casual/Formal/Trendy/Sporty/Minimalist) and color tone (Light/Dark/Warm/Cool).

---

## 🗄️ Database Schema

Three tables in the `public` schema, all protected by RLS:

| Table | Purpose | Key Columns |
|---|---|---|
| **`addresses`** | Saved delivery addresses | `user_id`, `full_name`, `phone`, `address_line`, `city`, `pincode`, `is_default` |
| **`orders`** | Placed orders | `user_id`, `order_number`, `items` (JSON), `address` (JSON), `total_amount`, `delivery_fee`, `payment_method`, `status` |
| **`custom_product_requests`** | AI-logged manufacturing requests | `user_id`, `description`, `ai_analysis` (JSON), `status` |

All tables enforce `user_id = auth.uid()` via RLS so users can only see their own data.

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js 18+** (or **Bun** — recommended)
- A **Lovable account** (the project ships with Lovable Cloud auto-configured)

### Install dependencies

```bash
# with bun (recommended)
bun install

# or with npm
npm install
```

---

## ▶️ Running the Project

### Development server
```bash
bun run dev
# or
npm run dev
```
The app will be available at `http://localhost:8080`.

### Build for production
```bash
bun run build
```

### Preview production build
```bash
bun run preview
```

### Run tests
```bash
bun run test
```

---

## 🔐 Environment Variables

The `.env` file is **auto-generated and managed by Lovable Cloud** — do not edit manually. It contains:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

### Edge Function Secrets (already configured)
- `LOVABLE_API_KEY` — for the AI Gateway
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` — backend auth

---

## 🚢 Deployment

1. Open the project in [Lovable](https://lovable.dev)
2. Click **Publish** in the top-right
3. (Optional) Connect a custom domain in **Project → Settings → Domains**

Edge functions deploy automatically — no manual steps needed.

---

## 🎬 Demo Flow (For Hackathon)

A suggested 3-minute demo path:

1. **Land on home** → Browse trending / recommended / deals sections (note XAI badges)
2. **Click a category** (Bags → Electronics) → URL syncs, skeleton loaders, products refresh
3. **Voice search** → Click mic in navbar, say "shoes"
4. **Open SmartBot** (bottom-right) → Ask *"What's the best gift under ₹2000?"* → Watch streaming response with embedded product cards
5. **Go to AI Picks** → Upload a fashion photo → See style analysis (color tone, category) + matched products
6. **Try Custom Request** → Type *"a wireless gaming mouse with RGB"* → If no match, submit manufacturing request
7. **Add to cart → Checkout** → Fill address, choose UPI, see upsell suggestions, watch animated payment success
8. **View Orders** → Order appears with status badge
9. **Open Admin** → Show analytics dashboard with revenue, category pie, top products

---

## 🧱 Architecture Highlights

- **Provider tree** (`App.tsx`): `QueryClient → Tooltip → Router → Auth → Cart → Wishlist → Behavior`
- **Design system**: All colors in HSL via CSS variables in `index.css`, mapped to semantic tokens in `tailwind.config.ts`. **No hardcoded colors in components.**
- **State persistence**: Cart, wishlist, and behavior all sync to `localStorage` for guest users; auth state syncs via Supabase
- **Type safety**: End-to-end TypeScript including auto-generated DB types
- **Security**: RLS on every table, no service-role keys in frontend, secrets stored in Supabase Vault


