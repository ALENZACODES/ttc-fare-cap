// Exhaustive check of model.js against an independent implementation written separately
// (trip-by-trip fare loop in dollars, rounded to cents), for every trip count 0-120.
// Run: node tests/model.test.js
const M = require('../model.js');
let fails = 0, checks = 0;
const ok = (c, msg) => { checks++; if (!c) { fails++; console.log('FAIL', msg); } };

// Independent: walk through the month tap by tap, charging $3.30 until 47 paid trips have been charged.
function indepMonth(trips) {
  let charged = 0, total = 0, free = 0;
  for (let i = 1; i <= trips; i++) {
    if (charged < 47) { total = Math.round((total + 3.30) * 100) / 100; charged++; } else free++;
  }
  return { total, charged, free };
}
const cents = d => Math.round(d * 100);

for (let t = 0; t <= 120; t++) {
  const a = indepMonth(t), r = M.compare({ trips: t, lightMonths: 0, lightTrips: 0 });
  ok(r.month === cents(a.total), `t=${t} cost ${r.month} vs ${cents(a.total)}`);
  ok(r.paid === a.charged && r.free === a.free, `t=${t} paid/free`);
  ok(r.noCap === cents(t * 3.30), `t=${t} uncapped`);
  ok(r.month <= 15510, `t=${t} never above $155.10`);
  if (t >= 47) ok(r.month === 15510 && r.free === t - 47, `t=${t} capped, ${t - 47} free`);
  if (t > 0 && t <= 47) ok(r.month - M.capCost(t - 1) === 330, `t=${t} each trip up to 47 costs $3.30`);
  if (t > 47) ok(M.capCost(t) === M.capCost(t - 1), `t=${t} trip after 47 is free`);
  // verdict vs $143 12-Month Pass: independent comparison in dollars
  const passWins = a.total > 143.00;
  ok((r.verdict === 'pass') === passWins, `t=${t} verdict ${r.verdict}`);
  ok(r.verdict !== 'tie', `t=${t} no exact tie at $143`);
  // student: $128.15
  const s = M.compare({ trips: t, student: true });
  ok((s.verdict === 'pass') === (a.total > 128.15), `t=${t} student verdict`);
}

// break-evens
ok(M.breakEven(14300) === 44, 'break-even 12-Month Pass = 44');
ok(cents(indepMonth(43).total) === 14190 && cents(indepMonth(44).total) === 14520, '43 -> $141.90, 44 -> $145.20 (so not 43)');
ok(M.breakEven(12815) === 39, 'student break-even = 39');
ok(cents(indepMonth(38).total) === 12540 && cents(indepMonth(39).total) === 12870, '38 -> $125.40, 39 -> $128.70');
ok(M.CAP === 15510 && cents(47 * 3.30) === 15510, 'cap $155.10');
ok(M.money(15510) === '$155.10' && M.money(171600) === '$1,716.00' && M.money(-1210) === '-$12.10', 'money format');

// annual: every trips x lightMonths(0-6) x lightTrips(0-120 step 5), vs independent sum
let annual = 0;
for (let t = 0; t <= 120; t++) for (let L = 0; L <= 6; L++) for (let lt = 0; lt <= 120; lt += 5) {
  const r = M.compare({ trips: t, lightMonths: L, lightTrips: lt });
  const capY = cents((12 - L) * indepMonth(t).total + L * indepMonth(lt).total);
  ok(r.capYear === capY, `annual cap t=${t} L=${L} lt=${lt}`);
  ok(r.passYear === 171600, 'pass year 12 x $143');
  ok(r.yearDiff === capY - 171600, 'year diff');
  const s = M.compare({ trips: t, lightMonths: L, lightTrips: lt, student: true });
  const sY = cents((12 - L) * Math.min(indepMonth(t).total, 128.15) + L * Math.min(indepMonth(lt).total, 128.15));
  ok(s.passYear === sY, `student year t=${t} L=${L} lt=${lt}`);
  annual++;
}

// headline cases
const d = M.compare({ trips: 40, lightMonths: 2, lightTrips: 20 });
ok(d.month === 13200 && d.verdict === 'cap' && d.monthDiff === -1100 && d.capYear === 145200 && d.yearDiff === -26400, 'default 40/2/20');
const h0 = M.compare({ trips: 47, lightMonths: 0 }), h1 = M.compare({ trips: 47, lightMonths: 1, lightTrips: 20 }), h2 = M.compare({ trips: 47, lightMonths: 2, lightTrips: 20 });
ok(h0.monthDiff === 1210 && h0.yearDiff === 14520, '47 every month: pass saves $12.10/mo, $145.20/yr');
ok(h1.yearDiff === 5610, 'one 20-trip month: pass still saves $56.10');
ok(h2.yearDiff === -3300, 'two 20-trip months: cap wins by $33.00');
ok(M.compare({ trips: 'abc' }).month === 0 && M.compare({ trips: -5 }).month === 0, 'bad input -> 0');

console.log(`default (40 trips, 2 light months of 20): month ${M.money(d.month)}, saves ${M.money(-d.monthDiff)} vs $143; year cap ${M.money(d.capYear)} vs pass ${M.money(d.passYear)} -> cap saves ${M.money(-d.yearDiff)}`);
console.log(`47 trips all year: pass saves ${M.money(h0.yearDiff)}; with 1 light month (20): pass saves ${M.money(h1.yearDiff)}; with 2: cap saves ${M.money(-h2.yearDiff)}`);
console.log(`${checks} checks (${annual} annual combos), ${fails} failures -> ${fails ? 'FAIL' : 'ALL PASS'}`);
process.exit(fails ? 1 : 0);
