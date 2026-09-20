"""
E.M.E.R.G.E+ Framework - Interactive Dashboard
A Theoretical Model for Meaning Emergence Through Dual Entropy Dynamics
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.express as px

# Page configuration
st.set_page_config(
    page_title="E.M.E.R.G.E+ Dashboard",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1E3A8A;
        text-align: center;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #6B7280;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        text-align: center;
    }
    .info-box {
        background-color: #F3F4F6;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #3B82F6;
    }
    .process-card {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        margin: 0.5rem 0;
    }
    .process-card-transform {
        background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        margin: 0.5rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Load data
@st.cache_data
def load_data():
    routine_full = pd.read_csv('routine_timeseries_full.csv')
    transformative_full = pd.read_csv('transformative_timeseries_full.csv')
    table_demo1 = pd.read_csv('table_demo1_routine_timepoints.csv')
    table_demo2 = pd.read_csv('table_demo2_transformative_timepoints.csv')
    table_demo3 = pd.read_csv('table_demo3_culture.csv')
    table_demo4 = pd.read_csv('table_demo4_parameter_sensitivity.csv')
    transformative_meta = pd.read_csv('transformative_metadata.csv')
    return routine_full, transformative_full, table_demo1, table_demo2, table_demo3, table_demo4, transformative_meta

routine_full, transformative_full, table_demo1, table_demo2, table_demo3, table_demo4, transformative_meta = load_data()

# Sidebar navigation
st.sidebar.title("🧭 Navigation")
page = st.sidebar.radio(
    "Select Page:",
    ["🏠 Overview", "📊 Routine Process", "🔥 Transformative Process", "🌍 Cultural Modulation", "⚙️ Parameter Sensitivity", "🔮 Predictions & Validation", "📚 About"]
)

# ============================================
# OVERVIEW PAGE
# ============================================
if page == "🏠 Overview":
    st.markdown('<div class="main-header">E.M.E.R.G.E+ Framework</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">A Theoretical Model for Meaning Emergence Through Dual Entropy Dynamics</div>', unsafe_allow_html=True)

    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("📄 Pages", "~500", help="Total manuscript length")
    with col2:
        st.metric("🧮 Equations", "12+", help="Mathematical formulations")
    with col3:
        st.metric("📈 Simulations", "4", help="Computational demonstrations")
    with col4:
        st.metric("🔮 Predictions", "3", help="Falsifiable predictions")

    st.markdown("---")

    # The Entropy Paradox
    st.header("🎯 The Entropy Paradox")
    st.markdown("""
    <div class="info-box">
    <b>The Central Question:</b> How can psychedelics increase neural entropy (signal diversity) 
    while simultaneously producing experiences rated as "among the most meaningful of my life"?
    <br><br>
    This appears to contradict Karl Friston's Free-Energy Principle, which suggests that 
    adaptive systems minimize entropy to maintain coherent internal models.
    </div>
    """, unsafe_allow_html=True)

    st.markdown("---")

    # Dual Process Resolution
    st.header("💡 The Dual-Process Resolution")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("""
        <div class="process-card">
        <h3>🌱 Routine Meaning</h3>
        <ul>
        <li><b>Process:</b> Gradual entropy reduction</li>
        <li><b>Timescale:</b> Seconds to minutes</li>
        <li><b>Mechanism:</b> Emotional-cognitive synergy</li>
        <li><b>Trajectory:</b> Monotonic decrease</li>
        <li><b>Phenomenology:</b> "Things make sense"</li>
        </ul>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="process-card-transform">
        <h3>🔥 Transformative Meaning</h3>
        <ul>
        <li><b>Process:</b> Elevation → Deep reduction</li>
        <li><b>Timescale:</b> Hours to days</li>
        <li><b>Mechanism:</b> Dismantle → Reconstruct</li>
        <li><b>Trajectory:</b> Biphasic (spike → collapse)</li>
        <li><b>Phenomenology:</b> "Everything connects"</li>
        </ul>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # Key Insight
    st.header("🔑 Key Insight")
    st.info("""
    **Both processes ultimately minimize entropy and increase coherence, but transformation requires 
    a temporary "entropy detour" through instability** — analogous to annealing, where temporary 
    heating enables reorganization into stronger structures upon cooling.
    """)

    # Framework Variables
    st.header("📊 Key Variables")

    var_data = {
        "Variable": ["H_e", "H_c", "M_r", "M_t", "E", "C", "Ψ"],
        "Name": ["Emotional Entropy", "Cognitive Entropy", "Routine Meaning", "Transformative Meaning", 
                "Emotional Energy", "Cognitive Structure", "Cultural Factor"],
        "Description": [
            "Uncertainty in affective predictions",
            "Uncertainty in beliefs",
            "Everyday coherence (MLQ)",
            "Depth of insight (MEQ30)",
            "Arousal/valence intensity",
            "Strength of priors",
            "Emotion regulation norms"
        ]
    }
    st.dataframe(pd.DataFrame(var_data), use_container_width=True)

