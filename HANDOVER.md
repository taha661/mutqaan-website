# Mutqaan website: handover (release v3, 10 Nov 2026)

## 1. Where it lives
| | Status |
|---|---|
| **Claude artifact** (full version: live 3D, AI Studio, owner CMS, inbox) | Published. Private to the owner until shared from the artifact's Share menu. |
| **Public HTTPS site on Vercel** (this folder) | **Not yet deployed.** Needs the owner's GitHub + Vercel accounts (steps in section 5). Built and tested locally, not on a live URL. |
| Signed-out public visitor check | **Not done yet.** It happens after the Vercel deploy. |

The master prompt's final deliverable is a verified public URL, so the assignment is **not complete** until Vercel is deployed and checked.

## Update v4 (10 Nov 2026)
- **3D engine v2:** procedural materials (wood floors, tiles, stone, marble, fabric, grass, concrete), glossy reflections and clouds. Redesigned interiors: living room with media wall, dining, a full kitchen with island and stools, and a bedroom; terrace and pool furniture. The camera tour now ends in the kitchen. All renders were regenerated, plus a new kitchen render.
- **Simpler inquiry form:** name, phone/WhatsApp and message, with service, email and location optional. Up to 3 photos, stored privately and visible only in Admin > Inbox (`/api/admin/inqimg`, signed-in only). A Roman Urdu note and examples are on the form.
- **Alerts:**
  - An email alert goes to the site email through FormSubmit after an inquiry is saved. FormSubmit sends a one-time activation email to that address first, and the owner must click **Activate**.
  - The success screen offers "Send on WhatsApp" to the owner's number.
  - The inbox does not depend on either alert.
- **Tests:** 45 server tests, including photo validation and privacy.

## 2. What was built
- **Design:** an ivory, navy and gold editorial system, the owner's original logo, and serif headings (Newsreader) with Instrument Sans body text, both from Google Fonts. Light and dark themes.
- **Imagery:** original concept renders produced by an in-house WebGL engine (`source/engine.js`). Every image is labelled as illustrative; there are no stock photos and no client work.
- **Homepage:**
  - Hero render and a company introduction.
  - Space/Lines/Details reveal: clay massing, linework traced from the model, and the render, all from the same model.
  - Service index with hover previews.
  - **Live 3D villa:** orbit, morning/noon/dusk/night light, 4 facade materials, a scrubbable camera tour into the living room, then stills.
  - Projects, Studio preview, a material comparison, process steps and contact.
- **Seven service pages** covering who it helps, problems, scope, deliverables, inputs, process, related work, FAQs and a service-prefilled inquiry. The visualisation page also embeds the model and states its per-project terms. No 360/VR claim; the toggle is in Settings.
- **Our Projects:** status and type filters, empty states, and case-study pages with gallery, challenge, scope, decisions, materials, provenance and related services. The 3 concept studies are labelled as such.
- **Construction Materials:** search, category filter, detail pages and compare-up-to-3. Each entry has a source and review date. No prices or availability.
- **Our Approach:** the process, approval gates and a "what we will not do" list.
- **Privacy & AI notice page.**
- **Project Studio:**
  - Adapts to the service: interiors get room questions; construction, drawings, estimation and consultancy route to professional review.
  - Consent comes before any photo is selected. Up to 3 photos are re-encoded in the browser, which strips EXIF and location; they can be removed and are never stored.
  - 2 AI directions plus 1 refinement, all admin-configurable.
  - Each direction shows a palette (3 or more roles), retained elements, proposed changes, assumptions, unresolved checks, a text description and a 3D room preview.
  - The brief downloads as a PDF or copies as text, and sends into the inquiry form.
  - Preset (non-AI) directions are clearly labelled when AI is unavailable.
- **Inquiry form:**
  - Validation, a honeypot, separate opt-in marketing consent and an idempotency key.
  - It confirms truthfully: either a receipt ID, or "Not sent yet" with WhatsApp, email and copy options.
- **Owner admin (`#admin`):**
  - Inbox with qualification, the workflow board, questions to HOO, notes and history.
  - Content editor for services, projects and materials: drafts, preview, publish, delete, and a provenance gate on publishing.
  - Media uploads (EXIF stripped), contact settings, AI limits, and a publish history.

