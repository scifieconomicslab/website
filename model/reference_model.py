"""
Reference model for the Sci-Fi Economics Lab landing page ("Linden Cove" town).
One tick = one month. Pure Python, no dependencies. Port line for line to JavaScript.
Run `python3 reference_model.py` to print the calibration and the acceptance tests.
All money is in "coins". All numbers are invented and tuned for legibility, not calibrated to a real town.
"""
import math

def clamp(x, a, b): return max(a, min(b, x))

# ---------- constants (every one of these appears in PLAN.md section 6) ----------
KEYS   = ['infra', 'edu', 'just', 'transit', 'health']
SHARE0 = dict(infra=0.25, edu=0.25, just=0.15, transit=0.15, health=0.20)   # default spending split
DELTA  = dict(infra=0.02, edu=0.01, just=0.05, transit=0.06, health=0.04)   # stock adjustment speed per month
EPS    = dict(infra=0.24, edu=0.40, health=0.16)                            # productivity elasticities

N0, OWN, E0, W0, LS = 1000, 0.25, 700.0, 100.0, 0.90
Y0   = W0 / LS            # 111.111 output per worker per month
MPCW, MPCO, GLOC, DIVSH = 0.90, 0.50, 0.80, 0.5
OVH, F0 = 500.0, 8
T0, R0, HS0 = 0.20, 30.0, 1050.0
MIG, AQ, AS, AC, AU = 0.004, 0.35, 0.50, 1.0, 0.4
XP = 1.0   # export demand elasticity to service-driven productivity
FIRE = 0.06   # speed of shedding workers when demand falls (hiring speed is 0.25)
WFLOOR = 0.0  # wage floor as a share of the starting wage
STAB = 1.0    # unemployment support: extra local spending per unit of unemployment above STABU
STABU = 0.10
TDRAG = 1.0   # output lost per unit of tax rate above 25 percent (avoidance, flight)
CROWDW = 60.0  # mood penalty per unit of crowding (share of households without a dwelling)

# ---------- steady-state calibration (derived, not chosen) ----------
NW0    = N0 * (1 - OWN)                       # 750 working renter households
CAP0   = E0 * Y0                              # 77,777.8 coins of monthly output at full employment of 700
WB0    = E0 * W0                              # 70,000 wage bill
RENT0  = R0 * NW0                             # 22,500 rent paid
PROFIT0= CAP0 - WB0 - F0 * OVH                # 3,777.8
DIV0   = DIVSH * PROFIT0                      # 1,888.9
INCO0  = RENT0 + DIV0                         # 24,388.9 owner income
B0     = T0 * (WB0 + INCO0)                   # 18,877.8 monthly tax take = the Budget pool
CW0    = MPCW * (WB0 * (1 - T0) - RENT0)      # 30,150 worker consumption
CO0    = MPCO * INCO0 * (1 - T0)              # 9,755.6 owner consumption
X0     = CAP0 - CW0 - CO0 - GLOC * B0         # 22,770 export demand that closes the circular flow
INC_PC0= (WB0 * (1 - T0) - RENT0) / NW0       # 44.667 post-tax post-rent income per working renter
BPC0   = B0 / N0                              # 18.878 budget per household
USTAR  = 1 - E0 / NW0                         # 0.0667 natural unemployment

