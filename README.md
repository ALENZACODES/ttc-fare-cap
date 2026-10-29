# Fare Cap Line

**Live:** https://alenzacodes.github.io/ttc-fare-cap/

An interactive subway-line map that answers one question for Toronto riders: is the TTC's new 47-trip monthly fare cap worth chasing, or does the Adult 12-Month Pass still win?

Drag the train along the line to set your paid trips in a typical month. Two more levers cover real life: how many light months you have a year (holidays, summer, remote stretches) and how many trips you take in them. A toggle swaps in the post-secondary monthly pass. The page shows this month's cost, a plain-language verdict, the free trips you unlock after the cap, a full-year comparison and a cost chart.

## The rules it uses

From ttc.ca, checked October 29, 2026 ([Fares and passes](https://www.ttc.ca/Fares-and-passes), [TTC monthly fare capping](https://www.ttc.ca/riding-the-ttc/Updates/TTC-monthly-fare-capping)):

- The adult fare paid with a PRESTO card, debit or credit card is **$3.30**.
- Monthly fare capping started **September 1, 2026**. After **47 paid trips** in a calendar month, using the same payment method and card or device, the rest of that month's TTC trips are free. So a month never costs more than 47 × $3.30 = **$155.10**.
- A paid trip is the first tap that starts a two-hour transfer window.
- The adult monthly pass was discontinued **August 31, 2026**. The **Adult 12-Month Pass ($143.00 a month)**, a 12-month PRESTO contract, and the **Post-Secondary Student Monthly Pass ($128.15)** are still sold.

## What it shows

- **Break-even is trip 44, not 43.** 43 trips cost $141.90, still under $143. 44 trips cost $145.20.
- **Hitting the cap doesn't beat the pass.** The cap ($155.10) is $12.10 more than the 12-Month Pass, so a rider at 47+ trips every month saves $145.20 a year with the pass.
- **Two light months flip it.** At 47+ trips for 10 months and 20 trips in the other 2, the cap costs $1,683.00 against $1,716.00 for the pass, so tapping wins by $33.00.

## How it was built

The first version was built with Google Gemini Canvas ([shared canvas](https://share.gemini.google/5eE5QGKwjGvA)). I kept Gemini's subway-line idea and rebuilt the page by hand:

- Gemini's first plan put the break-even at "Station 43". It's 44.
- After a refinement, Gemini's script broke (a truncated script tag) and the page froze at 0 trips.
- The trip 44 and trip 47 labels overlapped. The page also opened at 0 trips.
- The math now lives in [`model.js`](model.js), in whole cents.

[`tests/model.test.js`](tests/model.test.js) checks every trip count from 0 to 120 against a separate tap-by-tap implementation: costs, the cap at 47, the free trips after it, the 44-trip and 39-trip break-evens, and 21,175 full-year combinations. Run it with `node tests/model.test.js`.

## Not advice

Educational, not financial advice. It assumes adult fares paid with one card or device all month. Switching cards or devices splits your count, cash fares don't count toward the cap, and rules can change. Check ttc.ca before you choose.

© 2026 John K. All rights reserved.
