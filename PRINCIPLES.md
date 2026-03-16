# Scentmap Brand Principles & AI Integration Guide

## 1. Our Core Mission
> *"To demystify fragrance through data, empowering everyone—from the 50-bottle collector to the first-time buyer—to understand what they smell, maximize what they own, and buy what they love with absolute confidence."*

We believe fragrance is too expensive to be a guessing game, and too subjective to rely on department store salespeople or marketing fluff. We use objective data (sillage, structure, note overlap) to explain subjective experiences (warmth, freshness, complexity).

**We are not a static database (a "Map"). We are a dynamic, personal "Engine" (an Olfactive Wardrobe, a Scent Alchemist).**

---

## 2. Brand Positioning: What We Are vs. What We Aren't

| What We Are | What We Aren't |
| :--- | :--- |
| **A Mathematical Engine:** We use data (sillage difference, note overlap) to generate layering recipes and similarity matches. | **A Marketing Brochure:** We don't push sponsored links or rely on AI-generated fluff. We show the math. |
| **A Digital Wardrobe:** We provide instant utility by showing users how to mix what they *already own*. | **Just Another List:** We aren't just a place to log bottles; we actively analyze your collection for gaps. |
| **A Demystifier:** We translate complex jargon ("Chypre", "Aldehydic") into plain-English sensory sliders (Warmth, Sweetness). | **A Fragrance Snob:** We don't gatekeep. We make high-end concepts accessible to the 5-bottle owner. |
| **An Advisor:** We protect users from redundant purchases (e.g., "You already own an 85% match"). | **A Sales Funnel:** We don't blindly push the newest releases unless they mathematically fit the user's profile. |

---

## 3. The "Give to Get" Trust Model (Handling User Data)
Users are trusting us with their highly specific "Owned" and "Wishlist" data—representing thousands of dollars. We must prove that giving us data *benefits the user first*. People on platforms like Reddit are highly cynical of giving apps their data if it's just used to sell them more stuff.

*   **Instant Utility:** If a user inputs 10 bottles, we immediately give them 15 new layering combinations. *The reward is instant utility, not an ad.* "We help you shop your own stash."
*   **Protection over Promotion:** We act as a financial advisor for their collection. If they add a $300 bottle to their Wishlist, we gently warn them if they already own an 85% match. "Are you sure you need this?"
*   **Data Portability:** Users own their wardrobe. They should always feel they can export their data (e.g., local CSV or JSON exports). If users feel they own their data, they will meticulously catalog their entire 100-bottle collection.

---

## 4. How We Win the Fragrance Community (e.g., r/fragrance)
The online fragrance community is tired of "Tinder for Perfume" clones and AI quizzes that just push sponsored designer scents. We must launch and exist as a tool *for* the community, not a product *sold to* them.

*   **Countering "Another app pushing links":** Our algorithm is purely mathematical (sillage, note intersection, family compatibility). We show the exact math of why two scents match. Transparency beats black-box AI.
*   **Countering "The notes are always wrong":** We explicitly state our philosophy: *"Key materials only — simplified pyramid."* We focus on the *sensory profile* (Warmth, Sweetness) rather than arguing over imaginary marketing notes like "solar accord."
*   **Countering "It doesn't include indie houses":** The app's value is in the depth of the analysis, not just the size of the database. A highly curated database with perfect layering and similarity data is more valuable than a scraped database of 50,000 scents with no insights.
*   **Countering "I just use a spreadsheet":** A spreadsheet can't calculate that your Byredo layers perfectly with your Tom Ford because of a 30% sillage differential and complementary chypre/woody bases. We do the math a spreadsheet can't.

---

## 5. Guiding Principles for AI Feature Development
*When building new features, writing copy, or implementing logic, the AI must adhere to these principles:*

### A. Show the Math (The Reddit Rule)
Fragrance communities (like r/fragrance) are highly cynical of "black box" AI.
*   **Action:** Whenever suggesting a layering pair or a similarity match, *always explain why*.
*   *Example:* Don't just say "Layers well with [Scents]." Say "Layers well because it adds a woody base to balance the sweetness, with a 30% sillage differential."
*   *Implementation:* Use the existing `getSwapReason` and layering logic to generate these explanations.

### B. Utility Over Size
The app's value isn't in having 50,000 scraped fragrances with no insights. It's in having perfect, deep data (roles, sillage, note structure) for the scents we do have.
*   **Action:** Prioritize features that analyze existing data deeply (like the "Wardrobe Gap" analysis or sensory profiles) over features that just list more data.

### C. Translate, Don't Dumb Down
*   **Action:** Maintain respect for the art of perfumery while making it accessible. Use the `computeProfile` engine to map complex notes into understandable sensory dimensions (Freshness, Warmth, Complexity).
*   *Example:* Keep the "Top/Mid/Base" pyramid structure, but explicitly state "Key materials only — simplified pyramid" to avoid arguing over marketing notes.

### D. Focus on the Three Core Users
Every feature must serve at least one of these users:
1.  **The Analytical Collector (50+ bottles):** Needs layering recipes, gap analysis, and collection management.
2.  **The Guided Explorer (3-7 bottles):** Needs confidence for their next purchase, sensory translations, and safe blind-buy recommendations.
3.  **The Gifter / Risk-Averse Buyer:** Needs similarity matching to mitigate the risk of buying the wrong gift.

---

## 6. Upcoming Feature Roadmap (Applying the Principles)
*   **"Wardrobe Report Card":** A highly visual, shareable analysis of a user's collection (e.g., "Your collection is 80% warm and 20% fresh. You are missing a summer aquatic.").
*   **"Scent of the Day" (SOTD) Layering Engine:** Daily suggestions for layering recipes using *only* the bottles marked as "Owned".
*   **"Redundancy Warning":** Alerts on the Wishlist if a new scent is mathematically too similar to an owned scent.