# ============================================
# ROUTINE PROCESS PAGE
# ============================================
elif page == "📊 Routine Process":
    st.header("📊 Routine Meaning Emergence")
    st.markdown("Gradual entropy reduction during everyday coherent functioning")

    # Key metrics for routine
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("⏱️ Duration", "10 seconds", help="Simulation duration")
    with col2:
        st.metric("📉 H_e Final", f"{table_demo1['H_e'].iloc[-1]:.3f}", 
                 delta=f"{table_demo1['H_e'].iloc[-1] - table_demo1['H_e'].iloc[0]:.3f}")
    with col3:
        st.metric("📈 M_r Final", f"{table_demo1['M_r'].iloc[-1]:.3f}", 
                 delta=f"{table_demo1['M_r'].iloc[-1] - table_demo1['M_r'].iloc[0]:.3f}")

    # Entropy Trajectory
    st.subheader("Entropy Trajectories")
    fig1 = go.Figure()
    fig1.add_trace(go.Scatter(
        x=routine_full['time_s'], y=routine_full['H_e'],
        mode='lines', name='H_e (Emotional Entropy)',
        line=dict(color='#EF4444', width=2)
    ))
    fig1.add_trace(go.Scatter(
        x=routine_full['time_s'], y=routine_full['H_c'],
        mode='lines', name='H_c (Cognitive Entropy)',
        line=dict(color='#3B82F6', width=2)
    ))
    fig1.update_layout(
        title="Routine Entropy Trajectories",
        xaxis_title="Time (seconds)",
        yaxis_title="Arbitrary Units",
        height=400,
        template="plotly_white"
    )
    st.plotly_chart(fig1, use_container_width=True)

    # Meaning Emergence
    st.subheader("Meaning Emergence")
    fig2 = go.Figure()
    fig2.add_trace(go.Scatter(
        x=routine_full['time_s'], y=routine_full['M_r'],
        mode='lines', name='M_r (Routine Meaning)',
        line=dict(color='#10B981', width=3),
        fill='tozeroy'
    ))
    fig2.update_layout(
        title="Routine Meaning Emergence",
        xaxis_title="Time (seconds)",
        yaxis_title="Meaning (0-1)",
        height=400,
        template="plotly_white"
    )
    st.plotly_chart(fig2, use_container_width=True)

    # Input Signals
    st.subheader("Input Signals")
    fig3 = make_subplots(rows=2, cols=1, shared_xaxes=True,
                        subplot_titles=("Emotional Energy (E)", "Cognitive Structure (C)"))
    fig3.add_trace(go.Scatter(x=routine_full['time_s'], y=routine_full['E'],
                             mode='lines', name='E', line=dict(color='#F59E0B')),
                  row=1, col=1)
    fig3.add_trace(go.Scatter(x=routine_full['time_s'], y=routine_full['C'],
                             mode='lines', name='C', line=dict(color='#8B5CF6')),
                  row=2, col=1)
    fig3.update_layout(height=500, template="plotly_white", showlegend=False)
    st.plotly_chart(fig3, use_container_width=True)

    # Data Table
    st.subheader("📋 Key Timepoints")
    st.dataframe(table_demo1, use_container_width=True)