class Town:
    def __init__(s):
        s.N = float(N0); s.E = E0; s.w = W0; s.Hs = HS0
        s.W = 1.0; s.xs = 1.0                 # weather index, export-demand shock
        s.G = {k: 1.0 for k in KEYS}          # public service stocks
        s.div = DIV0; s.D = CAP0; s.t = 0; s.Asm = 0.0
        s.nfirms = F0

    def step(s, rent, tax, share):
        N, G = s.N, s.G
        nown = OWN * N; nw = N - nown
        # 1 productivity (weather enters at power 0.4, services at their elasticities)
        svc_prod = (G['infra']**EPS['infra']) * (G['edu']**EPS['edu']) * (G['health']**EPS['health'])
        prod = Y0 * (s.W**0.4) * svc_prod * (1 - TDRAG * max(0.0, tax - 0.25))
        ovh  = OVH / (G['just']**0.15)
        # 2 firms hire toward expected demand; transit sets how fast the unemployed can be matched
        E = s.E
        Etarget = s.D / (Y0 * svc_prod)       # workers needed at normal weather
        U  = max(0.0, nw - E)
        mu = 0.5 * G['transit']**0.3
        dE = (0.25 if Etarget > E else FIRE) * (Etarget - E)
        if dE > 0: dE = min(dE, mu * U)
        E = max(0.0, E + dE)
        cap = E * prod
        u = clamp((nw - E) / nw, 0, 1)
        # 3 wage: partial adjustment to labour share of productivity, with a Phillips term
        s.w += 0.10 * (max(WFLOOR * W0 * G['edu']**0.5, LS * prod * (1 + 1.0 * (USTAR - u))) - s.w)
        wb = E * s.w
        # 4 housing and rent
        renters = max(0.0, min(nw, s.Hs - nown))
        rent_total = rent * renters
        inc_o = rent_total + s.div
        tax_total = tax * (wb + inc_o)
        # 5 demand
        cw = max(0.0, MPCW * (wb * (1 - tax) - rent_total))
        co = MPCO * inc_o * (1 - tax)
        X  = X0 * s.xs * (s.W**0.5) * (G['transit']**0.1) * svc_prod**XP
        stab = STAB * max(0.0, u - STABU) * tax_total
        D  = cw + co + GLOC * tax_total + stab + X
        s.D += 0.5 * (D - s.D)
        sales  = min(D, cap)
        profit = sales - wb - s.nfirms * ovh
        s.div  = DIVSH * max(0.0, profit)
        # 6 budget pool and public stocks (exponential smoothing toward the per-household spending index)
        B = tax_total
        for k in KEYS:
            x = (B / N * share[k]) / (BPC0 * SHARE0[k])
            G[k] += DELTA[k] * (x - G[k])
        # 7 housing supply (builders respond to rent against a build cost of 30)
        if rent > R0: s.Hs *= 1 + 0.003 * min(2.0, (rent - R0) / R0 * 3)
        else:         s.Hs *= 1 - 0.001 * min(2.0, (R0 - rent) / R0 * 3)
        s.Hs = max(s.Hs, 0.7 * N)
        # 8 migration: smoothed attractiveness
        inc_pc = (wb * (1 - tax) - rent_total) / max(1.0, nw)
        Q = inc_pc / INC_PC0
        svc = sum(G[k] * SHARE0[k] for k in KEYS)
        crowd = max(0.0, (N - s.Hs) / N)
        A = AQ * (Q - 1) + AS * (svc - 1) - AC * crowd - AU * (u - USTAR)
        s.Asm += 0.15 * (A - s.Asm)
        s.N = max(200.0, N * (1 + MIG * math.tanh(3 * s.Asm)))
        # 9 exogenous decay: weather half-life 8.3 months, export shock 13.5 months
        s.W = 1 + 0.92 * (s.W - 1); s.xs = 1 + 0.95 * (s.xs - 1)
        s.E = E; s.t += 1
        mood = 50 * (0.4 * clamp(Q, 0, 2) + 0.3 * clamp(1 - (u - USTAR) * 4, 0, 1.3) + 0.3 * clamp(svc, 0, 2)) - CROWDW * crowd
        return dict(t=s.t, N=N, E=E, u=u, w=s.w, B=B, Q=Q, svc=svc, Hs=s.Hs, sales=sales, cap=cap, profit=profit,
                    mood=mood, G=dict(G), own_over_work=(inc_o / max(1, nown)) / (wb / max(1, nw)))

def run(rent=R0, tax=T0, share=None, months=120, events=None):
    share = share or SHARE0
    s = Town(); hist = []
    for t in range(months):
        ev = (events or {}).get(t)
        if ev == 'drought': s.W = 0.7
        if ev == 'bumper':  s.W = 1.15
        if ev == 'storm':   s.G['infra'] *= 0.85
        if ev == 'cargo':   s.xs = 0.8
        hist.append(s.step(rent, tax, share))
    return hist

def reshare(**kw):
    d = dict(SHARE0); d.update(kw); tot = sum(d.values()); return {k: v / tot for k, v in d.items()}

