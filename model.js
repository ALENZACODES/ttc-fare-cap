/* TTC Fare Cap Line - fare model. (c) 2026 John K. All rights reserved.
 * Rules (ttc.ca, checked Oct 29, 2026):
 *  - Adult fare paid by PRESTO card, debit or credit: $3.30 per paid trip.
 *  - After 47 paid trips in a calendar month (same card or device), the rest of the month is free,
 *    so a month never costs more than 47 x $3.30 = $155.10.
 *  - Adult 12-Month Pass: $143.00 a month on a 12-month PRESTO contract.
 *  - Post-Secondary Student Monthly Pass: $128.15, bought month by month.
 * All money is handled in whole cents to avoid floating-point drift.
 */
(function (root) {
  var FARE = 330, CAP_TRIPS = 47, CAP = FARE * CAP_TRIPS;   // 15510 cents
  var PASS_12M = 14300, PASS_STUDENT = 12815;               // cents per month

  function clampTrips(t) { t = Math.floor(+t); return isFinite(t) && t > 0 ? t : 0; }
  function paidTrips(t) { return Math.min(clampTrips(t), CAP_TRIPS); }
  function freeTrips(t) { return Math.max(0, clampTrips(t) - CAP_TRIPS); }
  function capCost(t) { return paidTrips(t) * FARE; }                 // with the 47-trip cap
  function noCapCost(t) { return clampTrips(t) * FARE; }              // what the same trips would cost uncapped
  function breakEven(passCents) {                                      // first trip count where paying per ride costs more than the pass
    for (var t = 0; t <= CAP_TRIPS; t++) if (capCost(t) > passCents) return t;
    return null;                                                       // the cap never exceeds the pass
  }

  /* p: { trips: paid trips in a typical month, lightMonths: 0-12, lightTrips: paid trips in a light month, student: bool } */
  function compare(p) {
    var trips = clampTrips(p.trips), L = Math.max(0, Math.min(12, Math.floor(+p.lightMonths || 0)));
    var lt = clampTrips(p.lightTrips), student = !!p.student;
    var pass = student ? PASS_STUDENT : PASS_12M;
    var month = capCost(trips);
    var capYear = (12 - L) * month + L * capCost(lt);
    // 12-month pass is a contract: paid all 12 months. Student pass is bought only in months where it is cheaper.
    var passYear = student ? (12 - L) * Math.min(month, pass) + L * Math.min(capCost(lt), pass) : 12 * pass;
    var monthDiff = month - pass;                                      // >0: the pass is cheaper this month
    var verdict = monthDiff > 0 ? 'pass' : (monthDiff === 0 ? 'tie' : 'cap');
    var yearDiff = capYear - passYear;                                 // >0: the pass plan is cheaper over the year
    return {
      trips: trips, paid: paidTrips(trips), free: freeTrips(trips),
      month: month, noCap: noCapCost(trips), capSaved: noCapCost(trips) - month,
      pass: pass, passName: student ? 'Post-secondary monthly pass' : 'Adult 12-Month Pass',
      breakEven: breakEven(pass), monthDiff: monthDiff, verdict: verdict,
      lightMonths: L, lightTrips: lt, capYear: capYear, passYear: passYear, yearDiff: yearDiff,
      yearVerdict: yearDiff > 0 ? 'pass' : (yearDiff === 0 ? 'tie' : 'cap')
    };
  }

  function money(c) { var s = c < 0 ? '-' : ''; c = Math.abs(Math.round(c)); return s + '$' + Math.floor(c / 100).toLocaleString('en-CA') + '.' + String(c % 100).padStart(2, '0'); }

  var api = { FARE: FARE, CAP_TRIPS: CAP_TRIPS, CAP: CAP, PASS_12M: PASS_12M, PASS_STUDENT: PASS_STUDENT,
    paidTrips: paidTrips, freeTrips: freeTrips, capCost: capCost, noCapCost: noCapCost, breakEven: breakEven, compare: compare, money: money };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FareModel = api;
})(this);
