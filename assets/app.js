/* Beat Rising Prices cost-of-living planner (Grad-IQ). Figures verified on BLS and EIA (see Sources). */
(function () {
  "use strict";
  var H = window.PH;
  var PRI = [["1", "1 · Housing (rent / mortgage)"], ["2", "2 · Utilities (power, water, heat, phone)"], ["3", "3 · Transport to work / school"], ["4", "4 · Insurance (health, car, renters)"], ["5", "5 · Food & groceries"], ["6", "6 · Minimum debt payments"], ["7", "7 · Can wait / cut / pause"]];
  var CAT = ["Groceries", "Gas", "Bills", "Subscriptions", "Eating out", "Other"];
  function a(u, t) { return '<a href="' + u + '" target="_blank" rel="noopener">' + t + "</a>"; }
  function inc() { return { id: H.uid(), name: "", amount: "", day: "" }; }
  function bill() { return { id: H.uid(), name: "", amount: "", day: "", pri: "7", autopay: false, called: false, notes: "" }; }
  function trip() { return { id: H.uid(), date: H.today(), what: "", miles: "", saved: "" }; }
  function item() { return { id: H.uid(), name: "", qty: "1", name$: "", store$: "", a$: "", b$: "", c$: "" }; }
  function win() { return { id: H.uid(), date: H.today(), what: "", amount: "", cat: "Other" }; }
  function defaults() {
    return { month: "", startBal: "", income: [inc()], bills: [bill()], gas: { price: "", mpg: "", budget: "", weekStart: H.today() }, trips: [], stores: { a: "Store A", b: "Store B", c: "Store C" }, items: [item()], wins: [], goal: "" };
  }
  function demo() {
    return {
      month: "2026-11", startBal: "420",
      income: [{ id: "i1", name: "Paycheck (sample)", amount: "1450", day: "1" }, { id: "i2", name: "Paycheck (sample)", amount: "1450", day: "15" }, { id: "i3", name: "Side gig (sample)", amount: "220", day: "22" }],
      bills: [
        { id: "b1", name: "Rent", amount: "1350", day: "1", pri: "1", autopay: false, called: false, notes: "" },
        { id: "b2", name: "Electric", amount: "118", day: "9", pri: "2", autopay: true, called: false, notes: "" },
        { id: "b3", name: "Phone", amount: "65", day: "12", pri: "2", autopay: true, called: false, notes: "" },
        { id: "b4", name: "Car payment", amount: "289", day: "5", pri: "3", autopay: false, called: true, notes: "Asked about moving due date to the 16th" },
        { id: "b5", name: "Car insurance", amount: "142", day: "20", pri: "4", autopay: true, called: false, notes: "" },
        { id: "b6", name: "Groceries (budget)", amount: "450", day: "1", pri: "5", autopay: false, called: false, notes: "" },
        { id: "b7", name: "Credit card minimum", amount: "60", day: "24", pri: "6", autopay: false, called: false, notes: "" },
        { id: "b8", name: "Streaming x3", amount: "42", day: "18", pri: "7", autopay: true, called: false, notes: "Pause two of these" }
      ],
      gas: { price: "4.33", mpg: "27", budget: "45", weekStart: H.today() },
      trips: [
        { id: "t1", date: H.today(), what: "Groceries + pharmacy + bank in one loop", miles: "14", saved: "9" },
        { id: "t2", date: H.today(), what: "Carpooled to campus", miles: "11", saved: "11" }
      ],
      stores: { a: "Store A", b: "Store B", c: "Store C" },
      items: [
        { id: "g1", name: "Milk, 1 gal", qty: "4", name$: "4.29", store$: "3.49", a$: "3.49", b$: "3.79", c$: "3.29" },
        { id: "g2", name: "Cereal", qty: "2", name$: "5.49", store$: "3.19", a$: "3.19", b$: "2.99", c$: "3.49" },
        { id: "g3", name: "Pasta, 1 lb", qty: "4", name$: "2.29", store$: "1.25", a$: "1.25", b$: "1.39", c$: "1.19" },
        { id: "g4", name: "Coffee", qty: "1", name$: "11.99", store$: "7.99", a$: "7.99", b$: "8.49", c$: "8.99" }
      ],
      wins: [{ id: "w1", date: H.today(), what: "Switched 4 staples to store brand", amount: "18", cat: "Groceries" }, { id: "w2", date: H.today(), what: "Paused 2 streaming services", amount: "28", cat: "Subscriptions" }],
      goal: "150"
    };
  }
  function dim(m) { var p = /^(\d{4})-(\d{2})$/.exec(m || ""); if (!p) return 31; return new Date(+p[1], +p[2], 0).getDate(); }
  function flow(s) {
    var n = dim(s.month), ev = [];
    s.income.forEach(function (x) { if (H.num(x.amount)) ev.push({ day: Math.min(n, Math.max(1, Math.round(H.num(x.day)) || 1)), name: x.name || "Income", amt: H.num(x.amount) }); });
    s.bills.forEach(function (x) { if (H.num(x.amount)) ev.push({ day: Math.min(n, Math.max(1, Math.round(H.num(x.day)) || 1)), name: x.name || "Bill", amt: -H.num(x.amount), auto: x.autopay }); });
    ev.sort(function (a, b) { return a.day - b.day || b.amt - a.amt; });
    var bal = H.num(s.startBal), low = Infinity, lowDay = null;
    ev.forEach(function (e) { bal += e.amt; e.bal = bal; if (bal < low) { low = bal; lowDay = e.day; } });
    return { ev: ev, end: bal, low: low, lowDay: lowDay };
  }
  function gas(s) {
    var price = H.num(s.gas.price), mpg = H.num(s.gas.mpg), budget = H.num(s.gas.budget);
    var gal = price ? budget / price : 0, miles = gal * mpg;
    var used = s.trips.reduce(function (t, x) { return t + H.num(x.miles); }, 0), saved = s.trips.reduce(function (t, x) { return t + H.num(x.saved); }, 0);
    return { gal: gal, miles: miles, used: used, saved: saved, spent: mpg ? used / mpg * price : 0, savedUsd: mpg ? saved / mpg * price : 0 };
  }
  function groc(s) {
    var brand = 0, store = 0, rows = [];
    s.items.forEach(function (it) {
      var q = H.num(it.qty) || 1, nb = H.num(it.name$), sb = H.num(it.store$);
      var opts = [["a", H.num(it.a$)], ["b", H.num(it.b$)], ["c", H.num(it.c$)]].filter(function (o) { return o[1] > 0; }).sort(function (x, y) { return x[1] - y[1]; });
      var bs = nb && sb ? (nb - sb) * q : 0; brand += Math.max(0, bs);
      var ss = opts.length > 1 ? (opts[opts.length - 1][1] - opts[0][1]) * q : 0; store += ss;
      rows.push({ bs: bs, best: opts[0] ? s.stores[opts[0][0]] || opts[0][0] : "", bestP: opts[0] ? opts[0][1] : 0, ss: ss });
    });
    return { brand: brand, store: store, rows: rows };
  }
  var sections = [
    { id: "flow", label: "1 · Cash-flow map", render: function (s) {
      var inc = s.income.map(function (x, i) { var p = "income." + i + "."; return '<div class="cat-row" data-row="income">' + H.input(p + "name", "Income source") + H.input(p + "amount", "Amount", "money") + H.input(p + "day", "Day it arrives", "number", { step: "1" }) + H.del("income", i) + "</div>"; }).join("");
      var bills = s.bills.map(function (x, i) { var p = "bills." + i + "."; return '<div class="cat-row" data-row="bills">' + H.input(p + "name", "Bill") + H.input(p + "amount", "Amount", "money") + H.input(p + "day", "Due day", "number", { step: "1" }) + H.del("bills", i) + "</div>"; }).join("");
      return '<div class="card"><div class="field-row">' + H.input("month", "Month", "month", {}) + H.input("startBal", "Money in account at start of month", "money") + "</div></div>" +
        '<div class="grid two"><div class="card mint"><div class="card-head"><h2>Money in</h2>' + H.add("income", "Add income") + '</div><div class="rows">' + inc + '</div></div><div class="card blush"><div class="card-head"><h2>Bills out</h2>' + H.add("bills", "Add bill") + '</div><div class="rows">' + bills + "</div></div></div>" +
        '<div class="card"><h2>This month, day by day</h2><div class="stat-grid" style="margin-bottom:1rem"><div class="stat mint"><div class="label">Money in</div><div class="value">' + H.out("fin") + '</div></div><div class="stat blush"><div class="label">Bills out</div><div class="value">' + H.out("fout") + '</div></div><div class="stat">' + '<div class="label">End of month</div><div class="value">' + H.out("fend") + '</div></div><div class="stat lav"><div class="label">Lowest point</div><div class="value">' + H.out("flow") + "</div></div></div>" + H.out("fwarn") + H.out("ftl") + "</div>";
    } },
    { id: "triage", label: "2 · Bill triage", render: function (s) {
      var rows = s.bills.map(function (b, i) { return { b: b, i: i }; }).sort(function (x, y) { return (+x.b.pri || 7) - (+y.b.pri || 7) || H.num(x.b.day) - H.num(y.b.day); }).map(function (o) {
        var p = "bills." + o.i + ".";
        return '<div class="row-card" data-row="bills"><div class="card-head"><strong>' + H.esc(o.b.name || "Bill") + " · " + H.money(o.b.amount, true) + (o.b.day ? " · due " + H.esc(o.b.day) : "") + "</strong>" + H.out("tr-" + o.i) + "</div>" +
          '<div class="field-row">' + H.input(p + "pri", "Priority", "select", { options: PRI }) + H.input(p + "autopay", "On autopay", "check") + H.input(p + "called", "I called before missing a payment", "check") + "</div>" + H.input(p + "notes", "Call notes (date, who, what they offered)", "text") + "</div>";
      }).join("");
      return '<div class="card blush"><p class="eyebrow">If money is short this month</p><h2>Cover these first</h2><p>Pay in this order: <strong>housing, utilities, transport to work, insurance, food</strong>. Then minimum debt payments. Pause or cut the rest.</p><div class="notice warn big"><p>📞 <strong>Call the creditor <em>before</em> you miss a payment.</strong> Ask about a new due date, a payment plan, or hardship options, and write down what they say. Many lenders and utilities have options, but you usually have to ask.</p></div><p class="source">More help: ' + a("https://www.consumerfinance.gov/consumer-tools/debt-collection/", "CFPB — Debt collection") + "</p></div>" +
        '<div class="card"><h2>My bills by priority</h2>' + H.out("tsum") + '<div class="rows">' + (rows || '<p class="empty">Add bills in the cash-flow map.</p>') + "</div></div>";
    } },
    { id: "gas", label: "3 · Gas", render: function (s) {
      var trips = s.trips.map(function (t, i) { var p = "trips." + i + "."; return '<div class="row-card" data-row="trips"><div class="field-row">' + H.input(p + "date", "Date", "date") + H.input(p + "what", "Trip / errands combined") + H.input(p + "miles", "Miles driven", "number") + H.input(p + "saved", "Miles saved by combining", "number") + "</div><div>" + H.del("trips", i) + "</div></div>"; }).join("");
      return '<div class="card sky"><h2>Weekly gas budget</h2><div class="field-row">' + H.input("gas.price", "My local price / gallon", "money", { hint: "(check your pump)" }) + H.input("gas.mpg", "My car's MPG", "number") + H.input("gas.budget", "Weekly gas budget", "money") + H.input("gas.weekStart", "Week starting", "date") + "</div>" +
        '<div class="stat-grid"><div class="stat"><div class="label">Gallons / week</div><div class="value">' + H.out("ggal") + '</div></div><div class="stat"><div class="label">Miles it covers</div><div class="value">' + H.out("gmi") + '</div></div><div class="stat lav"><div class="label">Miles logged</div><div class="value">' + H.out("gused") + '</div></div><div class="stat mint"><div class="label">Saved by combining</div><div class="value">' + H.out("gsaved") + "</div></div></div>" + '<div style="margin-top:.8rem">' + H.out("gbar") + "</div></div>" +
        '<div class="card"><div class="card-head"><h2>Trip-combining log</h2>' + H.add("trips", "Log a trip") + '</div><p class="small muted">Group errands into one loop, carpool, or skip a trip and log the miles you saved.</p><div class="rows">' + (trips || '<p class="empty">No trips logged yet.</p>') + "</div></div>";
    } },
    { id: "grocery", label: "4 · Groceries", render: function (s) {
      var items = s.items.map(function (it, i) { var p = "items." + i + "."; return '<div class="row-card" data-row="items"><div class="card-head"><strong>' + H.esc(it.name || "Item") + "</strong>" + H.out("gi-" + i) + H.del("items", i) + "</div>" +
        '<div class="field-row">' + H.input(p + "name", "Item") + H.input(p + "qty", "How many / month", "number") + H.input(p + "name$", "Name-brand price", "money") + H.input(p + "store$", "Store-brand price", "money") + "</div>" +
        '<div class="field-row">' + H.input(p + "a$", H.esc(s.stores.a || "Store A") + " price", "money") + H.input(p + "b$", H.esc(s.stores.b || "Store B") + " price", "money") + H.input(p + "c$", H.esc(s.stores.c || "Store C") + " price", "money") + "</div></div>"; }).join("");
      return '<div class="card"><h2>My stores</h2><div class="field-row">' + H.input("stores.a", "Store 1", "text", {}) + H.input("stores.b", "Store 2") + H.input("stores.c", "Store 3") + '</div><p class="small muted">Rename the stores, then switch tabs to update the price labels.</p></div>' +
        '<div class="card mint"><div class="stat-grid"><div class="stat"><div class="label">Store brand saves / mo</div><div class="value">' + H.out("gbrand") + '</div></div><div class="stat"><div class="label">Cheapest-store saves / mo</div><div class="value">' + H.out("gstore") + "</div></div></div></div>" +
        '<div class="card"><div class="card-head"><h2>Price tracker</h2>' + H.add("items", "Add item") + '</div><div class="rows">' + items + "</div></div>";
    } },
    { id: "wins", label: "5 · Savings wins", render: function (s) {
      var w = s.wins.map(function (x, i) { var p = "wins." + i + "."; return '<div class="cat-row" data-row="wins" style="grid-template-columns:1fr 1fr 44px">' + H.input(p + "what", "What I did") + H.input(p + "amount", "Saved", "money") + H.input(p + "cat", "Type", "select", { options: CAT }) + "" + H.del("wins", i) + "</div>"; }).join("");
      return '<div class="card lav"><h2>Savings wins</h2><p>Every small win counts. Log it here and watch it add up.</p><div class="field-row">' + H.input("goal", "Monthly savings goal", "money") + '</div><div class="stat-grid"><div class="stat big mint"><div class="label">Saved so far</div><div class="value">' + H.out("wtot") + '</div></div><div class="stat"><div class="label">Wins logged</div><div class="value">' + H.out("wn") + "</div></div></div>" + '<div style="margin-top:.8rem">' + H.out("wbar") + '</div><div class="btn-row no-print" style="margin-top:.8rem"><button type="button" class="btn sm secondary" data-action="addGas">+ Add this week\'s gas savings</button><button type="button" class="btn sm secondary" data-action="addGroc">+ Add this month\'s grocery savings</button></div></div>' +
        '<div class="card"><div class="card-head"><h2>My wins</h2>' + H.add("wins", "Add a win") + '</div><div class="rows">' + (w || '<p class="empty">No wins yet. Your first one is coming.</p>') + "</div></div>";
    } },
    { id: "sources", label: "Sources", render: function () {
      return '<div class="card soft" id="sources"><h2>Why prices feel higher right now</h2><ul class="small">' +
        "<li>Consumer prices rose <strong>3.7%</strong> over the 12 months ending September 2026, and the gasoline index rose <strong>9.1%</strong> in September (seasonally adjusted). " + a("https://www.bls.gov/news.release/cpi.nr0.htm", "BLS, CPI news release, Oct 14, 2026") + "</li>" +
        "<li>U.S. regular gasoline averaged <strong>$4.33/gal</strong> the week of Oct 12, 2026, <strong>$1.27/gal</strong> more than a year earlier. " + a("https://www.eia.gov/petroleum/gasdiesel/", "EIA, Gasoline and Diesel Fuel Update") + "</li>" +
        "<li>" + a("https://www.consumerfinance.gov/consumer-tools/debt-collection/", "CFPB — Debt collection") + " · " + a("https://www.fueleconomy.gov/feg/driveHabits.jsp", "FuelEconomy.gov — Driving more efficiently") + "</li></ul><p class='small muted'>Checked Oct 14, 2026. Prices change weekly; enter your own local prices in the planner.</p></div>";
    } }
  ];
  function compute(s) {
    var o = {}, f = flow(s), tin = 0, tout = 0;
    f.ev.forEach(function (e) { if (e.amt > 0) tin += e.amt; else tout -= e.amt; });
    o.fin = H.money(tin); o.fout = H.money(tout); o.fend = H.money(f.end); o.flow = f.ev.length ? H.money(f.low) : "—";
    o.fwarn = { html: f.ev.length && f.low < 0 ? '<div class="notice warn"><p>Your balance dips below zero around <strong>day ' + f.lowDay + "</strong>. Try moving a due date (call first), shifting a payment to after payday, or trimming a priority-7 bill.</p></div>" : "" };
    o.ftl = { html: f.ev.map(function (e) { return '<div class="tl-row' + (e.amt > 0 ? " in" : "") + (e.bal < 0 ? " low" : "") + '"><span class="tl-day">' + e.day + "</span><span>" + H.esc(e.name) + (e.auto ? ' <span class="pill">autopay</span>' : "") + "</span><span>" + (e.amt > 0 ? "+" : "−") + H.money(Math.abs(e.amt), true) + '</span><span class="small muted">' + H.money(e.bal, true) + "</span></div>"; }).join("") || '<p class="empty">Add income and bills to see your month.</p>' };
    var ti = 0, ess = 0; s.income.forEach(function (x) { ti += H.num(x.amount); });
    s.bills.forEach(function (b, i) { if ((+b.pri || 7) <= 5) ess += H.num(b.amount); o["tr-" + i] = { html: '<span class="pill ' + ((+b.pri || 7) <= 5 ? "ok" : (+b.pri === 6 ? "lav" : "warn")) + '">' + ((+b.pri || 7) <= 5 ? "essential" : +b.pri === 6 ? "minimum" : "can wait") + "</span>" }; });
    o.tsum = { html: '<p>Essentials (priorities 1–5): <strong>' + H.money(ess) + "</strong> of " + H.money(ti) + " income. " + (ti && ess > ti ? '<span class="pill bad">short ' + H.money(ess - ti) + "</span> Call creditors now." : ti ? '<span class="pill ok">' + H.money(ti - ess) + " left after essentials</span>" : "") + "</p>" };
    var g = gas(s);
    o.ggal = g.gal ? g.gal.toFixed(1) : "—"; o.gmi = g.miles ? Math.round(g.miles) : "—"; o.gused = Math.round(g.used); o.gsaved = H.money(g.savedUsd, true);
    var pct = g.miles ? Math.min(100, g.used / g.miles * 100) : 0;
    o.gbar = { html: g.miles ? '<div class="bar' + (pct >= 100 ? " want" : "") + '"><span style="width:' + pct + '%"></span></div><p class="small" style="margin-top:.3rem">' + Math.round(g.used) + " of " + Math.round(g.miles) + " miles used this week (about " + H.money(g.spent, true) + ")</p>" : '<p class="small muted">Enter price, MPG and budget.</p>' };
    var gr = groc(s);
    gr.rows.forEach(function (r, i) { o["gi-" + i] = { html: (r.bs > 0 ? '<span class="pill ok">store brand saves ' + H.money(r.bs, true) + "/mo</span> " : "") + (r.best ? '<span class="pill lav">cheapest: ' + H.esc(r.best) + "</span>" : "") }; });
    o.gbrand = H.money(gr.brand, true); o.gstore = H.money(gr.store, true);
    var wt = s.wins.reduce(function (t, x) { return t + H.num(x.amount); }, 0), goal = H.num(s.goal);
    o.wtot = H.money(wt, true); o.wn = s.wins.length;
    o.wbar = { html: goal ? '<div class="bar save"><span style="width:' + Math.min(100, wt / goal * 100) + '%"></span></div><p class="small" style="margin-top:.3rem">' + Math.round(wt / goal * 100) + "% of your " + H.money(goal) + " goal</p>" : "" };
    return o;
  }
  var actions = {
    addGas: function (s) { var g = gas(s); if (g.savedUsd > 0) s.wins.push({ id: H.uid(), date: H.today(), what: "Combined trips (" + Math.round(g.saved) + " miles saved)", amount: g.savedUsd.toFixed(2), cat: "Gas" }); },
    addGroc: function (s) { var g = groc(s), v = g.brand; if (v > 0) s.wins.push({ id: H.uid(), date: H.today(), what: "Store-brand swaps this month", amount: v.toFixed(2), cat: "Groceries" }); }
  };
  var tables = {
    cashflow: { label: "Cash flow", rows: function (s) { var r = [["Day", "Item", "Amount", "Running balance"]]; flow(s).ev.forEach(function (e) { r.push([e.day, e.name, e.amt.toFixed(2), e.bal.toFixed(2)]); }); return r; } },
    bills: { label: "Bills", rows: function (s) { var r = [["Bill", "Amount", "Due day", "Priority", "Autopay", "Called creditor", "Notes"]]; s.bills.forEach(function (b) { r.push([b.name, b.amount, b.day, b.pri, b.autopay ? "yes" : "no", b.called ? "yes" : "no", b.notes]); }); return r; } },
    trips: { label: "Trips", rows: function (s) { var r = [["Date", "Trip", "Miles", "Miles saved"]]; s.trips.forEach(function (t) { r.push([t.date, t.what, t.miles, t.saved]); }); return r; } },
    groceries: { label: "Groceries", rows: function (s) { var r = [["Item", "Qty/month", "Name brand", "Store brand", s.stores.a, s.stores.b, s.stores.c]]; s.items.forEach(function (i) { r.push([i.name, i.qty, i.name$, i.store$, i.a$, i.b$, i.c$]); }); return r; } },
    wins: { label: "Wins", rows: function (s) { var r = [["Date", "Win", "Amount", "Type"]]; s.wins.forEach(function (w) { r.push([w.date, w.what, w.amount, w.cat]); }); return r; } }
  };
  window.PLANNER = { key: "gradiq-beat-rising-prices-v1", slug: "beat-rising-prices-planner", title: "Beat Rising Prices Budget Planner", defaults: defaults, demo: demo, sections: sections, compute: compute, tables: tables, actions: actions, templates: { income: inc, bills: bill, trips: trip, items: item, wins: win } };
})();