## 3. Completion table
| Requirement | Status | Evidence |
|---|---|---|
| Premium site, logo, nav, 7 service pages, homepage progression | Done | Browser QA at 360, 390, 768, 1024 and 1440 px, light and dark: no horizontal overflow, no script errors |
| 3D visualisation feature, honestly labelled | Done | Real-time model; labels state "illustrative" and "camera path through the 3D geometry, not a film of a built project" |
| Project filters, case studies, empty states | Done | QA: Built filter shows the empty state; Walkthrough shows 1 |
| Materials search, detail and compare up to 3 | Done | QA: 4th selection refused; comparison table renders |
| Keyboard focus, labels, reduced motion | Done (basic) | Visible focus ring, skip link, labelled inputs, `prefers-reduced-motion` honoured. No full screen-reader audit yet. |
| Inquiry persistence, exactly once, with receipt | Done on Vercel stack (local) | `npm test`: idempotency, honeypot, rate limit, cross-origin refusal. End-to-end browser test: receipt MQ-xxxxxxxx shown in the inbox |
| Inquiry inbox (artifact) | Done for signed-in viewers | DB rules verified: owner reads all; ordinary viewer cannot read others or write workflow |
| Admin auth | Done on Vercel stack (local) | Signed HMAC cookie (HttpOnly, Secure, SameSite=Strict), 8-hour expiry, server-side logout revocation, login rate limit. **No MFA** (single password). |
| CMS with drafts, publish, audit, provenance gate | Done | E2E: edited service visible to a fresh visitor after publish; versions kept (`content:v:N`); invalid provenance refused (server and client) |
| Workflow HOO → Creative → Designer → Estimator with gated approvals | Done | Tests: gate blocks, approver required, client approval must be confirmed, design revision voids downstream approvals and moves back, stale writes refused (compare-and-set) |
| Private photo-to-concept-to-brief journey | Done in the artifact (via Claude `sample`) | Code path built; **live AI call not executed in testing** (no AI access from the build environment). Preset path and PDF tested. |
| AI on the public Vercel site | Built, **disabled** | Needs `ANTHROPIC_API_KEY` and `AI_DAILY_LIMIT`. Spend caps and refund-on-failure covered by tests with a mocked provider; **live provider untested** |
| Background job queue for AI | **Not built** | Generation is a single synchronous request with a 55 s timeout. A durable queue (queued, processing, ready…) is a documented next step. |
| Private object storage for client photos | **Not needed in this design** | Photos never leave the browser except to the AI provider. Owner portfolio uploads use public media storage after provenance review. |
| Customer accounts, private project workspaces | **Not built** | Visitors browse anonymously and inquire. Client portals are a future extension. |
| Email/WhatsApp notifications | **Not built** | The inbox does not depend on them. WhatsApp and email links are shown for direct contact. |
| Server-generated PDF exports | **Partial** | The PDF is generated in the browser from the visitor's own data, so there is no stored data to protect. |
| SEO metadata, social preview, JSON-LD | Partial | Title, description, OG tags and organisation JSON-LD (verified phone and email only). Hash routes are not separately indexable; no sitemap until a domain is set. |
| Core Web Vitals | Not measured | Images 34–74 KB each; 3D starts only when scrolled near. No Lighthouse run (no network in the build environment). |
| Public HTTPS launch and signed-out check | **Blocked** | Waiting on GitHub and Vercel accounts |

## 4. Architecture
- **Front end:** one static `index.html`. It reads `content.json` on load, plus `/api/content` if the CMS has saved a version. It renders everything from that content with HTML escaping and allowlisted image sources. There are no npm dependencies.
- **Content:** `public/content.json` is the seed. On Vercel, CMS saves go to Redis (`content`, previous versions in `content:v:N` for 90 days). In the artifact, CMS saves rewrite the published `content.json` file, and the artifact keeps every version.
- **Vercel functions (`api/`):** `health`, `inquiry`, `content`, `media`, `studio`, and `admin/{login,logout,session,inquiries,content,media}`. Shared code lives in `lib/server.js` and `lib/workflow.js`, the same rules the browser uses.
- **Store:** Upstash Redis over REST. Keys:
  - `inq:<id>`, `inq:ids` (list) and `wf:<id>` (workflow record with version `v`)
  - `idem:<key>` (24 h)
  - `rl:*` (rate limits)
  - `media:<id>` (+`:t` for type), `media:ids`
  - `content`, `content:ver`, `content:v:N`
  - `audit`, `usage`
  - `ai:<day>:*` (spend counters)
  - `sess:revoked:<n>`
