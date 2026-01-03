## 2024-05-24 - Semantic Range Inputs
**Learning:** `input[type="range"]` natively announces just the numeric value (e.g., "1990"). For semantic data like years, adding `aria-valuetext` (e.g., "Year 1990") provides crucial context for screen reader users, preventing ambiguity.
**Action:** Always add `aria-valuetext` to range inputs when the value has a specific unit or meaning not immediately obvious from the number itself.