# ============================================
# TRANSFORMATIVE PROCESS PAGE
# ============================================
elif page == "🔥 Transformative Process":
    st.header("🔥 Transformative Meaning Emergence")
    st.markdown("Biphasic trajectory: transient entropy elevation followed by deep reduction")

    t_peak = transformative_meta['t_peak_h'].values[0]

    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("⏱️ Duration", "8 hours", help="Simulation duration")
    with col2:
        st.metric("📈 Peak H_e", f"{table_demo2['H_e'].max():.3f}", 
                 delta=f"at {t_peak:.1f}h", delta_color="off")
    with col3:
        st.metric("📉 Final H_e", f"{table_demo2['H_e'].iloc[-1]:.3f}", 
                 help="Below baseline!")
    with col4:
        st.metric("📊 Final M_t", "1.000", help="Normalized cumulative")

    # Drug Profile
    st.subheader("Perturbation Profile (Psychedelic-like)")
    fig1 = go.Figure()
    fig1.add_trace(go.Scatter(
        x=transformative_full['time_h'], y=transformative_full['D'],
        mode='lines', name='D(t) Perturbation',
        line=dict(color='#DC2626', width=2),
        fill='tozeroy'
    ))
    fig1.add_vline(x=t_peak, line_dash="dash", line_color="gray",
                  annotation_text=f"Peak at {t_peak}h")
    fig1.update_layout(
        title="Stylized Perturbation Profile (Gamma-shaped)",
        xaxis_title="Time (hours)",
        yaxis_title="Perturbation (arb.u.)",
        height=350,
        template="plotly_white"
    )
    st.plotly_chart(fig1, use_container_width=True)

    # Biphasic Entropy
    st.subheader("Biphasic Entropy Trajectory")
    fig2 = go.Figure()
    fig2.add_trace(go.Scatter(
        x=transformative_full['time_h'], y=transformative_full['H_e'],
        mode='lines', name='H_e (Emotional Entropy)',
        line=dict(color='#7C3AED', width=3)
    ))
    fig2.add_hline(y=0, line_dash="dot", line_color="gray", annotation_text="Baseline")
    fig2.add_vline(x=t_peak, line_dash="dash", line_color="red",
                  annotation_text="Phase 1 → Phase 2")

    # Add phase annotations
    fig2.add_annotation(x=1, y=0.7, text="Phase 1:<br>Entropy Elevation",
                       showarrow=False, bgcolor="#FEF3C7", bordercolor="#F59E0B")
    fig2.add_annotation(x=5, y=-0.3, text="Phase 2:<br>Deep Reduction",
                       showarrow=False, bgcolor="#DBEAFE", bordercolor="#3B82F6")

    fig2.update_layout(
        title="Biphasic Entropy Dynamics",
        xaxis_title="Time (hours)",
        yaxis_title="Arbitrary Units",
        height=400,
        template="plotly_white"
    )
    st.plotly_chart(fig2, use_container_width=True)

    # Cumulative Meaning
    st.subheader("Cumulative Meaning Trajectory")
    fig3 = go.Figure()
    fig3.add_trace(go.Scatter(
        x=transformative_full['time_h'], y=transformative_full['M_t'],
        mode='lines', name='M_t (Cumulative Meaning)',
        line=dict(color='#059669', width=3),
        fill='tozeroy'
    ))
    fig3.add_vline(x=t_peak, line_dash="dash", line_color="red")
    fig3.update_layout(
        title="Transformative Meaning Accumulation",
        xaxis_title="Time (hours)",
        yaxis_title="Cumulative Meaning (0-1)",
        height=400,
        template="plotly_white"
    )
    st.plotly_chart(fig3, use_container_width=True)

    # Combined view
    st.subheader("Combined Dynamics")
    fig4 = make_subplots(rows=2, cols=1, shared_xaxes=True,
                        subplot_titles=("Entropy (H_e)", "Meaning (M_t)"))
    fig4.add_trace(go.Scatter(x=transformative_full['time_h'], y=transformative_full['H_e'],
                             mode='lines', name='H_e', line=dict(color='#7C3AED')),
                  row=1, col=1)
    fig4.add_trace(go.Scatter(x=transformative_full['time_h'], y=transformative_full['M_t'],
                             mode='lines', name='M_t', line=dict(color='#059669')),
                  row=2, col=1)
    fig4.add_vline(x=t_peak, line_dash="dash", line_color="red", row="all", col=1)
    fig4.update_layout(height=600, template="plotly_white", showlegend=False)
    st.plotly_chart(fig4, use_container_width=True)

    # Data Table
    st.subheader("📋 Key Timepoints")
    st.dataframe(table_demo2, use_container_width=True)