GOLDEN_RUNS = {
    'default': dict(),
    'hard_decade': dict(events={14: 'drought', 31: 'storm', 52: 'cargo', 80: 'bumper'}),
    'tax25': dict(tax=0.25),
    'rent20': dict(rent=20),
    'transit_heavy': dict(share=reshare(transit=0.40)),
}

def selftest():
    h = run(); r = h[-1]
    assert abs(r['N'] - 1000) < 1e-9 and abs(r['E'] - 700) < 1e-9 and abs(r['w'] - 100) < 1e-9 and abs(r['B'] - B0) < 1e-9, 'T1 default must be stationary'
    print('T1 default is stationary: ok')
    lo = run(tax=0.10)[-1]; hi = run(tax=0.35)[-1]
    assert lo['svc'] < 0.7 and hi['svc'] > 1.2; print('T2 tax moves service level both ways: ok', round(lo['svc'], 2), round(hi['svc'], 2))
    d = run()[-1]['mood']
    assert run(tax=0.35)[-1]['mood'] < d and run(tax=0.05)[-1]['mood'] < d; print('T3 extreme taxes lower the mood index: ok')
    r20 = run(rent=20); assert r20[59]['N'] > 1050; print('T4 rent 20 pulls people in, month 60 N =', round(r20[59]['N']))
    r45 = run(rent=45); assert r45[59]['N'] < 950 and r45[119]['N'] < 850; print('T5 rent 45 pushes people out, N =', round(r45[59]['N']), round(r45[119]['N']))
    t0 = run(share=reshare(transit=0.0))[-1]; assert t0['u'] > 0.3; print('T6 transit at zero wrecks matching: u =', round(t0['u'], 3))
    dr = run(events={12: 'drought'})[12:36]; assert max(x['u'] for x in dr) > 0.10; print('T7 drought lifts unemployment above 10%: max u =', round(max(x['u'] for x in dr), 3))
    st = run(events={12: 'storm'}); assert st[12]['G']['infra'] < 0.9; print('T8 storm cuts the infrastructure stock: ok')

def sweep():
    print('\nSweep (mood is 0-100, default 50):')
    for lab, kw in [('default', {}), ('tax 5', dict(tax=.05)), ('tax 10', dict(tax=.10)), ('tax 15', dict(tax=.15)), ('tax 25', dict(tax=.25)), ('tax 30', dict(tax=.30)), ('tax 40', dict(tax=.40)), ('tax 50', dict(tax=.50)),
                    ('rent 20', dict(rent=20)), ('rent 25', dict(rent=25)), ('rent 35', dict(rent=35)), ('rent 40', dict(rent=40)), ('rent 50', dict(rent=50)),
                    ('edu 45%', dict(share=reshare(edu=.45))), ('infra 45%', dict(share=reshare(infra=.45))), ('justice 40%', dict(share=reshare(just=.40))),
                    ('transit 40%', dict(share=reshare(transit=.40))), ('health 40%', dict(share=reshare(health=.40)))]:
        h = run(**kw); x = h[-1]; y5 = h[59]
        print(f"{lab:12s} mood y5={y5['mood']:5.1f} y10={x['mood']:5.1f} N={x['N']:5.0f} E={x['E']:4.0f} u={x['u']*100:4.1f}% w={x['w']:6.1f} B={x['B']:6.0f} svc={x['svc']:.2f} Hs={x['Hs']:5.0f}")

if __name__ == '__main__':
    import sys, json
    if '--golden' in sys.argv:
        out = {k: [{kk: vv for kk, vv in rec.items() if kk != 'G'} | {'G': rec['G']} for rec in run(**kw)] for k, kw in GOLDEN_RUNS.items()}
        json.dump(out, open('golden.json', 'w'))
        sys.exit(0)
    print(dict(CAP0=CAP0, WB0=WB0, RENT0=RENT0, PROFIT0=PROFIT0, DIV0=DIV0, INCO0=INCO0, B0=B0, CW0=CW0, CO0=CO0, X0=X0, INC_PC0=INC_PC0, BPC0=BPC0, USTAR=USTAR))
    selftest(); sweep()
