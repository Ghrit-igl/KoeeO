"""
KoeeO Backend — FastAPI Application.

Tony Stark-inspired Holographic AI Virtual Science Lab.
Provides REST API for experiment management and WebSocket
telemetry streaming at 30Hz for real-time 3D visualization.
"""

import asyncio
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.engine.simulation import SimulationManager
from app.ws.telemetry import ConnectionManager


# ─── Global state ──────────────────────────────────────────────────────
simulation_manager = SimulationManager()
ws_manager = ConnectionManager()

# Target telemetry rate: 30 Hz → ~33ms per frame
TELEMETRY_INTERVAL = 1.0 / 30.0


# ─── Lifespan ──────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle."""
    yield


# ─── FastAPI App ───────────────────────────────────────────────────────
app = FastAPI(
    title="KoeeO — Holographic AI Virtual Science Lab",
    description=(
        "Backend engine for real-time Möbius strip topological analysis, "
        "molecular orbital visualization, and N-body particle dynamics. "
        "Powered by AAYU silicon-speed computation and RETER AST security."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Pydantic Models ──────────────────────────────────────────────────
class CreateExperimentRequest(BaseModel):
    """Request body for creating a new experiment."""
    type: str = Field(..., description="Experiment type: mobius, molecular, or particles")
    parameters: dict = Field(default_factory=dict, description="Engine-specific parameters")


class CreateExperimentResponse(BaseModel):
    """Response for experiment creation."""
    experiment_id: str
    type: str
    message: str


# ─── REST Endpoints ───────────────────────────────────────────────────

@app.get("/")
async def health_check():
    """Health check with server info."""
    return {
        "status": "online",
        "service": "KoeeO Holographic AI Virtual Science Lab",
        "version": "0.1.0",
        "engines": [
            "mobius",
            "molecular",
            "particles",
            "blackhole",
            "aerodynamics",
            "nuclear",
            "pathogen",
            "aayu_quantum",
            "dynamic_cad",
        ],
        "timestamp": time.time(),
    }


@app.get("/api/experiments")
async def list_experiments():
    """List all active experiments and available experiment types."""
    return {
        "types": [
            {
                "name": "mobius",
                "description": "Möbius strip topological manifold with eigenvalue spectral analysis",
            },
            {
                "name": "molecular",
                "description": "Molecular orbital energy, electron density, and bond graph visualization",
            },
            {
                "name": "particles",
                "description": "N-body particle dynamics with gravitational/electromagnetic forces",
            },
            {
                "name": "blackhole",
                "description": "General Relativity null geodesics, photon sphere (r_ph = 3M), and Hawking temperature",
            },
            {
                "name": "aerodynamics",
                "description": "Butterfly flapping Navier-Stokes Leading-Edge Vortex (LEV) and unsteady lift augmentation",
            },
            {
                "name": "nuclear",
                "description": "Bethe-Weizsäcker SEMF nuclear binding & superheavy Island of Stability (Z=120, 126, N=184)",
            },
            {
                "name": "pathogen",
                "description": "Acinetobacter baumannii Lipid A biosynthesis LpxC active site & antibiotic re-sensitization",
            },
            {
                "name": "aayu_quantum",
                "description": "AAYU Intent-to-Silicon Quantum Engine: Bell state entanglement, Grover search, and Cooley-Tukey FFT",
            },
            {
                "name": "dynamic_cad",
                "description": "AAYU Dynamic CAD & Engineering Engine: User prompts, exploded 3D assembly, and component stress upgrades",
            },
        ],
        "active": simulation_manager.list_experiments(),
    }


@app.post("/api/experiments", response_model=CreateExperimentResponse)
async def create_experiment(request: CreateExperimentRequest):
    """Create a new experiment."""
    try:
        exp_id = simulation_manager.create(request.type, request.parameters)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return CreateExperimentResponse(
        experiment_id=exp_id,
        type=request.type,
        message=f"Experiment '{request.type}' created successfully",
    )


@app.delete("/api/experiments/{experiment_id}")
async def destroy_experiment(experiment_id: str):
    """Destroy an experiment and free its resources."""
    try:
        simulation_manager.destroy(experiment_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Experiment not found: {experiment_id}")

    return {"message": f"Experiment {experiment_id} destroyed", "experiment_id": experiment_id}


# ─── AAYU Intent-to-Silicon Endpoints ─────────────────────────────────

@app.get("/api/aayu/system")
async def get_aayu_system_info():
    """Get AAYU engine runtime info and available standard libraries."""
    from app.engine.aayu_bridge import AAYUBridge, AAYU_EXE
    bridge = AAYUBridge()
    try:
        version = bridge.get_version()
    except Exception as e:
        version = f"AAYU v1.5.0 ({e})"

    std_dir = r"D:\INTENT-TO-SILICON\std"
    import os
    modules = []
    if os.path.exists(std_dir):
        modules = [f for f in os.listdir(std_dir) if f.endswith(".aayu")]

    return {
        "engine": "AAYU Intent-to-Silicon",
        "version": version,
        "executable": AAYU_EXE,
        "runtime": "Native Rust Bytecode VM | Embedded Compiler & JIT",
        "architecture": "x86_64-pc-windows-msvc",
        "features": [
            "128-bit NaN-Boxed Hybrid Scalar Engine",
            "Zero Hallucination Scoping via Explicit 'end' blocks",
            "Pure Rust Silicon Virtual Machine",
            "Native Quantum Teleportation & Grover Search",
            "Cooley-Tukey Radix-2 FFT Spectrum Analyzer",
        ],
        "standard_modules": sorted(modules),
    }


# ─── Dynamic Engineering & CAD Endpoints ──────────────────────────────

class CadAnalyzeRequest(BaseModel):
    prompt: str = Field(..., description="User engineering or science prompt/model name")
    rpm: float = Field(14000.0, description="Operating RPM")
    boost_bar: float = Field(2.4, description="Forced induction boost pressure")
    piston_material: str = Field("titanium_ti6al4v", description="Piston material")
    supercharger_material: str = Field("forged_carbon", description="Supercharger material")
    exploded_factor: float = Field(0.0, description="Exploded view distance 0.0 to 1.0")


@app.post("/api/cad/analyze")
async def analyze_cad_model(request: CadAnalyzeRequest):
    """
    Dynamically analyze a user-requested machine, vehicle, or engine model
    using the AAYU Intent-to-Silicon Physics VM.
    """
    from app.engine.aayu_cad_driver import run_aayu_cad_simulation
    res = run_aayu_cad_simulation(
        prompt=request.prompt,
        rpm=request.rpm,
        boost_bar=request.boost_bar,
        piston_material=request.piston_material,
        supercharger_material=request.supercharger_material,
        exploded_factor=request.exploded_factor,
        frame=0,
    )
    return res


# ─── WebSocket Telemetry ──────────────────────────────────────────────

@app.websocket("/ws/telemetry/{experiment_id}")
async def telemetry_websocket(websocket: WebSocket, experiment_id: str):
    """
    Stream simulation telemetry frames at 30Hz over WebSocket.

    Each frame is a JSON object with experiment data, frame counter,
    and timestamp. Connection closes when the experiment is destroyed
    or the client disconnects.
    """
    # Verify the experiment exists before accepting
    try:
        simulation_manager.get_experiment(experiment_id)
    except KeyError:
        await websocket.close(code=4004, reason="Experiment not found")
        return

    await ws_manager.connect(experiment_id, websocket)

    try:
        # Send initial telemetry frame immediately
        telemetry = simulation_manager.step(experiment_id)
        await websocket.send_json(telemetry)

        # Stream frames at ~30Hz
        while True:
            try:
                # Check for incoming messages (non-blocking with short timeout)
                # This allows the client to send control messages
                try:
                    msg = await asyncio.wait_for(
                        websocket.receive_text(), timeout=TELEMETRY_INTERVAL
                    )
                    # Handle control messages
                    if msg == "pause":
                        continue
                    elif msg == "stop":
                        break
                except asyncio.TimeoutError:
                    pass

                # Step the simulation and send telemetry
                try:
                    telemetry = simulation_manager.step(experiment_id)
                    await websocket.send_json(telemetry)
                except KeyError:
                    # Experiment was destroyed
                    await websocket.close(code=4004, reason="Experiment destroyed")
                    break

            except WebSocketDisconnect:
                break

    except Exception:
        pass
    finally:
        await ws_manager.disconnect(experiment_id, websocket)