# ============================================
# CULTURAL MODULATION PAGE
# ============================================
elif page == "🌍 Cultural Modulation":
    st.header("🌍 Cultural Modulation of Meaning Emergence")
    st.markdown("How emotion regulation norms (Ψ) affect routine meaning dynamics")

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("""
        ### 🤐 Restrained Culture
        - Lower emotional expression norms
        - Slower meaning emergence
        - More controlled regulation
        """)
    with col2:
        st.markdown("""
        ### 😊 Expressive Culture
        - Higher emotional expression norms
        - Faster meaning emergence
        - More open regulation
        """)

    # Comparison chart
    st.subheader("Cultural Comparison")

    fig = go.Figure()
    cultures = ['Restrained', 'Expressive']
    colors = ['#3B82F6', '#EF4444']

    metrics = ['M_r_final', 'time_to_M_gt_0p35_s']
    metric_names = ['Final Meaning (M_r)', 'Time to M > 0.35 (s)']

    for i, (metric, name) in enumerate(zip(metrics, metric_names)):
        fig.add_trace(go.Bar(
            name=name,
            x=cultures,
            y=table_demo3[metric],
            marker_color=colors[i],
            text=[f"{v:.3f}" if metric == 'M_r_final' else f"{v:.2f}s" for v in table_demo3[metric]],
            textposition='auto'
        ))

    fig.update_layout(
        title="Cultural Modulation Effects",
        barmode='group',
        height=450,
        template="plotly_white"
    )
    st.plotly_chart(fig, use_container_width=True)

    # Detailed table
    st.subheader("📋 Detailed Results")
    st.dataframe(table_demo3, use_container_width=True)

    # Key findings
    st.info("""
    **Key Finding:** Expressive cultures show faster meaning emergence (1.6s vs 1.99s) 
    while achieving similar final meaning levels. This suggests cultural norms modulate 
    the *speed* of meaning-making, not necessarily its *quality*.
    """)

# ============================================
# PARAMETER SENSITIVITY PAGE
# ============================================
elif page == "⚙️ Parameter Sensitivity":
    st.header("⚙️ Parameter Sensitivity Analysis")
    st.markdown("Effect of varying emotional regulation capacity (α_E)")

    # Sensitivity charts
    col1, col2 = st.columns(2)

    with col1:
        fig1 = px.line(table_demo4, x='alpha_E', y='M_r_final',
                      markers=True, title="Final Meaning vs α_E")
        fig1.update_traces(line_color='#10B981', marker_size=10)
        fig1.update_layout(height=350, template="plotly_white")
        st.plotly_chart(fig1, use_container_width=True)

    with col2:
        fig2 = px.line(table_demo4, x='alpha_E', y='time_to_M_gt_0p40_s',
                      markers=True, title="Time to Reach M > 0.40")
        fig2.update_traces(line_color='#F59E0B', marker_size=10)
        fig2.update_layout(height=350, template="plotly_white")
        st.plotly_chart(fig2, use_container_width=True)

    # H_e vs alpha_E
    fig3 = px.line(table_demo4, x='alpha_E', y='H_e_final',
                  markers=True, title="Final Entropy vs α_E")
    fig3.update_traces(line_color='#EF4444', marker_size=10)
    fig3.update_layout(height=350, template="plotly_white")
    st.plotly_chart(fig3, use_container_width=True)

    # Data table
    st.subheader("📋 Sensitivity Results")
    st.dataframe(table_demo4, use_container_width=True)

    st.success("""
    **Interpretation:** Higher emotional regulation capacity (α_E) leads to:
    - Faster meaning emergence (reduced time to threshold)
    - Higher final meaning levels
    - Lower final entropy (better regulation)
    """)