- **Concurrency:** workflow writes use a Lua compare-and-set on `v`.
- **Environment variable names** (values never in source):
  - `KV_REST_API_URL` and `KV_REST_API_TOKEN`, set automatically by the Upstash integration (`UPSTASH_REDIS_REST_*` also accepted)
  - `ADMIN_PASSWORD` (at least 12 characters)
  - `SESSION_SECRET` (at least 32 random characters)
  - Optional: `ANTHROPIC_API_KEY`, `AI_DAILY_LIMIT`, `AI_PER_VISITOR` (default 4), `AI_MODEL`

## 5. Deploy on Vercel (owner steps marked ★)
1. ★ Create an empty GitHub repo `mutqaan-website` and connect GitHub in claude.ai Settings → Connectors. Claude pushes this folder.
2. ★ vercel.com → Add New → Project → import `mutqaan-website` → Deploy. No build settings needed: `vercel.json` sets `outputDirectory: public`.
3. ★ Project → Storage → Marketplace → **Upstash Redis** (free plan) → connect to the project. This sets the KV variables.
4. ★ Project → Settings → Environment Variables:
   - `ADMIN_PASSWORD`: a strong password only you know.
   - `SESSION_SECRET`: generate one with a password manager, at least 32 characters.
   - Then redeploy. Type these yourself in Vercel; never paste them into chat.
5. Claude then checks the public URL signed out: homepage, services, projects, materials and inquiry. It sends a synthetic inquiry, signs in to admin, checks the inbox and workflow, then deletes the test records.

**Rollback:** Vercel → Deployments → pick a previous deployment → *Promote to Production*. Content rollback: earlier versions are kept as `content:v:N`; ask Claude to restore one.

## 6. Security review (self-review, not an independent audit)
**Threat model:** private-home photos, account takeover, cross-project access, malicious uploads, prompt injection, API cost abuse, privileged CMS access.

**Controls in place:**
- Studio photos are never stored. They are re-encoded in the browser, which strips EXIF, and consent comes first.
- Admin routes need a signed session. Cookies are HttpOnly, Secure and SameSite=Strict. Cross-origin writes and non-JSON bodies are refused.
- Login and inquiries are rate-limited, and comparisons are timing-safe.
- Uploads are checked by magic bytes, not extension. They are size-capped, get random names, and are served with nosniff and the sniffed type. SVG and HTML are refused.
- CMS content is validated server-side: provenance gate, image-source allowlist, size cap. All rendering escapes HTML.
- AI output is treated as untrusted. It is schema-validated, colour values are regex-checked, layout values come from enum lists, and text is length-capped. Prompts tell the model that visitor text is data, and limits and approvals are enforced outside the model.
- AI spend is capped per visitor and per day, with reservation, and the allowance is refunded when the provider fails.
- Errors are redacted.
- Headers: CSP, HSTS, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy.

**Remaining risks and limits:**
- Single admin password, no MFA. Use a long unique password, and consider Vercel's Password Protection for previews.
- CSP allows `'unsafe-inline'` scripts because the page is a single file. Moving the scripts to separate files would allow a strict CSP.
- Draft CMS entries are hidden from visitors but readable in `content.json`. Don't put confidential text in drafts.
- No penetration test or dependency scan; there are no dependencies to scan. Redis backups follow Upstash's plan and were not tested.
- Live AI providers were not exercised. Rate limits key on the client IP header Vercel provides.

## 7. Costs and limits
- Measured cost so far: **$0**.
- Vercel Hobby and the Upstash free tier fit the current scale; check their current plan limits before a traffic spike.
- AI is off on Vercel until a key and `AI_DAILY_LIMIT` are set. In the artifact, AI use runs on the viewer's own Claude allowance.
- Configured limits:
  - Inquiries: 6 per hour per connection.
  - Login: 8 per 15 minutes.
  - Uploads: 60 per hour, 750 KB per image.
  - Studio AI: 3 photos, 2 directions, 1 refinement (editable in Admin → Settings).

## 8. Extending the site
- **Add a service, project or material:** Admin → Content → *+ New* → fill in fields → tick *Published* → **Publish changes**. Use *Preview this page* first.
- **Add real project photos:** Admin → Media → Upload, or *+ Upload image* inside a project. Add alt text, a caption, and the client's permission in **provenance**; publishing is refused without it. Mark verified location, date and outcome only when approved for disclosure.
- **Change contact details or AI limits:** Admin → Settings.
- **Future tools** (client portal, scheduling, sourcing, VR): add a route in `ROUTES` (`source/app-core.js`), keep content in `content.json`, and put server logic in a new `api/` function that reuses `lib/server.js`. Feature flags live in `settings.flags`.
- **Rebuild after code edits:** `python3 source/build.py` regenerates `public/index.html`, then run `npm test`.
