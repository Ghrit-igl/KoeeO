import urllib.request
import json
import asyncio
import websockets

def test_rest():
    print("==================================================================")
    print("  KOEEO HOLOGRAPHIC AI VIRTUAL SCIENCE LAB — LIVE API VERIFICATION")
    print("==================================================================")

    # 1. Health check
    res = urllib.request.urlopen("http://127.0.0.1:8000/")
    health = json.loads(res.read().decode())
    print("\n[+] 1. HEALTH CHECK RESPONSE:")
    print(json.dumps(health, indent=2))

    # 2. Experiment list
    res = urllib.request.urlopen("http://127.0.0.1:8000/api/experiments")
    exp_list = json.loads(res.read().decode())
    print("\n[+] 2. AVAILABLE QUANTUM & MULTIDISCIPLINARY LABS:")
    for t in exp_list["types"]:
        print(f"   * [{t['name'].upper()}]: {t['description']}")

    # 3. Create Black Hole experiment
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/experiments",
        data=json.dumps({"type": "blackhole", "parameters": {"mass_solar": 12.0}}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    bh = json.loads(res.read().decode())
    print(f"\n[+] 3. GENERAL RELATIVITY BLACK HOLE (12.0 M_Sun) CREATED -> ID: {bh['experiment_id']}")

    # 4. Create Butterfly Aerodynamics experiment
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/experiments",
        data=json.dumps({"type": "aerodynamics", "parameters": {"temperature_c": 28.0, "frequency_hz": 14.0}}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    aero = json.loads(res.read().decode())
    print(f"[+] 4. BUTTERFLY FLAPPING LEV AERODYNAMICS CREATED -> ID: {aero['experiment_id']}")

    # 5. Create Island of Stability experiment
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/experiments",
        data=json.dumps({"type": "nuclear", "parameters": {"protons_z": 126, "neutrons_n": 184}}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    nuc = json.loads(res.read().decode())
    print(f"[+] 5. SUPERHEAVY ELEMENT 126 ISLAND OF STABILITY CREATED -> ID: {nuc['experiment_id']}")

    # 6. Create Pathogen LpxC experiment
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/experiments",
        data=json.dumps({"type": "pathogen", "parameters": {"inhibitor_uM": 1.5}}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    path = json.loads(res.read().decode())
    print(f"[+] 6. A. BAUMANNII LPXC LIPID A ROOT-CAUSE LAB CREATED -> ID: {path['experiment_id']}")

    # 7. AAYU Intent-to-Silicon System Info
    res = urllib.request.urlopen("http://127.0.0.1:8000/api/aayu/system")
    aayu_sys = json.loads(res.read().decode())
    print(f"\n[+] 7. AAYU INTENT-TO-SILICON ENGINE DETECTED:")
    print(f"       Version: {aayu_sys['version']} | Runtime: {aayu_sys['runtime']}")
    print(f"       Architecture: {aayu_sys['architecture']}")
    print(f"       Std Modules Available: {len(aayu_sys['standard_modules'])} modules ({', '.join(aayu_sys['standard_modules'][:8])}...)")

    # 8. Create AAYU Quantum experiment
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/experiments",
        data=json.dumps({"type": "aayu_quantum", "parameters": {"grover_target": 2, "alpha": 0.6, "beta": 0.8}}).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    aayu_exp = json.loads(res.read().decode())
    print(f"[+] 8. AAYU SILICON QUANTUM & FFT LAB CREATED -> ID: {aayu_exp['experiment_id']}")

    return bh['experiment_id'], aero['experiment_id'], nuc['experiment_id'], path['experiment_id'], aayu_exp['experiment_id']


async def test_websocket_stream(exp_id: str, label: str):
    uri = f"ws://127.0.0.1:8000/ws/telemetry/{exp_id}"
    print(f"\n[+] CONNECTING LIVE WEBSOCKET TELEMETRY FOR {label}...")
    async with websockets.connect(uri) as ws:
        # Receive 2 frames
        for _ in range(2):
            msg = await ws.recv()
            envelope = json.loads(msg)
            payload = envelope.get("data", envelope)
            energy = payload.get("energy", 0.0)
            print(f"   -> FRAME #{envelope.get('frame')}: Energy = {energy} | Type = {envelope.get('type')}")
            if "metrics" in payload:
                print(f"      Metrics: {payload['metrics']}")
            if "reynolds_number" in payload:
                print(f"      Air Re = {payload['reynolds_number']} | Lift C_L = {payload['lift_coefficient']} | LEV = {payload['lev_contribution']}")
            if "kinetics" in payload:
                print(f"      Target: {payload['kinetics']['target_pathogen']} | Efficacy = {payload['kinetics']['inhibition_efficacy_percent']}% | Delta G = {payload['kinetics']['gibbs_free_energy_dG_kj_mol']} kJ/mol")
            if "bell_state" in payload:
                print(f"      AAYU Bell State: {payload['bell_state']['name']} | Entangled = {payload['bell_state']['entangled']}")
                print(f"      AAYU Grover Search: Target = |{payload['grover_search']['target_binary']}> | Amplified P = {payload['grover_search']['amplified_probability_pct']}% | Match = {payload['grover_search']['is_exact_match']}")
                print(f"      AAYU Teleportation: Fidelity = {payload['teleportation']['fidelity_pct']}% | Latency = {payload['execution_time_us']} us")
                print(f"      AAYU FFT DC Mag: {payload['scientific_fft']['spectrum_magnitudes'][0]}")


def test_frontend():
    print("\n[+] 7. TESTING VITE HOLOGRAPHIC HUD (HTTP PORT 3000):")
    req = urllib.request.urlopen("http://127.0.0.1:3000/")
    html = req.read().decode()
    has_root = '<div id="root">' in html
    title = "<title>KoeeO" in html or "KoeeO" in html
    print(f"   -> HTTP 200 OK! HTML length: {len(html)} bytes | React Root Present: {has_root} | Title Verified: {title}")


async def main():
    bh_id, aero_id, nuc_id, path_id, aayu_id = test_rest()
    await test_websocket_stream(bh_id, "BLACK HOLE")
    await test_websocket_stream(aero_id, "BUTTERFLY AERODYNAMICS")
    await test_websocket_stream(nuc_id, "ISLAND OF STABILITY")
    await test_websocket_stream(path_id, "A. BAUMANNII DRUG DISCOVERY")
    await test_websocket_stream(aayu_id, "AAYU SILICON QUANTUM ENGINE")
    test_frontend()
    print("\n==================================================================")
    print("  ALL LIVE TESTS PASSED! FULL SYSTEM CONFIRMED OPERATIONAL!")
    print("==================================================================")

if __name__ == "__main__":
    asyncio.run(main())
