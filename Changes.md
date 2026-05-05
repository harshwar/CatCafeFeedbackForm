
# Cat Café Dashboard — Change List v2

After the first set of changes I have noticed the following updates are still needed.

---

## 🗑️ Remove

- **"Other" Breakdown section in Reports** — was on the original remove list, still present. Removes itself as a concern once deleted, too granular for single café scale.
- **Hardcoded fake trend arrows on stat cards** — still showing "+10% this week" on Total Feedback which is not calculated from real data.

---

## 🔧 Fix

- **Rename "Operations Radar" to "Category Overview"** — still showing old name in Reports page.
- **Rename "Operational Reports" to "Reports"** — simpler and cleaner.
- **Performance bar trend arrows** — bars are color coded correctly but no up/down arrows comparing this month vs last month per category. Add small arrow next to each score.
- **Most complained area this week** — the Business Intelligence banner covers average rating and feedback count but doesn't specifically call out the single lowest category this week as a standalone highlight card. Add separately below the banner.
- **Feedback cards too dense** — every card is fully expanded by default showing all details at once making the list very long and hard to scan. Needs accordion — default state shows name, overall rating, experience quote, and action buttons only. Detailed ratings and customer profile collapse behind a "View Details" toggle.

---

## ➕ Add

- **Skeleton loading throughout** — not visible yet. Every card, chart, and stat should show animated grey placeholder shapes while data is loading before content appears.
- **Toast and snackbar notifications** — not confirmed present yet. Needed for form submission success, CSV export complete, filter applied, and any error states.
- **Bento grid on Overview** — current layout is standard uniform grid. Needs asymmetric sizing — large card for volume chart, small cards for stats, full width banner at top, medium cards for day of week and performance.
- **Carousel for Recent Voice** — currently shows a single static quote card. Should be a swipeable carousel showing last 3 to 5 feedback quotes one at a time with dot indicators.
- **Empty state illustrations** — when filters return no results, needs a friendly message and small illustration instead of a blank white area.
- **Sort options on Feedback page** — dropdowns visible but sort by Newest, Oldest, Highest Rated, Lowest Rated not clearly present yet.
- **Accordion on feedback cards** — as mentioned in Fix section, default collapsed state with expand toggle needed.

---