# ============================================
# PREDICTIONS & VALIDATION PAGE
# ============================================
elif page == "🔮 Predictions & Validation":
    st.header("🔮 Falsifiable Predictions")

    # Prediction 1
    st.subheader("Prediction 1: Routine Entropy-Meaning Correlation")
    st.markdown("""
    **Hypothesis:** In routine contexts, H_e negatively correlates with self-reported meaning.

    | Aspect | Details |
    |--------|---------|
    | Test | r(H_e, MLQ_presence) < -0.3, p < 0.05 |
    | Falsification | If \|r\| < 0.2 or positive |
    | Sample | n=50 (power=0.80) |
    """)

    # Prediction 2
    st.subheader("Prediction 2: Biphasic Psychedelic Trajectory")
    st.markdown("""
    **Hypothesis:** During psilocybin sessions, entropy shows a biphasic pattern:
    - **Phase 1 (0-3h):** H_e increases
    - **Phase 2 (4-8h):** H_e decreases, potentially undershooting baseline

    | Aspect | Details |
    |--------|---------|
    | Test | Within-subject: H_e(8h) < H_e(0h) |
    | Falsification | If H_e(8h) ≥ H_e(0h) in >80% of participants |
    | Sample | n=20 (pilot) |
    """)

    # Prediction 3
    st.subheader("Prediction 3: Cultural Moderation")
    st.markdown("""
    **Hypothesis:** Ψ moderates the H_e → meaning relationship.

    | Aspect | Details |
    |--------|---------|
    | Model | MLQ = β₀ + β₁·H_e + β₂·Ψ + β₃·(H_e×Ψ) + ε |
    | Expected | β₃ > +0.10, p < 0.05 |
    | Falsification | If β₃ ≈ 0 |
    | Sample | n=100 (50 per culture) |
    """)

    st.markdown("---")

    # Validation Strategy
    st.header("📋 Validation Strategy")

    phases = {
        "Phase 1: Measurement Validation (6 months)": [
            "Test-retest reliability of H_e (ICC > 0.70)",
            "Convergent validity: r(H_e, anxiety) > 0.3",
            "Decision: ICC < 0.50 → revise measures"
        ],
        "Phase 2: Cross-Cultural Test (12 months)": [
            "Two cultural contexts (high vs low Ψ)",
            "Test Predictions 1 and 3",
            "Decision: β₃ ≈ 0 → drop cultural claim"
        ],
        "Phase 3: Prospective Validation (24 months)": [
            "Longitudinal design, full model fitting",
            "Out-of-sample prediction (R² > 0.25)",
            "Decision: R² < 0.10 → reject framework"
        ]
    }

    for phase, items in phases.items():
        with st.expander(phase):
            for item in items:
                st.markdown(f"- {item}")

# ============================================
# ABOUT PAGE
# ============================================
elif page == "📚 About":
    st.header("📚 About E.M.E.R.G.E+")

    st.markdown("""
    ### Framework Overview

    The **E.M.E.R.G.E+** (Entropy-Modulated Emergence of Representational Gestalt Experience) framework 
    proposes a dual-process theory of meaning emergence that reconciles the apparent paradox between:

    1. **Active Inference / Free-Energy Principle** (Friston): Adaptive systems minimize entropy
    2. **Entropic Brain Hypothesis** (Carhart-Harris): Psychedelics increase entropy during meaningful experiences

    ### Core Innovation

    The framework distinguishes two qualitatively different processes:

    | Aspect | Routine | Transformative |
    |--------|---------|----------------|
    | Path | Direct (tidying) | Indirect (destabilize → rebuild) |
    | Timescale | Seconds-minutes | Hours-days |
    | Entropy | Monotonic decrease | Biphasic (spike → collapse) |
    | Cultural | High dependence | Lower during peak |

    ### Mathematical Foundation

    The framework uses coupled differential equations:

    **Routine Process:**
    ```
    dH_e/dt = -α_E·tanh(E - E_opt) - β_E·Φ - χ_E·Θ + ν_E
    dH_c/dt = -α_C·C - β_C·Φ - χ_C·Θ + ν_C
    ```

    **Transformative Process:**
    ```
    Phase 1: dH_e/dt = +γ·D(t) - α_E·tanh(E - E_opt) + ν_E
    Phase 2: dH_e/dt = -α_E·tanh(E - E_opt) - β_transform·(H_e - H_e*) + ν_E
    ```

    ### Author

    **Amir Lotfifar**  
    Independent Researcher, Cognitive Psychology  
    Email: amir.lotfifar1994@gmail.com

    ### Important Disclaimer

    > This dashboard presents **mathematical demonstrations** with hypothetical parameters. 
    > They are **not** empirical measurements from human participants. All simulation outputs 
    > demonstrate internal consistency of the equations rather than empirical validity.

    ### Current Status

    - ✅ Theoretical framework developed
    - ✅ Mathematical formulations specified
    - ✅ Computational simulations completed
    - ✅ Falsifiable predictions defined
    - ⏳ Empirical validation pending

    **n = 0** (No human-participant data collected)
    """)

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #6B7280; font-size: 0.8rem;">
    E.M.E.R.G.E+ Framework Dashboard | December 2025 | Amir Lotfifar
</div>
""", unsafe_allow_html=True)
