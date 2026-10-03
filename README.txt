MOUNT HOLLY SENIOR LIVING — WEBSITE (2026 REDESIGN)

01. PAGES
index.html      Homepage: hero, "small by design", living moments, three care collections, founder quote, how a visit works
about.html      Founder story (text unchanged), mission, vision, promise, nursing leadership
services.html   All 11 Signature Services in three collections, with a sticky jump bar
living.html     Our Home: rooms, dining, shared spaces, family, the advantage of a six-resident home
gallery.html    15 temporary photos with filters and an accessible full-screen photo viewer
contact.html    Private visit inquiry form, visit details, "what happens next", FAQ
404.html        Friendly not-found page (point your host's 404 setting at this file)
styles.css      Design system: tokens, typography, components, page sections, responsive rules
script.js       Navigation, social links, reveal animations, gallery viewer, inquiry form
api/inquiry.php Direct inquiry email handler (PHP 8+)
fonts/          Self-hosted Newsreader (headings) and Figtree (body), SIL Open Font License
images/         Logo, transparent logo marks, temporary photography

02. HOSTING & DIRECT FORM
Upload the full folder contents to a PHP 8+ web host. Open index.html as the homepage.
The form submits directly to api/inquiry.php; it never launches the visitor's email application.
Configure the host's outbound mail service, and authorize website@mounthollyseniorliving.com as a sender.
Inquiries are sent to info@mounthollyseniorliving.com with the visitor email as Reply-To.
Use HTTPS. Configure SPF/DKIM according to your mail host's instructions.
Before launch, submit a test inquiry and confirm receipt in the destination mailbox.
PHP mail acceptance does not guarantee inbox delivery; validate delivery with your hosting provider.
The backend validates fields, rejects cross-origin browser requests, traps simple bots, and rate-limits IPs (one inquiry per minute).
No inquiry is stored in a public file. Only hashed IP timestamps are stored in a private temporary folder.
Ask your host to periodically remove rate-limit files older than one day.
If mail is unavailable, the form shows a clear error, keeps the visitor's input, and offers the email address.
Without JavaScript the form still works: the browser validates required fields and the server shows a styled result page.
A preferred visit date is a request, not a confirmed appointment (the form and FAQ say so).
Static-only hosting (including GitHub Pages) cannot execute this PHP handler. A server endpoint must be connected there.

Linking to a pre-selected topic: contact.html?interest=visit | availability | care | question
(services.html uses ?interest=care for its "Discuss care options" button).

03. SOCIAL LINKS
Near the top of section 02 in script.js, replace null in socialLinks with your official HTTPS URLs:
Facebook: 'https://www.facebook.com/YOUR_PAGE'
LinkedIn: 'https://www.linkedin.com/company/YOUR_PAGE'
Instagram: 'https://www.instagram.com/YOUR_PAGE'
Until configured, each social icon displays a "coming soon" message instead of sending visitors to an unrelated profile.

04. PHOTOGRAPHY
All supplied photos remain temporary illustrative images. Captions, alt text, a gallery notice, and the footer say so.
Replace images with professional photos of the actual residence before final launch.
Preserve filenames to replace images without editing HTML, or update the matching src attributes.
Photos were re-compressed (about 25% smaller in total); originals wider than 1800px were resized to 1800px.
If a replacement photo has different proportions, update the width/height attributes on its <img> tag.
brand-mark.webp / brand-mark-light.webp are transparent versions of brand.png for the header and footer.
The original brand.png and logo.png are retained unchanged.

05. INFORMATION
Address and email are preserved. Phone and fax remain "coming soon".
All 11 services use the approved descriptions; Medication Management replaces Medication Assistance.
Memory support is not mentioned. Leadership uses Experienced Nursing Leadership.
No founder name, headshot, testimonials, pricing, or availability claims have been added.
The first-person origin story is unchanged.
Facts used in new UI (six residents, private rooms, 24-hour care, nutritionist-guided home-cooked dining,
25+ years in healthcare) all come from the existing approved copy.

06. DESIGN SYSTEM (styles.css, section 01)
Colors: forest greens from the logo, warm ivory/linen neutrals, a brass accent. Text colors meet WCAG AA contrast.
Type: Newsreader for headings, Figtree for body text at 17–18px for comfortable reading.
Components: .button (+ -light, -ghost, -ghost-light, -sm), .text-link, .eyebrow, .icon-badge, .photo,
.collection, .service-card, .feature-card, .step, .info-card, .faq-list, .invitation-card.
Icons are inline SVG line icons, so they inherit color and need no icon library.
Animations are subtle, and are switched off for visitors who prefer reduced motion.
The shared header, invitation, and footer are repeated in each HTML file; edit all pages when changing them.

07. CHECKS COMPLETED (Chromium, desktop 1440px, tablet 820px, phone 390px)
No console errors, missing assets, broken internal links or anchors, duplicate IDs, or horizontal overflow on any page.
axe-core accessibility scan (WCAG 2.1 AA + best practice): no violations on any page at desktop or phone width.
Mobile menu: opens/closes, Escape closes and returns focus, keyboard focus stays inside, page scroll locks.
Gallery: filters, viewer with keyboard arrows, swipe, wrap-around, focus returned on close.
Form: inline validation, past-date rejection, loading state, success state, server error (rate limit),
network failure, and no-JavaScript fallback were all exercised against the real PHP handler (PHP 8.3, mail stubbed).
Still required before launch: a live test inquiry on your production host to confirm real email delivery.
