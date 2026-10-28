/**
 * LÓGICA PRINCIPAL DEL PANEL DE CONTROL Y PRECALCULADOR ERASMUS+ (KA131-HED)
 * Carga desde window.ERASMUS_DATA (app/data/erasmus-data.js) y opera en memoria.
 */

const App = (() => {
  // Copia profunda en memoria de los datos estáticos para simular sin perder el original
  let state = {
    activeCall: "2025",
    activeView: "dashboard",
    includePlanned: true,
    theme: "light",
    data: null,
    lastCalcResult: null
  };

  const fmtEUR = (num) => {
    const val = Number(num) || 0;
    return val.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " €";
  };

  const fmtPct = (num) => {
    const val = Number(num) || 0;
    return val.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " %";
  };

  function cloneStaticData() {
    return JSON.parse(JSON.stringify(window.ERASMUS_DATA));
  }

  function init() {
    state.data = cloneStaticData();
    populateCalculatorSelects();
    populateEditModalCountries();
    onCalcTypeChange();
    renderAll();
  }

  function resetToStaticFile() {
    state.data = cloneStaticData();
    // Sincronizar inputs del simulador 2026
    const p26 = state.data.proyectos["2026"].resumenOficial;
    document.getElementById("sim26-smp-plazas").value = p26.porActividad.SMP.participantesConcedidos;
    document.getElementById("sim26-sta-plazas").value = p26.porActividad.STA.participantesConcedidos;
    document.getElementById("sim26-stt-plazas").value = p26.porActividad.STT.participantesConcedidos;
    renderAll();
  }

  function setCall(callId) {
    state.activeCall = callId;
    document.querySelectorAll(".call-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.call === callId);
    });
    // Sincronizar el selector de convocatoria en filtros y calculadora
    const filterCall = document.getElementById("filter-call");
    if (filterCall) filterCall.value = callId;
    const calcCall = document.getElementById("calc-call");
    if (calcCall) calcCall.value = callId;

    renderAll();
  }

  function switchView(viewId) {
    state.activeView = viewId;
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.view === viewId);
    });
    document.querySelectorAll(".view-section").forEach((sec) => {
      sec.classList.toggle("active", sec.id === `view-${viewId}`);
    });
    renderAll();
  }

  function toggleIncludePlanned(checked) {
    state.includePlanned = Boolean(checked);
    renderAll();
  }

  function toggleTheme() {
    state.theme = state.theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", state.theme);
    const btn = document.getElementById("theme-toggle-btn");
    btn.textContent = state.theme === "light" ? "🌙 Tema" : "☀️ Tema";
  }

  /**
   * Calcula las métricas agregadas de una convocatoria combinando los topes concedidos
   * y las movilidades (Declaradas vs Planificadas/En curso) en memoria.
   */
  function computeCallMetrics(callId) {
    const project = state.data.proyectos[callId];
    const oficial = project.resumenOficial;
    const osRate = state.data.tarifasSEPIE.apoyoOrganizativoPorParticipante;

    const mobs = state.data.movilidades.filter((m) => m.convocatoria === callId);
    const declaredMobs = mobs.filter((m) => m.estado === "Declarada");
    const plannedMobs = mobs.filter((m) => m.estado !== "Declarada");

    const sumBy = (list, fn) => list.reduce((acc, item) => acc + (Number(fn(item)) || 0), 0);

    const byType = {};
    ["STA", "SMP", "STT"].forEach((tipo) => {
      const conc = oficial.porActividad[tipo];
      const decList = declaredMobs.filter((m) => m.tipo === tipo);
      const planList = plannedMobs.filter((m) => m.tipo === tipo);

      const decIndiv = sumBy(decList, (m) => m.apoyoIndividual);
      const decTravel = sumBy(decList, (m) => m.apoyoViaje);
      const decTotal = sumBy(decList, (m) => m.totalSubvencion);

      const planIndiv = sumBy(planList, (m) => m.apoyoIndividual);
      const planTravel = sumBy(planList, (m) => m.apoyoViaje);
      const planTotal = sumBy(planList, (m) => m.totalSubvencion);

      const activePlanTotal = state.includePlanned ? planTotal : 0;
      const activePlanPart = state.includePlanned ? planList.length : 0;

      const projectedTotal = decTotal + activePlanTotal;
      const projectedPart = decList.length + activePlanPart;

      byType[tipo] = {
        codigo: tipo,
        nombre: conc.nombre,
        concedidoPart: conc.participantesConcedidos,
        concedidoEur: conc.subvencionConcedida,
        declaradoPart: decList.length,
        declaradoIndiv: decIndiv,
        declaradoTravel: decTravel,
        declaradoTravelPart: decList.filter((m) => Number(m.apoyoViaje) > 0).length,
        declaradoEur: decTotal,
        declaradoPct: conc.subvencionConcedida > 0 ? (decTotal / conc.subvencionConcedida) * 100 : 0,
        planificadoPart: planList.length,
        planificadoIndiv: planIndiv,
        planificadoTravel: planTravel,
        planificadoEur: planTotal,
        proyectadoPart: projectedPart,
        proyectadoEur: projectedTotal,
        proyectadoPct: conc.subvencionConcedida > 0 ? (projectedTotal / conc.subvencionConcedida) * 100 : 0,
        saldoDeclarado: conc.subvencionConcedida - decTotal,
        saldoProyectado: conc.subvencionConcedida - projectedTotal
      };
    });

    // Totales de Movilidad (STA + SMP + STT)
    const movConcedidoPart = oficial.movilidadTotal.participantesConcedidos;
    const movConcedidoEur = oficial.movilidadTotal.subvencionConcedida;

    const movDeclaradoPart = declaredMobs.length;
    const movDeclaradoIndiv = sumBy(declaredMobs, (m) => m.apoyoIndividual);
    const movDeclaradoTravel = sumBy(declaredMobs, (m) => m.apoyoViaje);
    const movDeclaradoTravelPart = declaredMobs.filter((m) => Number(m.apoyoViaje) > 0).length;
    const movDeclaradoEur = sumBy(declaredMobs, (m) => m.totalSubvencion);
    const movDeclaradoPct = movConcedidoEur > 0 ? (movDeclaradoEur / movConcedidoEur) * 100 : 0;

    const movPlanPart = plannedMobs.length;
    const movPlanIndiv = sumBy(plannedMobs, (m) => m.apoyoIndividual);
    const movPlanTravel = sumBy(plannedMobs, (m) => m.apoyoViaje);
    const movPlanEur = sumBy(plannedMobs, (m) => m.totalSubvencion);

    const activeMovPlanEur = state.includePlanned ? movPlanEur : 0;
    const activeMovPlanPart = state.includePlanned ? movPlanPart : 0;

    const movProyectadoPart = movDeclaradoPart + activeMovPlanPart;
    const movProyectadoEur = movDeclaradoEur + activeMovPlanEur;
    const movSaldoDeclarado = movConcedidoEur - movDeclaradoEur;
    const movSaldoProyectado = movConcedidoEur - movProyectadoEur;

    // Apoyo Organizativo (OS): 400 € por participante hasta el tope concedido
    const osConcedidoPart = oficial.apoyoOrganizativo.participantesConcedidos;
    const osConcedidoEur = oficial.apoyoOrganizativo.subvencionConcedida;
    const osDeclaradoEur = Math.min(osConcedidoEur, movDeclaradoPart * osRate);
    const osPlanEur = Math.max(0, Math.min(osConcedidoEur - osDeclaradoEur, movPlanPart * osRate));
    const activeOsPlanEur = state.includePlanned ? osPlanEur : 0;
    const osProyectadoEur = osDeclaradoEur + activeOsPlanEur;

    // Total del Proyecto (Movilidad + Apoyo Organizativo)
    const totalConcedidoEur = movConcedidoEur + osConcedidoEur;
    const totalDeclaradoEur = movDeclaradoEur + osDeclaradoEur;
    const totalDeclaradoPct = totalConcedidoEur > 0 ? (totalDeclaradoEur / totalConcedidoEur) * 100 : 0;
    const totalPlanEur = movPlanEur + osPlanEur;
    const totalProyectadoEur = movProyectadoEur + osProyectadoEur;
    const totalProyectadoPct = totalConcedidoEur > 0 ? (totalProyectadoEur / totalConcedidoEur) * 100 : 0;
    const totalSaldoDeclarado = totalConcedidoEur - totalDeclaradoEur;
    const totalSaldoProyectado = totalConcedidoEur - totalProyectadoEur;

    // Reglas de Trasvase y Flexibilidad Presupuestaria KA131-HED
    // 1. De Personal (STA+STT) a Estudiantes (SMP): permitido hasta el 100%
    // 2. De Estudiantes (SMP) a Personal (STA+STT): permitido máximo el 10% del concedido a SMP
    const smpConcedido = byType.SMP.concedidoEur;
    const staffConcedido = byType.STA.concedidoEur + byType.STT.concedidoEur;
    const maxTransferSmpToStaff = smpConcedido * 0.10;

    const smpUsadoDeclarado = byType.SMP.declaradoEur;
    const staffUsadoDeclarado = byType.STA.declaradoEur + byType.STT.declaradoEur;

    const smpUsadoProyectado = byType.SMP.proyectadoEur;
    const staffUsadoProyectado = byType.STA.proyectadoEur + byType.STT.proyectadoEur;

    const trasvaseStaffToSmpDeclarado = Math.max(0, smpUsadoDeclarado - smpConcedido);
    const trasvaseStaffToSmpProyectado = Math.max(0, smpUsadoProyectado - smpConcedido);

    const trasvaseSmpToStaffProyectado = Math.max(0, staffUsadoProyectado - staffConcedido);
    const excede10PctSmpToStaff = trasvaseSmpToStaffProyectado > maxTransferSmpToStaff + 0.01;

    return {
      project,
      byType,
      movilidad: {
        concedidoPart: movConcedidoPart,
        concedidoEur: movConcedidoEur,
        declaradoPart: movDeclaradoPart,
        declaradoIndiv: movDeclaradoIndiv,
        declaradoTravel: movDeclaradoTravel,
        declaradoTravelPart: movDeclaradoTravelPart,
        declaradoEur: movDeclaradoEur,
        declaradoPct: movDeclaradoPct,
        planificadoPart: movPlanPart,
        planificadoIndiv: movPlanIndiv,
        planificadoTravel: movPlanTravel,
        planificadoEur: movPlanEur,
        proyectadoPart: movProyectadoPart,
        proyectadoEur: movProyectadoEur,
        saldoDeclarado: movSaldoDeclarado,
        saldoProyectado: movSaldoProyectado
      },
      os: {
        concedidoPart: osConcedidoPart,
        concedidoEur: osConcedidoEur,
        declaradoPart: movDeclaradoPart,
        declaradoEur: osDeclaradoEur,
        declaradoPct: osConcedidoEur > 0 ? (osDeclaradoEur / osConcedidoEur) * 100 : 0,
        planificadoPart: movPlanPart,
        planificadoEur: osPlanEur,
        proyectadoEur: osProyectadoEur,
        saldoDeclarado: osConcedidoEur - osDeclaradoEur,
        saldoProyectado: osConcedidoEur - osProyectadoEur
      },
      total: {
        concedidoPart: movConcedidoPart,
        concedidoEur: totalConcedidoEur,
        declaradoPart: movDeclaradoPart,
        declaradoEur: totalDeclaradoEur,
        declaradoPct: totalDeclaradoPct,
        planificadoPart: movPlanPart,
        planificadoEur: totalPlanEur,
        proyectadoPart: movProyectadoPart,
        proyectadoEur: totalProyectadoEur,
        proyectadoPct: totalProyectadoPct,
        saldoDeclarado: totalSaldoDeclarado,
        saldoProyectado: totalSaldoProyectado
      },
      flexibilidad: {
        smpConcedido,
        staffConcedido,
        maxTransferSmpToStaff,
        trasvaseStaffToSmpDeclarado,
        trasvaseStaffToSmpProyectado,
        trasvaseSmpToStaffProyectado,
        excede10PctSmpToStaff,
        techoEfectivoStaffRestanteDeclarado: Math.max(0, staffConcedido - trasvaseStaffToSmpDeclarado - staffUsadoDeclarado)
      }
    };
  }

  function renderAll() {
    const m = computeCallMetrics(state.activeCall);

    // Actualizar cabecera
    document.getElementById("active-project-code").textContent = `📂 ${m.project.codigo}`;
    document.getElementById("nav-mob-count").textContent = state.data.movilidades.length;

    // Actualizar barra superior de estado de simulación
    const simSummary = document.getElementById("sim-status-summary");
    simSummary.innerHTML = `
      <strong>${m.project.convocatoria}:</strong>
      Declarado oficial: <strong>${fmtEUR(m.total.declaradoEur)}</strong> (${fmtPct(m.total.declaradoPct)})
      ${state.includePlanned ? ` + Simulado/Planificado: <strong>${fmtEUR(m.total.planificadoEur)}</strong> → Proyección Total: <strong>${fmtEUR(m.total.proyectadoEur)}</strong> (${fmtPct(m.total.proyectadoPct)})` : ""}
    `;

    renderDashboard(m);
    updatePrecalculator();
    renderMobilitiesTable();
    render2026Planner();
  }

  /**
   * RENDERIZADO DE LA VISTA 1: DASHBOARD DE EJECUCIÓN
   */
  function renderDashboard(m) {
    const kpiGrid = document.getElementById("dashboard-kpi-grid");
    const decPctWidth = Math.min(100, m.total.declaradoPct);
    const planPctWidth = state.includePlanned
      ? Math.max(0, Math.min(100 - decPctWidth, (m.total.planificadoEur / m.total.concedidoEur) * 100))
      : 0;

    const movDecPctWidth = Math.min(100, m.movilidad.declaradoPct);
    const movPlanPctWidth = state.includePlanned
      ? Math.max(0, Math.min(100 - movDecPctWidth, (m.movilidad.planificadoEur / m.movilidad.concedidoEur) * 100))
      : 0;

    kpiGrid.innerHTML = `
      <!-- KPI 1: Total Proyecto -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Total Presupuesto Proyecto</span>
          <span class="badge ${m.total.saldoProyectado < -0.01 ? "badge-danger" : "badge-primary"}">
            ${fmtPct(state.includePlanned ? m.total.proyectadoPct : m.total.declaradoPct)} proyectado
          </span>
        </div>
        <div class="kpi-value">${fmtEUR(m.total.concedidoEur)}</div>
        <div class="progress-track" title="Azul oscuro: Declarado | Azul claro rayado: Planificado">
          <div class="progress-fill declared" style="width: ${decPctWidth}%"></div>
          <div class="progress-fill simulated" style="width: ${planPctWidth}%"></div>
        </div>
        <div class="kpi-sub">
          <span>Declarado: <strong>${fmtEUR(m.total.declaradoEur)}</strong> (${fmtPct(m.total.declaradoPct)})</span>
          <span>Saldo libre: <strong>${fmtEUR(m.total.saldoDeclarado)}</strong></span>
        </div>
      </div>

      <!-- KPI 2: Bolsas de Movilidad (Individual + Viaje) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Becas de Movilidad (Indiv. + Viaje)</span>
          <span class="badge badge-success">Disponible: ${fmtEUR(m.movilidad.saldoDeclarado)}</span>
        </div>
        <div class="kpi-value">${fmtEUR(m.movilidad.declaradoEur)} <span style="font-size:0.95rem; font-weight:600; color:var(--text-muted);">/ ${fmtEUR(m.movilidad.concedidoEur)}</span></div>
        <div class="progress-track">
          <div class="progress-fill declared" style="width: ${movDecPctWidth}%"></div>
          <div class="progress-fill simulated" style="width: ${movPlanPctWidth}%"></div>
        </div>
        <div class="kpi-sub">
          <span>Indiv.: <strong>${fmtEUR(m.movilidad.declaradoIndiv)}</strong> | Viaje: <strong>${fmtEUR(m.movilidad.declaradoTravel)}</strong></span>
          <span>Simulado: <strong>+${fmtEUR(m.movilidad.planificadoEur)}</strong></span>
        </div>
      </div>

      <!-- KPI 3: Participantes y Plazas -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Participantes / Movilidades</span>
          <span class="badge badge-purple">${m.movilidad.proyectadoPart} / ${m.movilidad.concedidoPart} plazas</span>
        </div>
        <div class="kpi-value">${m.movilidad.declaradoPart} declarados <span style="font-size:0.95rem; font-weight:600; color:var(--text-muted);">de ${m.movilidad.concedidoPart}</span></div>
        <div class="progress-track">
          <div class="progress-fill success" style="width: ${Math.min(100, (m.movilidad.declaradoPart / m.movilidad.concedidoPart) * 100)}%"></div>
          <div class="progress-fill simulated" style="width: ${state.includePlanned ? Math.min(100 - (m.movilidad.declaradoPart / m.movilidad.concedidoPart) * 100, (m.movilidad.planificadoPart / m.movilidad.concedidoPart) * 100) : 0}%"></div>
        </div>
        <div class="kpi-sub">
          <span>SMP: <strong>${m.byType.SMP.declaradoPart}/${m.byType.SMP.concedidoPart}</strong> | STA: <strong>${m.byType.STA.declaradoPart}/${m.byType.STA.concedidoPart}</strong> | STT: <strong>${m.byType.STT.declaradoPart}/${m.byType.STT.concedidoPart}</strong></span>
          <span>En simulación: <strong>+${m.movilidad.planificadoPart}</strong></span>
        </div>
      </div>

      <!-- KPI 4: Apoyo Organizativo (OS) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Apoyo Organizativo (OS - 400€/part.)</span>
          <span class="badge badge-warning">${fmtPct(m.os.declaradoPct)} devengado</span>
        </div>
        <div class="kpi-value">${fmtEUR(m.os.declaradoEur)} <span style="font-size:0.95rem; font-weight:600; color:var(--text-muted);">/ ${fmtEUR(m.os.concedidoEur)}</span></div>
        <div class="progress-track">
          <div class="progress-fill warning" style="width: ${Math.min(100, m.os.declaradoPct)}%"></div>
          <div class="progress-fill simulated" style="width: ${state.includePlanned ? Math.min(100 - m.os.declaradoPct, (m.os.planificadoEur / m.os.concedidoEur) * 100) : 0}%"></div>
        </div>
        <div class="kpi-sub">
          <span>Consolidado: <strong>${m.os.declaradoPart} × 400 €</strong></span>
          <span>Pendiente: <strong>${fmtEUR(m.os.saldoDeclarado)}</strong></span>
        </div>
      </div>
    `;

    // Tarjeta de Prefinanciación y Regla del 70%
    const prefCard = document.getElementById("prefinancing-card");
    if (m.project.prefinanciacion) {
      const pf = m.project.prefinanciacion;
      const pctOfCuota1Declared = (m.total.declaradoEur / pf.cuota1Importe) * 100;
      const pctOfCuota1Projected = (m.total.proyectadoEur / pf.cuota1Importe) * 100;
      const diff70Declared = m.total.declaradoEur - pf.umbral70Cuota1;
      const alcanza70Declarado = diff70Declared >= -0.005;

      prefCard.innerHTML = `
        <div class="card-header">
          <div>
            <div class="card-title">Tesorería y Regla del 70% de Prefinanciación (Cláusula 22.3.1 Convenio)</div>
            <h3 style="font-size: 1rem; margin-top: 0.15rem;">Control de Desbloqueo del 2º Pago de Prefinanciación</h3>
          </div>
          <span class="badge ${alcanza70Declarado ? "badge-success" : "badge-warning"}">
            ${alcanza70Declarado ? "Umbral 70% Superado" : "Al 69,44% de la 1ª Cuota"}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 0.75rem;">
          <div style="background: var(--bg-subtle); padding: 0.65rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.74rem; color: var(--text-muted);">1ª Prefinanciación (80%)</div>
            <div style="font-size: 1.05rem; font-weight: 800;">${fmtEUR(pf.cuota1Importe)}</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 0.65rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.74rem; color: var(--text-muted);">Umbral 70% Exigido</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: var(--primary);">${fmtEUR(pf.umbral70Cuota1)}</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 0.65rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.74rem; color: var(--text-muted);">2ª Prefinanciación (20%)</div>
            <div style="font-size: 1.05rem; font-weight: 800;">${fmtEUR(pf.cuota2Importe)}</div>
          </div>
        </div>

        <div style="font-size: 0.83rem; display: flex; justify-content: space-between;">
          <span>Ejecutado/Declarado sobre 1ª Prefinanciación: <strong>${fmtPct(pctOfCuota1Declared)}</strong> (${fmtEUR(m.total.declaradoEur)})</span>
          <span>Meta 70%: <strong>${fmtEUR(pf.umbral70Cuota1)}</strong></span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${alcanza70Declarado ? "success" : "warning"}" style="width: ${Math.min(100, pctOfCuota1Declared)}%"></div>
          <div class="progress-fill simulated" style="width: ${state.includePlanned ? Math.max(0, Math.min(100 - pctOfCuota1Declared, pctOfCuota1Projected - pctOfCuota1Declared)) : 0}%"></div>
        </div>

        ${
          alcanza70Declarado
            ? `<div class="alert-box alert-success">
                ✅ <strong>Umbral del 70% alcanzado en importe declarado (${fmtEUR(m.total.declaradoEur)} ≥ ${fmtEUR(pf.umbral70Cuota1)}).</strong>
                El centro tiene derecho al abono íntegro del segundo pago de prefinanciación de <strong>${fmtEUR(pf.cuota2Importe)}</strong>.
              </div>`
            : `<div class="alert-box alert-warning">
                ⚠️ <strong>Atención Coordinación (Cláusula 22.3.1):</strong> Con los <strong>${fmtEUR(m.total.declaradoEur)}</strong> declarados actualmente (5 movilidades), el uso de la 1ª prefinanciación está en el <strong>${fmtPct(pctOfCuota1Declared)}</strong>.
                Faltan únicamente <strong>${fmtEUR(Math.abs(diff70Declared))}</strong> para alcanzar el umbral del 70% (<strong>${fmtEUR(pf.umbral70Cuota1)}</strong>).
                Declarando tan solo 1 movilidad adicional se desbloquea el 100% de los <strong>${fmtEUR(pf.cuota2Importe)}</strong> sin reducción.
              </div>`
        }
      `;
    } else {
      const estPref1 = m.total.concedidoEur * 0.8;
      const estPref2 = m.total.concedidoEur * 0.2;
      const est70 = estPref1 * 0.7;
      prefCard.innerHTML = `
        <div class="card-header">
          <div>
            <div class="card-title">Estimación de Pagos de Prefinanciación (80% / 20%)</div>
            <h3 style="font-size: 1rem; margin-top: 0.15rem;">Proyección de Tesorería Convocatoria 2026</h3>
          </div>
          <span class="badge badge-primary">Estimado</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 0.5rem;">
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">1ª Prefinanciación (80%)</div>
            <div style="font-size: 1.1rem; font-weight: 800;">${fmtEUR(estPref1)}</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">Umbral 70% para 2º Pago</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">${fmtEUR(est70)}</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">2ª Prefinanciación (20%)</div>
            <div style="font-size: 1.1rem; font-weight: 800;">${fmtEUR(estPref2)}</div>
          </div>
        </div>
        <div class="alert-box alert-info">
          ℹ️ En proyectos KA131-HED, SEPIE abona un <strong>80% inicial</strong> a los 30 días de la firma del convenio y el <strong>20% restante</strong> tras el informe periódico al superar el 70% de ejecución del primer anticipo.
        </div>
      `;
    }

    // Tarjeta de Flexibilidad y Trasvases entre Partidas
    const flexCard = document.getElementById("flexibility-card");
    const fx = m.flexibilidad;
    flexCard.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">Flexibilidad Presupuestaria sin Adenda (Anexo 5 / Hoja 2 Presupuesto)</div>
          <h3 style="font-size: 1rem; margin-top: 0.15rem;">Control de Trasvases Estudiantes (SMP) ↔ Personal (STA/STT)</h3>
        </div>
        <span class="badge ${fx.excede10PctSmpToStaff ? "badge-danger" : "badge-success"}">
          ${fx.excede10PctSmpToStaff ? "Excede límite 10%" : "Cumple normativa KA131"}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
        <div style="background: var(--bg-subtle); padding: 0.7rem; border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="font-size: 0.74rem; color: var(--text-muted);">Trasvase Personal → Estudiantes (Máx 100%)</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--primary);">
            ${fmtEUR(state.includePlanned ? fx.trasvaseStaffToSmpProyectado : fx.trasvaseStaffToSmpDeclarado)}
          </div>
          <div style="font-size: 0.76rem; color: var(--text-secondary);">
            SMP al ${fmtPct(m.byType.SMP.declaradoPct)} (${fmtEUR(m.byType.SMP.declaradoEur)} de ${fmtEUR(m.byType.SMP.concedidoEur)})
          </div>
        </div>

        <div style="background: var(--bg-subtle); padding: 0.7rem; border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="font-size: 0.74rem; color: var(--text-muted);">Límite 10% Estudiantes → Personal</div>
          <div style="font-size: 1.05rem; font-weight: 800;">
            Máx. ${fmtEUR(fx.maxTransferSmpToStaff)}
          </div>
          <div style="font-size: 0.76rem; color: var(--text-secondary);">
            Usado: ${fmtEUR(fx.trasvaseSmpToStaffProyectado)} (10% de ${fmtEUR(fx.smpConcedido)})
          </div>
        </div>
      </div>

      <div class="alert-box ${fx.excede10PctSmpToStaff ? "alert-danger" : "alert-info"}">
        ${
          fx.trasvaseStaffToSmpDeclarado > 0
            ? `📌 <strong>Análisis de Trasvase Activo:</strong> Las movilidades de estudiantes (SMP) han consumido <strong>+${fmtEUR(fx.trasvaseStaffToSmpDeclarado)}</strong> por encima de su dotación inicial (${fmtEUR(fx.smpConcedido)}), lo cual es <strong>100% válido sin adenda</strong> tomándolo de Personal (STA/STT).
               Por tanto, el crédito real disponible para las restantes movilidades de personal es de <strong>${fmtEUR(fx.techoEfectivoStaffRestanteDeclarado)}</strong>.`
            : `📌 <strong>Regla SEPIE:</strong> Puedes transferir hasta el <strong>100%</strong> de fondos de Personal (STA/STT) hacia Estudiantes (SMP), y hasta un máximo del <strong>10% (${fmtEUR(fx.maxTransferSmpToStaff)})</strong> de Estudiantes hacia Personal sin solicitar modificación contractual.`
        }
      </div>
    `;

    // Renderizar Tabla Oficial de Presupuesto
    document.getElementById("budget-version-badge").textContent = m.project.versionPresupuesto
      ? `Versión ${m.project.versionPresupuesto} (${m.project.fechaInformePresupuesto || ""})`
      : m.project.estado;

    const tbody = document.getElementById("official-budget-tbody");
    const renderSaldoBadge = (val) => {
      if (Math.abs(val) < 0.01) return `<span class="badge badge-success">0,00 € (Cuadrado)</span>`;
      if (val > 0) return `<strong style="color: var(--success);">${fmtEUR(val)}</strong>`;
      return `<strong style="color: var(--danger);">${fmtEUR(val)}</strong>`;
    };

    const activeSaldoTotal = state.includePlanned ? m.total.saldoProyectado : m.total.saldoDeclarado;
    const activeSaldoMov = state.includePlanned ? m.movilidad.saldoProyectado : m.movilidad.saldoDeclarado;
    const activeSaldoOS = state.includePlanned ? m.os.saldoProyectado : m.os.saldoDeclarado;

    tbody.innerHTML = `
      <!-- Total del Proyecto -->
      <tr class="row-total">
        <td>Total del proyecto</td>
        <td class="num-col">${m.total.concedidoPart}</td>
        <td class="num-col">${m.total.declaradoPart}</td>
        <td class="num-col">+${m.total.planificadoPart}</td>
        <td class="num-col">${fmtEUR(m.total.concedidoEur)}</td>
        <td class="num-col">${fmtEUR(m.total.declaradoEur)}</td>
        <td class="num-col">${fmtPct(m.total.declaradoPct)}</td>
        <td class="num-col">${fmtEUR(m.total.planificadoEur)}</td>
        <td class="num-col">${fmtEUR(m.total.proyectadoEur)}</td>
        <td class="num-col">${renderSaldoBadge(activeSaldoTotal)}</td>
      </tr>

      <!-- Subvenciones de movilidad -->
      <tr class="row-category">
        <td>Mobility activity grants (Individual + Travel support)</td>
        <td class="num-col">${m.movilidad.concedidoPart}</td>
        <td class="num-col">${m.movilidad.declaradoPart}</td>
        <td class="num-col">+${m.movilidad.planificadoPart}</td>
        <td class="num-col">${fmtEUR(m.movilidad.concedidoEur)}</td>
        <td class="num-col">${fmtEUR(m.movilidad.declaradoEur)}</td>
        <td class="num-col">${fmtPct(m.movilidad.declaradoPct)}</td>
        <td class="num-col">${fmtEUR(m.movilidad.planificadoEur)}</td>
        <td class="num-col">${fmtEUR(m.movilidad.proyectadoEur)}</td>
        <td class="num-col">${renderSaldoBadge(activeSaldoMov)}</td>
      </tr>

      <tr class="row-sub">
        <td>↳ Individual support (Apoyo individual total)</td>
        <td class="num-col">—</td>
        <td class="num-col">${m.movilidad.declaradoPart}</td>
        <td class="num-col">+${m.movilidad.planificadoPart}</td>
        <td class="num-col">—</td>
        <td class="num-col">${fmtEUR(m.movilidad.declaradoIndiv)}</td>
        <td class="num-col">—</td>
        <td class="num-col">${fmtEUR(m.movilidad.planificadoIndiv)}</td>
        <td class="num-col">${fmtEUR(m.movilidad.declaradoIndiv + (state.includePlanned ? m.movilidad.planificadoIndiv : 0))}</td>
        <td class="num-col">—</td>
      </tr>

      <tr class="row-sub">
        <td>↳ Travel support (Apoyo para viaje total)</td>
        <td class="num-col">—</td>
        <td class="num-col">${m.movilidad.declaradoTravelPart}</td>
        <td class="num-col">+${m.movilidad.planificadoPart}</td>
        <td class="num-col">—</td>
        <td class="num-col">${fmtEUR(m.movilidad.declaradoTravel)}</td>
        <td class="num-col">—</td>
        <td class="num-col">${fmtEUR(m.movilidad.planificadoTravel)}</td>
        <td class="num-col">${fmtEUR(m.movilidad.declaradoTravel + (state.includePlanned ? m.movilidad.planificadoTravel : 0))}</td>
        <td class="num-col">—</td>
      </tr>

      <!-- Desglose por Tipo de Actividad -->
      ${["STA", "SMP", "STT"]
        .map((code) => {
          const act = m.byType[code];
          const saldoAct = state.includePlanned ? act.saldoProyectado : act.saldoDeclarado;
          return `
            <tr class="row-category">
              <td><strong>${act.codigo}</strong> — ${act.nombre}</td>
              <td class="num-col">${act.concedidoPart}</td>
              <td class="num-col">${act.declaradoPart}</td>
              <td class="num-col">+${act.planificadoPart}</td>
              <td class="num-col">${fmtEUR(act.concedidoEur)}</td>
              <td class="num-col">${fmtEUR(act.declaradoEur)}</td>
              <td class="num-col">
                <span class="badge ${act.declaradoPct > 100 ? "badge-warning" : act.declaradoPct > 0 ? "badge-primary" : ""}">
                  ${fmtPct(act.declaradoPct)}
                </span>
              </td>
              <td class="num-col">${fmtEUR(act.planificadoEur)}</td>
              <td class="num-col">${fmtEUR(act.proyectadoEur)}</td>
              <td class="num-col">${renderSaldoBadge(saldoAct)}</td>
            </tr>
            <tr class="row-sub">
              <td>↳ Subvención de apoyo individual (${act.codigo})</td>
              <td class="num-col">—</td>
              <td class="num-col">${act.declaradoPart}</td>
              <td class="num-col">+${act.planificadoPart}</td>
              <td class="num-col">—</td>
              <td class="num-col">${fmtEUR(act.declaradoIndiv)}</td>
              <td class="num-col">—</td>
              <td class="num-col">${fmtEUR(act.planificadoIndiv)}</td>
              <td class="num-col">${fmtEUR(act.declaradoIndiv + (state.includePlanned ? act.planificadoIndiv : 0))}</td>
              <td class="num-col">—</td>
            </tr>
            <tr class="row-sub">
              <td>↳ Apoyo para viaje (${act.codigo})</td>
              <td class="num-col">—</td>
              <td class="num-col">${act.declaradoTravelPart}</td>
              <td class="num-col">+${act.planificadoPart}</td>
              <td class="num-col">—</td>
              <td class="num-col">${fmtEUR(act.declaradoTravel)}</td>
              <td class="num-col">—</td>
              <td class="num-col">${fmtEUR(act.planificadoTravel)}</td>
              <td class="num-col">${fmtEUR(act.declaradoTravel + (state.includePlanned ? act.planificadoTravel : 0))}</td>
              <td class="num-col">—</td>
            </tr>
          `;
        })
        .join("")}

      <!-- Apoyo Organizativo -->
      <tr class="row-category">
        <td>Mobility activity organisational support (Apoyo organizativo OS)</td>
        <td class="num-col">${m.os.concedidoPart}</td>
        <td class="num-col">${m.os.declaradoPart}</td>
        <td class="num-col">+${m.os.planificadoPart}</td>
        <td class="num-col">${fmtEUR(m.os.concedidoEur)}</td>
        <td class="num-col">${fmtEUR(m.os.declaradoEur)}</td>
        <td class="num-col">${fmtPct(m.os.declaradoPct)}</td>
        <td class="num-col">${fmtEUR(m.os.planificadoEur)}</td>
        <td class="num-col">${fmtEUR(m.os.proyectadoEur)}</td>
        <td class="num-col">${renderSaldoBadge(activeSaldoOS)}</td>
      </tr>
    `;

    // Hitos y Ficha Técnica del Convenio
    const milestonesCard = document.getElementById("milestones-card");
    const hitos = m.project.prefinanciacion ? m.project.prefinanciacion.hitos : [];
    milestonesCard.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">Calendario Oficial del Convenio (Ficha Técnica 4.2)</div>
          <h3 style="font-size: 1rem; margin-top: 0.15rem;">Informes y Pagos Periódicos</h3>
        </div>
        <span class="badge badge-primary">${m.project.fechaInicio} → ${m.project.fechaFin}</span>
      </div>
      ${
        hitos.length > 0
          ? `<div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Hito / Informe</th>
                    <th>Período</th>
                    <th class="num-col">Importe</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${hitos
                    .map(
                      (h) => `
                    <tr>
                      <td><strong>${h.concepto}</strong><div style="font-size:0.75rem;color:var(--text-muted);">${h.plazo}</div></td>
                      <td>${h.periodo}</td>
                      <td class="num-col">${h.importe > 0 ? fmtEUR(h.importe) : "Liquidación"}</td>
                      <td><span class="badge badge-primary">${h.estado}</span></td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
          : `<p style="font-size:0.85rem; color:var(--text-secondary);">Solicitud presentada el <strong>${m.project.fechaPresentacion}</strong>. Periodo previsto de ejecución: <strong>01/06/2026 al 31/07/2028 (26 meses)</strong>.</p>`
      }
    `;

    const grantDetailsCard = document.getElementById("grant-details-card");
    const org = state.data.organizacion;
    grantDetailsCard.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">Ficha Institucional del Beneficiario</div>
          <h3 style="font-size: 1rem; margin-top: 0.15rem;">Datos del Convenio SEPIE</h3>
        </div>
        <span class="badge badge-purple">OID: ${org.oid}</span>
      </div>
      <ul class="breakdown-list" style="margin-top: 0;">
        <li><span>Centro Beneficiario / NIF:</span> <strong>${org.nombreLegal} (${org.nif})</strong></li>
        <li><span>Carta Erasmus Educación Superior:</span> <strong>${org.eche}</strong></li>
        <li><span>Representante Legal:</span> <strong>${org.representanteLegal} (${org.cargoRepresentante})</strong></li>
        <li><span>Cuenta IBAN Pagos Erasmus+:</span> <strong><code>${org.iban}</code></strong></li>
        <li><span>Costes Excepcionales Viaje Elevado / Inclusión:</span> <strong>80% / 100% coste efectivo</strong></li>
        <li><span>Conservación de Documentos (Cláusula 20):</span> <strong>3 años tras pago final (Subvención ≤ 60.000 €)</strong></li>
      </ul>
    `;
  }

  /**
   * LÓGICA DE LA VISTA 2: PRECALCULADOR / SIMULADOR DE MOVILIDAD
   */
  function populateCalculatorSelects() {
    const countrySelect = document.getElementById("calc-country");
    const groups = state.data.tarifasSEPIE.gruposPaises;
    let html = "";
    Object.values(groups).forEach((g) => {
      html += `<optgroup label="${g.nombre}">`;
      g.paises.forEach((p) => {
        const selected = p === "Italia" ? "selected" : "";
        html += `<option value="${p}" data-group="${g.id}" ${selected}>${p} (Grupo ${g.id})</option>`;
      });
      html += `</optgroup>`;
    });
    countrySelect.innerHTML = html;

    const distSelect = document.getElementById("calc-distance");
    distSelect.innerHTML = state.data.tarifasSEPIE.bandasDistancia
      .map(
        (b) =>
          `<option value="${b.id}" ${b.id === "500-1999" ? "selected" : ""}>${b.label} (${b.estandar} € est. / ${b.ecologico} € eco.)</option>`
      )
      .join("");
  }

  function populateEditModalCountries() {
    const sel = document.getElementById("edit-mob-country");
    const groups = state.data.tarifasSEPIE.gruposPaises;
    let html = "";
    Object.values(groups).forEach((g) => {
      g.paises.forEach((p) => {
        html += `<option value="${p}" data-group="${g.id}">${p} (Grupo ${g.id})</option>`;
      });
    });
    sel.innerHTML = html;
  }

  function getCountryGroup(countryName) {
    const groups = state.data.tarifasSEPIE.gruposPaises;
    for (const g of Object.values(groups)) {
      if (g.paises.includes(countryName)) return g;
    }
    return groups[1];
  }

  function onCalcTypeChange() {
    const type = document.getElementById("calc-type").value;
    const isStaff = type === "STA" || type === "STT";
    document.getElementById("calc-staff-inputs").style.display = isStaff ? "grid" : "none";
    document.getElementById("calc-student-inputs").style.display = isStaff ? "none" : "block";

    const deptInput = document.getElementById("calc-dept");
    if (isStaff && deptInput.value.includes("FCT")) {
      deptInput.value = "Profesorado CFGS";
    } else if (!isStaff && deptInput.value.includes("Profesorado")) {
      deptInput.value = "FP Grado Superior - Prácticas FCT";
    }

    onCalcCountryChange();
  }

  function onCalcCountryChange() {
    const country = document.getElementById("calc-country").value;
    const grp = getCountryGroup(country);
    document.getElementById("calc-group-badge").value = grp.nombre;

    // Cargar las tarifas base recomendadas del grupo seleccionado
    document.getElementById("calc-staff-daily-rate").value = grp.personalDiarioBase;
    document.getElementById("calc-smp-monthly-rate").value =
      grp.estudianteMensualBase + grp.complementoPracticasSMP;

    updatePrecalculator();
  }

  function loadPresetIntoCalculator(presetName) {
    if (presetName === "STA_5D") {
      document.getElementById("calc-type").value = "STA";
      document.getElementById("calc-country").value = "Italia";
      document.getElementById("calc-city").value = "Roma";
      document.getElementById("calc-staff-days").value = 4;
      document.getElementById("calc-staff-travel-days").value = 0;
      onCalcTypeChange();
      document.getElementById("calc-staff-daily-rate").value = 162.5;
      document.getElementById("calc-distance").value = "500-1999";
      document.getElementById("calc-green-travel").checked = false;
      updatePrecalculator();
    } else if (presetName === "SMP_2M") {
      document.getElementById("calc-type").value = "SMP";
      document.getElementById("calc-country").value = "Italia";
      document.getElementById("calc-city").value = "Bolonia";
      document.getElementById("calc-smp-modality").value = "long";
      document.getElementById("calc-smp-days").value = 60;
      onCalcTypeChange();
      document.getElementById("calc-distance").value = "500-1999";
      document.getElementById("calc-green-travel").checked = false;
      updatePrecalculator();
    }
  }

  function updatePrecalculator() {
    const callId = document.getElementById("calc-call").value;
    const type = document.getElementById("calc-type").value;
    const status = document.getElementById("calc-status").value;
    const participant = document.getElementById("calc-participant").value || "Participante Simulado";
    const dept = document.getElementById("calc-dept").value || "CFGS";
    const country = document.getElementById("calc-country").value;
    const city = document.getElementById("calc-city").value || "UE";
    const grp = getCountryGroup(country);

    const distId = document.getElementById("calc-distance").value;
    const banda =
      state.data.tarifasSEPIE.bandasDistancia.find((b) => b.id === distId) ||
      state.data.tarifasSEPIE.bandasDistancia[0];
    const isGreen = document.getElementById("calc-green-travel").checked;
    const isFewerOpp = document.getElementById("calc-fewer-opp").checked;
    const exceptionalTravelCost = Number(document.getElementById("calc-exceptional-travel").value) || 0;

    let apoyoIndividual = 0;
    let duracionDias = 0;
    let diasViaje = 0;
    let detalleIndivTexto = "";

    if (type === "STA" || type === "STT") {
      const actDays = Math.max(1, Number(document.getElementById("calc-staff-days").value) || 0);
      diasViaje = Math.max(0, Number(document.getElementById("calc-staff-travel-days").value) || 0);
      const dailyRate = Math.max(0, Number(document.getElementById("calc-staff-daily-rate").value) || 0);
      const totalDaysComputed = actDays + diasViaje;
      duracionDias = actDays;

      const days1to14 = Math.min(14, totalDaysComputed);
      const days15Plus = Math.max(0, totalDaysComputed - 14);
      const rate15Plus = dailyRate * state.data.tarifasSEPIE.reglasFinanciacion.reduccionPersonalDesdeDia15;

      apoyoIndividual = days1to14 * dailyRate + days15Plus * rate15Plus;
      detalleIndivTexto =
        days15Plus > 0
          ? `${days1to14}d × ${fmtEUR(dailyRate)} + ${days15Plus}d × ${fmtEUR(rate15Plus)} (70%)`
          : `${totalDaysComputed} días (${actDays} act. + ${diasViaje} viaje) × ${fmtEUR(dailyRate)}/día`;

      document.getElementById("calc-rate-hint").textContent =
        `💡 Baremo Personal ${grp.nombre}: hasta 14 días al 100% (${fmtEUR(dailyRate)}/día) y del día 15 al 60 al 70% (${fmtEUR(rate15Plus)}/día).`;
    } else {
      // Estudiante SMP
      const modality = document.getElementById("calc-smp-modality").value;
      duracionDias = Math.max(1, Number(document.getElementById("calc-smp-days").value) || 60);
      const monthlyRate = Math.max(0, Number(document.getElementById("calc-smp-monthly-rate").value) || 550);

      if (modality === "short") {
        const d1to14 = Math.min(14, duracionDias);
        const d15to30 = Math.max(0, Math.min(30, duracionDias) - 14);
        const baseShort =
          d1to14 * grp.estudianteCortaDuracion1a14 + d15to30 * grp.estudianteCortaDuracion15a30;
        const topUpFewer = isFewerOpp ? (duracionDias <= 14 ? 100 : 150) : 0;
        apoyoIndividual = baseShort + topUpFewer;
        detalleIndivTexto = `Corta duración: ${d1to14}d×79€ + ${d15to30}d×56€ ${topUpFewer ? `+ ${topUpFewer}€ inclusión` : ""}`;
      } else {
        const monthsEq = duracionDias / 30;
        const effectiveMonthly = monthlyRate + (isFewerOpp ? grp.complementoMenoresOportunidadesMes : 0);
        apoyoIndividual = Math.round(monthsEq * effectiveMonthly * 100) / 100;
        detalleIndivTexto = `${duracionDias} días (${monthsEq.toFixed(2)} meses) × ${fmtEUR(effectiveMonthly)}/mes`;
      }

      document.getElementById("calc-rate-hint").textContent =
        `💡 Baremo Estudiantes SMP (${grp.nombre}): Base ${grp.estudianteMensualBase} €/mes + ${grp.complementoPracticasSMP} €/mes prácticas ${isFewerOpp ? `+ ${grp.complementoMenoresOportunidadesMes} €/mes menores oportunidades` : ""}.`;
    }

    // Cálculo de Viaje
    let apoyoViaje = isGreen ? banda.ecologico : banda.estandar;
    let detalleViajeTexto = `${banda.label} (${isGreen ? "Viaje Ecológico" : "Estándar"})`;
    if (exceptionalTravelCost > 0) {
      apoyoViaje = Math.round(exceptionalTravelCost * 0.8 * 100) / 100;
      detalleViajeTexto = `80% de Coste Excepcional (${fmtEUR(exceptionalTravelCost)})`;
    }

    apoyoIndividual = Math.round(apoyoIndividual * 100) / 100;
    apoyoViaje = Math.round(apoyoViaje * 100) / 100;
    const totalSubvencion = Math.round((apoyoIndividual + apoyoViaje) * 100) / 100;

    state.lastCalcResult = {
      convocatoria: callId,
      tipo: type,
      estado: status,
      participante: participant,
      departamento: dept,
      pais: country,
      grupoPais: grp.id,
      ciudadDestino: city,
      duracionDias,
      diasViaje,
      bandaDistancia: distId,
      viajeEcologico: isGreen,
      menoresOportunidades: isFewerOpp,
      apoyoIndividual,
      apoyoViaje,
      totalSubvencion,
      notas: `Precalculada (${detalleIndivTexto} | ${detalleViajeTexto})`
    };

    // Renderizar resultado del precalculador
    document.getElementById("calc-res-total").textContent = fmtEUR(totalSubvencion);
    const list = document.getElementById("calc-res-breakdown");
    list.innerHTML = `
      <li>
        <span>Modalidad y Destino:</span>
        <strong>${type} — ${city}, ${country} (Grupo ${grp.id})</strong>
      </li>
      <li>
        <span>Apoyo Individual (${detalleIndivTexto}):</span>
        <strong>${fmtEUR(apoyoIndividual)}</strong>
      </li>
      <li>
        <span>Apoyo de Viaje (${detalleViajeTexto}):</span>
        <strong>${fmtEUR(apoyoViaje)}</strong>
      </li>
      <li style="background: var(--primary-soft); padding: 0.55rem 0.65rem; border-radius: 6px; font-weight: 700;">
        <span>Total Beca Movilidad Participante:</span>
        <strong style="color: var(--primary);">${fmtEUR(totalSubvencion)}</strong>
      </li>
      <li>
        <span>Apoyo Organizativo Generado al Centro (OS):</span>
        <strong>${fmtEUR(state.data.tarifasSEPIE.apoyoOrganizativoPorParticipante)}</strong>
      </li>
    `;

    // Impacto en el presupuesto de la convocatoria elegida
    document.getElementById("calc-impact-call-label").textContent = callId;
    const metrics = computeCallMetrics(callId);
    const actMetrics = metrics.byType[type];
    const saldoAntesDeclarado = metrics.movilidad.saldoDeclarado;
    const saldoDespuesDeclarado = saldoAntesDeclarado - totalSubvencion;
    const saldoAntesProyectado = metrics.movilidad.saldoProyectado;
    const saldoDespuesProyectado = saldoAntesProyectado - totalSubvencion;

    const impactDiv = document.getElementById("calc-impact-details");
    impactDiv.innerHTML = `
      <ul class="breakdown-list" style="margin: 0;">
        <li>
          <span>Saldo Movilidad Libre (sobre Declarado actual):</span>
          <strong>${fmtEUR(saldoAntesDeclarado)} → <span style="color: ${saldoDespuesDeclarado >= 0 ? "var(--success)" : "var(--danger)"};">${fmtEUR(saldoDespuesDeclarado)}</span></strong>
        </li>
        <li>
          <span>Saldo Movilidad Libre (incluyendo ya Planificadas):</span>
          <strong>${fmtEUR(saldoAntesProyectado)} → <span style="color: ${saldoDespuesProyectado >= 0 ? "var(--success)" : "var(--danger)"};">${fmtEUR(saldoDespuesProyectado)}</span></strong>
        </li>
        <li>
          <span>Partida específica <strong>${type}</strong> (Concedido: ${fmtEUR(actMetrics.concedidoEur)}):</span>
          <strong>Usado: ${fmtEUR(actMetrics.declaradoEur)} (+${fmtEUR(totalSubvencion)})</strong>
        </li>
      </ul>
      ${
        saldoDespuesDeclarado < 0
          ? `<div class="alert-box alert-danger">
              ⚠️ Esta movilidad (${fmtEUR(totalSubvencion)}) supera el saldo total disponible en movilidad respecto a lo declarado (${fmtEUR(saldoAntesDeclarado)}) por <strong>${fmtEUR(Math.abs(saldoDespuesDeclarado))}</strong>. El centro debería cubrir el exceso con fondos propios o ajustar los días/tarifa.
            </div>`
          : `<div class="alert-box alert-success">
              ✅ <strong>Viable financieramente:</strong> Tras asignar esta beca de <strong>${fmtEUR(totalSubvencion)}</strong>, todavía quedarían <strong>${fmtEUR(saldoDespuesDeclarado)}</strong> disponibles respecto al presupuesto declarado oficial de ${callId}.
            </div>`
      }
    `;
  }

  function addCalculatedMobilityToScenario() {
    if (!state.lastCalcResult) updatePrecalculator();
    const item = JSON.parse(JSON.stringify(state.lastCalcResult));
    const countCall = state.data.movilidades.filter((m) => m.convocatoria === item.convocatoria).length + 1;
    item.id = `SIM-${item.convocatoria}-${String(countCall).padStart(2, "0")}`;

    state.data.movilidades.push(item);
    state.activeCall = item.convocatoria;
    document.getElementById("filter-call").value = item.convocatoria;
    renderAll();
    switchView("mobilities");
  }

  /**
   * VISTA 3: EXPLORADOR Y FILTRO DE MOVILIDADES
   */
  function getFilteredMobilities() {
    const q = (document.getElementById("filter-search")?.value || "").trim().toLowerCase();
    const call = document.getElementById("filter-call")?.value || "ALL";
    const type = document.getElementById("filter-type")?.value || "ALL";
    const status = document.getElementById("filter-status")?.value || "ALL";
    const grp = document.getElementById("filter-group")?.value || "ALL";

    return state.data.movilidades.filter((m) => {
      if (call !== "ALL" && m.convocatoria !== call) return false;
      if (type !== "ALL" && m.tipo !== type) return false;
      if (status !== "ALL" && m.estado !== status) return false;
      if (grp !== "ALL" && String(m.grupoPais) !== grp) return false;
      if (q) {
        const haystack = `${m.id} ${m.participante} ${m.departamento} ${m.pais} ${m.ciudadDestino} ${m.notas}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  function clearFilters() {
    document.getElementById("filter-search").value = "";
    document.getElementById("filter-call").value = "ALL";
    document.getElementById("filter-type").value = "ALL";
    document.getElementById("filter-status").value = "ALL";
    document.getElementById("filter-group").value = "ALL";
    renderMobilitiesTable();
  }

  function renderMobilitiesTable() {
    const list = getFilteredMobilities();
    const tbody = document.getElementById("mobilities-tbody");
    const summaryBar = document.getElementById("filtered-summary-bar");

    const sumIndiv = list.reduce((a, b) => a + (Number(b.apoyoIndividual) || 0), 0);
    const sumTravel = list.reduce((a, b) => a + (Number(b.apoyoViaje) || 0), 0);
    const sumTotal = list.reduce((a, b) => a + (Number(b.totalSubvencion) || 0), 0);

    summaryBar.innerHTML = `
      <div>
        🔍 Mostrando <strong>${list.length}</strong> movilidades filtradas
        (Declaradas: <strong>${list.filter((m) => m.estado === "Declarada").length}</strong> |
         Planificadas/En curso: <strong>${list.filter((m) => m.estado !== "Declarada").length}</strong>)
      </div>
      <div style="display: flex; gap: 1.15rem; flex-wrap: wrap;">
        <span>Σ Apoyo Individual: <strong>${fmtEUR(sumIndiv)}</strong></span>
        <span>Σ Apoyo Viaje: <strong>${fmtEUR(sumTravel)}</strong></span>
        <span>Σ Subvención Total: <strong style="color: var(--primary); font-size: 0.95rem;">${fmtEUR(sumTotal)}</strong></span>
      </div>
    `;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No hay movilidades que coincidan con los filtros actuales.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list
      .map((m) => {
        const statusBadgeClass =
          m.estado === "Declarada"
            ? "badge-success"
            : m.estado === "En curso"
            ? "badge-warning"
            : "badge-primary";

        const typeBadgeClass =
          m.tipo === "SMP" ? "badge-purple" : m.tipo === "STA" ? "badge-primary" : "badge-warning";

        return `
          <tr>
            <td>
              <strong>${m.id}</strong>
              <div><span class="badge badge-primary">Conv. ${m.convocatoria}</span></div>
            </td>
            <td><span class="badge ${typeBadgeClass}">${m.tipo}</span></td>
            <td>
              <button
                type="button"
                class="badge ${statusBadgeClass}"
                style="border: 1px solid currentColor; cursor: pointer;"
                title="Clic para alternar estado (Declarada ↔ Planificada)"
                onclick="App.cycleMobilityStatus('${m.id}')"
              >
                ${m.estado} ↻
              </button>
            </td>
            <td>
              <strong>${m.participante}</strong>
              <div style="font-size: 0.76rem; color: var(--text-muted);">${m.departamento || ""}</div>
              ${m.notas ? `<div style="font-size: 0.73rem; color: var(--text-secondary); margin-top: 2px;">${m.notas}</div>` : ""}
            </td>
            <td>
              <strong>${m.ciudadDestino || "—"}, ${m.pais}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Grupo ${m.grupoPais}</div>
            </td>
            <td class="num-col">
              <strong>${m.duracionDias} días</strong>
              ${m.tipo === "SMP" ? `<div style="font-size:0.73rem;color:var(--text-muted);">(${(m.duracionDias / 30).toFixed(1)} meses)</div>` : ""}
            </td>
            <td>
              <span>${m.bandaDistancia} km</span>
              ${m.viajeEcologico ? `<div><span class="badge badge-success">🌿 Eco</span></div>` : ""}
            </td>
            <td class="num-col">${fmtEUR(m.apoyoIndividual)}</td>
            <td class="num-col">${fmtEUR(m.apoyoViaje)}</td>
            <td class="num-col"><strong>${fmtEUR(m.totalSubvencion)}</strong></td>
            <td class="no-print">
              <div style="display: flex; gap: 0.3rem;">
                <button type="button" class="btn btn-sm" title="Editar movilidad" onclick="App.openEditModal('${m.id}')">✏️</button>
                <button type="button" class="btn btn-sm" title="Duplicar movilidad" onclick="App.duplicateMobility('${m.id}')">📄</button>
                <button type="button" class="btn btn-sm" title="Eliminar movilidad" onclick="App.deleteMobility('${m.id}')">🗑️</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function cycleMobilityStatus(mobId) {
    const mob = state.data.movilidades.find((m) => m.id === mobId);
    if (!mob) return;
    if (mob.estado === "Planificada") mob.estado = "Declarada";
    else if (mob.estado === "Declarada") mob.estado = "En curso";
    else mob.estado = "Planificada";
    renderAll();
  }

  function duplicateMobility(mobId) {
    const orig = state.data.movilidades.find((m) => m.id === mobId);
    if (!orig) return;
    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = `${orig.id}-COPIA-${Math.floor(Math.random() * 90 + 10)}`;
    copy.participante = `${orig.participante} (Copia)`;
    copy.estado = "Planificada";
    state.data.movilidades.push(copy);
    renderAll();
  }

  function deleteMobility(mobId) {
    state.data.movilidades = state.data.movilidades.filter((m) => m.id !== mobId);
    renderAll();
  }

  function openEditModal(mobId) {
    const mob = state.data.movilidades.find((m) => m.id === mobId);
    if (!mob) return;
    document.getElementById("edit-mob-id").value = mob.id;
    document.getElementById("edit-mob-call").value = mob.convocatoria;
    document.getElementById("edit-mob-type").value = mob.tipo;
    document.getElementById("edit-mob-status").value = mob.estado;
    document.getElementById("edit-mob-participant").value = mob.participante;
    document.getElementById("edit-mob-dept").value = mob.departamento || "";
    document.getElementById("edit-mob-country").value = mob.pais;
    document.getElementById("edit-mob-city").value = mob.ciudadDestino || "";
    document.getElementById("edit-mob-days").value = mob.duracionDias;
    document.getElementById("edit-mob-indiv").value = mob.apoyoIndividual;
    document.getElementById("edit-mob-travel").value = mob.apoyoViaje;
    document.getElementById("edit-mob-total").value = mob.totalSubvencion;
    document.getElementById("edit-mob-notes").value = mob.notas || "";

    document.getElementById("edit-mobility-modal").classList.add("open");
  }

  function updateEditModalTotal() {
    const indiv = Number(document.getElementById("edit-mob-indiv").value) || 0;
    const travel = Number(document.getElementById("edit-mob-travel").value) || 0;
    document.getElementById("edit-mob-total").value = (indiv + travel).toFixed(2);
  }

  function closeEditModal() {
    document.getElementById("edit-mobility-modal").classList.remove("open");
  }

  function saveEditedMobility() {
    const id = document.getElementById("edit-mob-id").value;
    const mob = state.data.movilidades.find((m) => m.id === id);
    if (!mob) return;

    mob.convocatoria = document.getElementById("edit-mob-call").value;
    mob.tipo = document.getElementById("edit-mob-type").value;
    mob.estado = document.getElementById("edit-mob-status").value;
    mob.participante = document.getElementById("edit-mob-participant").value;
    mob.departamento = document.getElementById("edit-mob-dept").value;
    mob.pais = document.getElementById("edit-mob-country").value;
    mob.grupoPais = getCountryGroup(mob.pais).id;
    mob.ciudadDestino = document.getElementById("edit-mob-city").value;
    mob.duracionDias = Number(document.getElementById("edit-mob-days").value) || 1;
    mob.apoyoIndividual = Math.round((Number(document.getElementById("edit-mob-indiv").value) || 0) * 100) / 100;
    mob.apoyoViaje = Math.round((Number(document.getElementById("edit-mob-travel").value) || 0) * 100) / 100;
    mob.totalSubvencion = Math.round((mob.apoyoIndividual + mob.apoyoViaje) * 100) / 100;
    mob.notas = document.getElementById("edit-mob-notes").value;

    closeEditModal();
    renderAll();
  }

  function exportMobilitiesCSV() {
    const list = getFilteredMobilities();
    const headers = [
      "ID",
      "Convocatoria",
      "Tipo",
      "Estado",
      "Participante",
      "Departamento",
      "Pais",
      "GrupoPais",
      "Ciudad",
      "DuracionDias",
      "BandaDistancia",
      "ViajeEcologico",
      "ApoyoIndividualEUR",
      "ApoyoViajeEUR",
      "TotalSubvencionEUR",
      "Notas"
    ];
    const rows = list.map((m) => [
      m.id,
      m.convocatoria,
      m.tipo,
      m.estado,
      `"${(m.participante || "").replace(/"/g, '""')}"`,
      `"${(m.departamento || "").replace(/"/g, '""')}"`,
      m.pais,
      m.grupoPais,
      `"${(m.ciudadDestino || "").replace(/"/g, '""')}"`,
      m.duracionDias,
      m.bandaDistancia,
      m.viajeEcologico ? "SI" : "NO",
      m.apoyoIndividual.toFixed(2),
      m.apoyoViaje.toFixed(2),
      m.totalSubvencion.toFixed(2),
      `"${(m.notas || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movilidades-erasmus-${state.activeCall}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * VISTA 4: PLANIFICADOR 2026 Y EXPORTACIÓN DEL ARCHIVO ESTÁTICO
   */
  function update2026GrantSimulator() {
    const smpPlazas = Math.max(0, Number(document.getElementById("sim26-smp-plazas").value) || 0);
    const smpMedia = Math.max(0, Number(document.getElementById("sim26-smp-media").value) || 0);
    const staPlazas = Math.max(0, Number(document.getElementById("sim26-sta-plazas").value) || 0);
    const staMedia = Math.max(0, Number(document.getElementById("sim26-sta-media").value) || 0);
    const sttPlazas = Math.max(0, Number(document.getElementById("sim26-stt-plazas").value) || 0);
    const osRate = Math.max(0, Number(document.getElementById("sim26-os-rate").value) || 400);

    const smpEur = Math.round(smpPlazas * smpMedia * 100) / 100;
    const staEur = Math.round(staPlazas * staMedia * 100) / 100;
    const sttEur = Math.round(sttPlazas * staMedia * 100) / 100;
    const totalPart = smpPlazas + staPlazas + sttPlazas;
    const movEur = Math.round((smpEur + staEur + sttEur) * 100) / 100;
    const osEur = Math.round(totalPart * osRate * 100) / 100;
    const totalEur = Math.round((movEur + osEur) * 100) / 100;

    // Actualizar en memoria la convocatoria 2026
    const p26 = state.data.proyectos["2026"].resumenOficial;
    p26.porActividad.SMP.participantesConcedidos = smpPlazas;
    p26.porActividad.SMP.subvencionConcedida = smpEur;
    p26.porActividad.STA.participantesConcedidos = staPlazas;
    p26.porActividad.STA.subvencionConcedida = staEur;
    p26.porActividad.STT.participantesConcedidos = sttPlazas;
    p26.porActividad.STT.subvencionConcedida = sttEur;
    p26.movilidadTotal.participantesConcedidos = totalPart;
    p26.movilidadTotal.subvencionConcedida = movEur;
    p26.apoyoOrganizativo.participantesConcedidos = totalPart;
    p26.apoyoOrganizativo.subvencionConcedida = osEur;
    p26.totalProyecto.participantesConcedidos = totalPart;
    p26.totalProyecto.subvencionConcedida = totalEur;
    p26.transferenciaPermitidaEstudiantesAPersonal.concedidoEstudiantes = smpEur;
    p26.transferenciaPermitidaEstudiantesAPersonal.maximoTransferible10Pct = Math.round(smpEur * 0.1 * 100) / 100;

    renderDashboard(computeCallMetrics(state.activeCall));
    render2026Planner();
  }

  function generateStaticJSContent() {
    return (
      "/**\n" +
      " * ARCHIVO DE DATOS ESTÁTICO EDITABLE - PANEL DE CONTROL ERASMUS+ (KA131-HED)\n" +
      " * Centro: IES Camp de Morvedre (E10083960 | ECHE: E VALENCI39)\n" +
      " * Generado desde el Panel de Control Erasmus+\n" +
      " */\n\n" +
      "window.ERASMUS_DATA = " +
      JSON.stringify(state.data, null, 2) +
      ";\n"
    );
  }

  function render2026Planner() {
    const m25 = computeCallMetrics("2025");
    const m26 = computeCallMetrics("2026");

    const sim26Summary = document.getElementById("sim26-result-summary");
    if (sim26Summary) {
      sim26Summary.innerHTML = `
        <div class="alert-box alert-info" style="margin-top:0;">
          <strong>Presupuesto Total Simulado 2026: ${fmtEUR(m26.total.concedidoEur)} (${m26.total.concedidoPart} participantes)</strong>
          <div style="margin-top: 0.35rem; font-size: 0.82rem;">
            • Becas Movilidad: <strong>${fmtEUR(m26.movilidad.concedidoEur)}</strong> (SMP: ${fmtEUR(m26.byType.SMP.concedidoEur)} + STA: ${fmtEUR(m26.byType.STA.concedidoEur)} + STT: ${fmtEUR(m26.byType.STT.concedidoEur)})<br/>
            • Apoyo Organizativo (OS): <strong>${fmtEUR(m26.os.concedidoEur)}</strong> (${m26.os.concedidoPart} plazas × 400 €)<br/>
            • Incremento frente a Convocatoria 2025: <strong>+${fmtEUR(m26.total.concedidoEur - m25.total.concedidoEur)} (+${fmtPct(((m26.total.concedidoEur - m25.total.concedidoEur) / m25.total.concedidoEur) * 100)})</strong>
          </div>
        </div>
      `;
    }

    const previewArea = document.getElementById("static-data-preview");
    if (previewArea) {
      previewArea.value = generateStaticJSContent();
    }

    const compContainer = document.getElementById("comparison-2025-2026-container");
    if (compContainer) {
      compContainer.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Indicador / Partida</th>
              <th class="num-col">Convocatoria 2025 (Concedido)</th>
              <th class="num-col">Convocatoria 2025 (Declarado)</th>
              <th class="num-col">Convocatoria 2026 (Solicitado / Simulado)</th>
              <th class="num-col">Variación 2026 vs 2025</th>
            </tr>
          </thead>
          <tbody>
            <tr class="row-total">
              <td>Total Presupuesto del Proyecto</td>
              <td class="num-col">${fmtEUR(m25.total.concedidoEur)} (${m25.total.concedidoPart} part.)</td>
              <td class="num-col">${fmtEUR(m25.total.declaradoEur)} (${m25.total.declaradoPart} part.)</td>
              <td class="num-col">${fmtEUR(m26.total.concedidoEur)} (${m26.total.concedidoPart} part.)</td>
              <td class="num-col" style="color: var(--success);">+${fmtEUR(m26.total.concedidoEur - m25.total.concedidoEur)} (+${m26.total.concedidoPart - m25.total.concedidoPart} plazas)</td>
            </tr>
            <tr>
              <td><strong>SMP (HESMT01)</strong> — Movilidad de estudiantes para prácticas</td>
              <td class="num-col">${fmtEUR(m25.byType.SMP.concedidoEur)} (${m25.byType.SMP.concedidoPart} plazas)</td>
              <td class="num-col">${fmtEUR(m25.byType.SMP.declaradoEur)} (${m25.byType.SMP.declaradoPart} plazas)</td>
              <td class="num-col">${fmtEUR(m26.byType.SMP.concedidoEur)} (${m26.byType.SMP.concedidoPart} plazas)</td>
              <td class="num-col">+${fmtEUR(m26.byType.SMP.concedidoEur - m25.byType.SMP.concedidoEur)} (+${m26.byType.SMP.concedidoPart - m25.byType.SMP.concedidoPart} plazas)</td>
            </tr>
            <tr>
              <td><strong>STA (HESTA02)</strong> — Movilidad de personal para docencia</td>
              <td class="num-col">${fmtEUR(m25.byType.STA.concedidoEur)} (${m25.byType.STA.concedidoPart} plazas)</td>
              <td class="num-col">${fmtEUR(m25.byType.STA.declaradoEur)} (${m25.byType.STA.declaradoPart} plazas)</td>
              <td class="num-col">${fmtEUR(m26.byType.STA.concedidoEur)} (${m26.byType.STA.concedidoPart} plazas)</td>
              <td class="num-col">+${fmtEUR(m26.byType.STA.concedidoEur - m25.byType.STA.concedidoEur)} (+${m26.byType.STA.concedidoPart - m25.byType.STA.concedidoPart} plazas)</td>
            </tr>
            <tr>
              <td><strong>STT</strong> — Movilidad de personal para formación</td>
              <td class="num-col">${fmtEUR(m25.byType.STT.concedidoEur)} (${m25.byType.STT.concedidoPart} plazas)</td>
              <td class="num-col">${fmtEUR(m25.byType.STT.declaradoEur)} (${m25.byType.STT.declaradoPart} plazas)</td>
              <td class="num-col">${fmtEUR(m26.byType.STT.concedidoEur)} (${m26.byType.STT.concedidoPart} plazas)</td>
              <td class="num-col">${fmtEUR(m26.byType.STT.concedidoEur - m25.byType.STT.concedidoEur)} (${m26.byType.STT.concedidoPart - m25.byType.STT.concedidoPart} plazas)</td>
            </tr>
            <tr>
              <td><strong>OS</strong> — Apoyo Organizativo</td>
              <td class="num-col">${fmtEUR(m25.os.concedidoEur)}</td>
              <td class="num-col">${fmtEUR(m25.os.declaradoEur)}</td>
              <td class="num-col">${fmtEUR(m26.os.concedidoEur)}</td>
              <td class="num-col">+${fmtEUR(m26.os.concedidoEur - m25.os.concedidoEur)}</td>
            </tr>
          </tbody>
        </table>
      `;
    }
  }

  function downloadStaticDataJS() {
    const content = generateStaticJSContent();
    const blob = new Blob([content], { type: "application/javascript;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "erasmus-data.js";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyStaticDataToClipboard() {
    const content = generateStaticJSContent();
    navigator.clipboard.writeText(content).then(() => {
      alert("Código de app/data/erasmus-data.js copiado al portapapeles.");
    });
  }

  return {
    init,
    setCall,
    switchView,
    toggleIncludePlanned,
    toggleTheme,
    resetToStaticFile,
    onCalcTypeChange,
    onCalcCountryChange,
    loadPresetIntoCalculator,
    updatePrecalculator,
    addCalculatedMobilityToScenario,
    renderMobilitiesTable,
    clearFilters,
    cycleMobilityStatus,
    duplicateMobility,
    deleteMobility,
    openEditModal,
    updateEditModalTotal,
    closeEditModal,
    saveEditedMobility,
    exportMobilitiesCSV,
    update2026GrantSimulator,
    downloadStaticDataJS,
    copyStaticDataToClipboard
  };
})();

window.addEventListener("DOMContentLoaded", App.init);
