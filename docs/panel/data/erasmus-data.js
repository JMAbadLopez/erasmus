/**
 * ARCHIVO DE DATOS ESTÁTICO EDITABLE - PANEL DE CONTROL ERASMUS+ (KA131-HED)
 * Centro: IES Camp de Morvedre (E10083960 | ECHE: E VALENCI39)
 *
 * Puedes editar este archivo directamente en el repositorio para actualizar:
 * 1. Los importes concedidos o declarados de cada convocatoria (proyectos).
 * 2. El listado de movilidades reales y planificadas (movilidades).
 * 3. Las tarifas y baremos de cálculo SEPIE (tarifasSEPIE).
 */

window.ERASMUS_DATA = {
  ultimaActualizacion: "2026-10-27",

  organizacion: {
    oid: "E10083960",
    nombreLegal: "CAMP DE MORVEDRE",
    nombreComercial: "IES Camp de Morvedre",
    eche: "E VALENCI39",
    nif: "Q9655297A",
    direccion: "Avda. Fausto Caruana s/n, 46520 Puerto de Sagunto (Valencia)",
    region: "Comunidad Valenciana",
    pais: "España",
    web: "http://www.iescamp.es",
    epsUrl: "https://portal.edu.gva.es/iescamp/erasnus/",
    representanteLegal: "MARÍA AMPARO NAVARRO BAYO",
    cargoRepresentante: "DIRECTORA",
    emailContacto: "ma.navarrobayo@edu.gva.es",
    iban: "ES33 3159 0055 7425 4472 3725",
    agenciaNacional: "ES01 - Servicio Español para la Internacionalización de la Educación (SEPIE)"
  },

  /**
   * Tarifas de referencia SEPIE para Educación Superior (KA131-HED)
   */
  tarifasSEPIE: {
    apoyoOrganizativoPorParticipante: 400.0,

    // Bandas de distancia de viaje (Calculadora de distancias Comisión Europea)
    bandasDistancia: [
      { id: "0-9", label: "0 - 9 km (Sin ayuda de viaje)", minKm: 0, maxKm: 9, estandar: 0, ecologico: 0 },
      { id: "10-99", label: "10 - 99 km", minKm: 10, maxKm: 99, estandar: 28, ecologico: 56 },
      { id: "100-499", label: "100 - 499 km", minKm: 100, maxKm: 499, estandar: 211, ecologico: 285 },
      { id: "500-1999", label: "500 - 1.999 km", minKm: 500, maxKm: 1999, estandar: 309, ecologico: 417 },
      { id: "2000-2999", label: "2.000 - 2.999 km", minKm: 2000, maxKm: 2999, estandar: 395, ecologico: 535 },
      { id: "3000-3999", label: "3.000 - 3.999 km", minKm: 3000, maxKm: 3999, estandar: 580, ecologico: 785 },
      { id: "4000-7999", label: "4.000 - 7.999 km", minKm: 4000, maxKm: 7999, estandar: 1188, ecologico: 1188 },
      { id: "8000+", label: "8.000 km o más", minKm: 8000, maxKm: 99999, estandar: 1735, ecologico: 1735 }
    ],

    // Grupos de países según coste de vida (Educación Superior KA131)
    gruposPaises: {
      1: {
        id: 1,
        nombre: "Grupo 1 (Coste de vida alto)",
        personalDiarioBase: 190, // Rango SEPIE 160-190 €/día (configurable en simulador)
        estudianteMensualBase: 400, // Base estudios SEPIE + 150€ prácticas = 550 €/mes (configurable)
        complementoPracticasSMP: 150,
        complementoMenoresOportunidadesMes: 250,
        estudianteCortaDuracion1a14: 79,
        estudianteCortaDuracion15a30: 56,
        paises: [
          "Alemania", "Austria", "Bélgica", "Dinamarca", "Finlandia",
          "Francia", "Irlanda", "Islandia", "Italia", "Liechtenstein",
          "Luxemburgo", "Noruega", "Países Bajos", "Suecia"
        ]
      },
      2: {
        id: 2,
        nombre: "Grupo 2 (Coste de vida medio)",
        personalDiarioBase: 168, // Ajustable en simulador (ej. 140-180 €/día)
        estudianteMensualBase: 350, // + 150€ prácticas = 500 €/mes
        complementoPracticasSMP: 150,
        complementoMenoresOportunidadesMes: 250,
        estudianteCortaDuracion1a14: 79,
        estudianteCortaDuracion15a30: 56,
        paises: [
          "Chequia", "Chipre", "Eslovaquia", "Eslovenia", "España",
          "Estonia", "Grecia", "Letonia", "Malta", "Portugal"
        ]
      },
      3: {
        id: 3,
        nombre: "Grupo 3 (Coste de vida moderado)",
        personalDiarioBase: 148, // Ajustable en simulador (ej. 140-160 €/día)
        estudianteMensualBase: 300, // + 150€ prácticas = 450 €/mes
        complementoPracticasSMP: 150,
        complementoMenoresOportunidadesMes: 250,
        estudianteCortaDuracion1a14: 79,
        estudianteCortaDuracion15a30: 56,
        paises: [
          "Bulgaria", "Croacia", "Hungría", "Lituania", "Macedonia del Norte",
          "Polonia", "Rumanía", "Serbia", "Turquía"
        ]
      }
    },

    reglasFinanciacion: {
      reduccionPersonalDesdeDia15: 0.70, // 70% de la tarifa base a partir del día 15
      maxTransferenciaEstudiantesAPersonalPct: 0.10, // Máx 10% de SMP a STA/STT sin adenda
      maxTransferenciaPersonalAEstudiantesPct: 1.00, // Hasta 100% de STA/STT a SMP
      umbralPrefinanciacion2PagoPct: 0.70, // 70% de uso de la 1ª prefinanciación para cobrar el 100% del 2º pago
      coberturaViajeElevadoPct: 0.80, // 80% de costes reales
      coberturaInclusionPct: 1.00 // 100% de costes reales
    }
  },

  /**
   * CONVOCATORIAS / PROYECTOS
   */
  proyectos: {
    "2025": {
      id: "2025",
      codigo: "2025-1-ES01-KA131-HED-000337316",
      convocatoria: "Convocatoria 2025 (EAC/A08/2024)",
      accion: "KA131-HED",
      estado: "En ejecución",
      fechaInicio: "2025-06-01",
      fechaFin: "2027-07-31",
      duracionMeses: 26,
      versionPresupuesto: "0003",
      fechaConvenio: "2025-08-11",
      fechaFirma: "2025-10-09",
      fechaInformePresupuesto: "2026-10-27 18:58:04",

      // Pagos de prefinanciación (Ficha técnica pág. 57-58)
      prefinanciacion: {
        cuota1Importe: 11732.00,
        cuota1Porcentaje: 80.0,
        cuota2Importe: 2933.00,
        cuota2Porcentaje: 20.0,
        umbral70Cuota1: 8212.40, // 70% de 11.732,00 €
        hitos: [
          {
            id: "pref-1",
            concepto: "1er Pago de Prefinanciación (80%)",
            periodo: "Inicio del convenio (Oct 2025)",
            plazo: "30 días desde firma",
            importe: 11732.00,
            estado: "Cobrado"
          },
          {
            id: "inf-periodico",
            concepto: "Informe Periódico + 2º Pago Prefinanciación (20%)",
            periodo: "01/06/2025 - 30/09/2026",
            plazo: "30 días tras fin periodo (Pago en 60 días)",
            importe: 2933.00,
            estado: "En tramitación (Requiere 70% de 1ª cuota)"
          },
          {
            id: "inf-final",
            concepto: "Informe Final y Liquidación de Saldo",
            periodo: "01/06/2025 - 31/07/2027",
            plazo: "60 días tras 31/07/2027",
            importe: 0.00,
            estado: "Pendiente (2027)"
          }
        ]
      },

      // Datos exactos del PDF oficial de Presupuesto (Beneficiary Module)
      resumenOficial: {
        totalProyecto: {
          participantesConcedidos: 10,
          participantesDeclarados: 5,
          subvencionConcedida: 14665.00,
          subvencionDeclarada: 8147.00,
          porcentajeDeclarado: 55.55
        },
        movilidadTotal: {
          participantesConcedidos: 10,
          participantesDeclarados: 5,
          subvencionConcedida: 10665.00,
          subvencionDeclarada: 6147.00,
          porcentajeDeclarado: 57.64,
          apoyoIndividualDeclarado: 5048.00,
          apoyoIndividualParticipantes: 5,
          apoyoViajeDeclarado: 1099.00,
          apoyoViajeParticipantes: 3
        },
        porActividad: {
          STA: {
            codigo: "STA",
            nombre: "Movilidad de personal para docencia",
            participantesConcedidos: 2,
            participantesDeclarados: 0,
            subvencionConcedida: 1918.00,
            subvencionDeclarada: 0.00,
            apoyoIndividualDeclarado: 0.00,
            apoyoViajeDeclarado: 0.00,
            porcentajeDeclarado: 0.0
          },
          SMP: {
            codigo: "SMP",
            nombre: "Movilidad de estudiantes para prácticas",
            participantesConcedidos: 2,
            participantesDeclarados: 2,
            subvencionConcedida: 2993.00,
            subvencionDeclarada: 3470.00,
            apoyoIndividualDeclarado: 2680.00,
            apoyoViajeDeclarado: 790.00,
            porcentajeDeclarado: 115.94
          },
          STT: {
            codigo: "STT",
            nombre: "Movilidad de personal para formación",
            participantesConcedidos: 6,
            participantesDeclarados: 3,
            subvencionConcedida: 5754.00,
            subvencionDeclarada: 2677.00,
            apoyoIndividualDeclarado: 2368.00,
            apoyoViajeDeclarado: 309.00,
            porcentajeDeclarado: 46.52
          }
        },
        apoyoOrganizativo: {
          participantesConcedidos: 10,
          participantesDeclarados: 5,
          subvencionConcedida: 4000.00,
          subvencionDeclarada: 2000.00,
          porcentajeDeclarado: 50.0
        },
        transferenciaPermitidaEstudiantesAPersonal: {
          concedidoEstudiantes: 2993.00,
          maximoTransferible10Pct: 299.30
        }
      }
    },

    "2026": {
      id: "2026",
      codigo: "KA131-HED-06A0A73F (Solicitud ID: 1763910)",
      convocatoria: "Convocatoria 2026 (Call 2026)",
      accion: "KA131-HED",
      estado: "Solicitado (Pendiente resolución)",
      fechaPresentacion: "2026-02-18 10:45:17",
      fechaInicio: "2026-06-01",
      fechaFin: "2028-07-31",
      duracionMeses: 26,
      bipSolicitados: 0,
      porcentajeMovilidadInternacional: 0,

      // En 2026 tenemos las plazas solicitadas en el formulario oficial (pág. 5 del PDF Call 2026)
      // Los importes concedidos se estiman inicialmente con las medias oficiales SEPIE y son 100% simulables
      resumenOficial: {
        totalProyecto: {
          participantesConcedidos: 14,
          participantesDeclarados: 0,
          subvencionConcedida: 21176.00, // Estimado inicial: 4 SMP (5.986€) + 10 STA (9.590€) + 14 OS (5.600€)
          subvencionDeclarada: 0.00,
          porcentajeDeclarado: 0.0
        },
        movilidadTotal: {
          participantesConcedidos: 14,
          participantesDeclarados: 0,
          subvencionConcedida: 15576.00,
          subvencionDeclarada: 0.00,
          porcentajeDeclarado: 0.0,
          apoyoIndividualDeclarado: 0.00,
          apoyoIndividualParticipantes: 0,
          apoyoViajeDeclarado: 0.00,
          apoyoViajeParticipantes: 0
        },
        porActividad: {
          STA: {
            codigo: "STA",
            idFormulario: "HESTA02",
            nombre: "Movilidad de personal para docencia (HESTA02)",
            participantesConcedidos: 10,
            participantesDeclarados: 0,
            subvencionConcedida: 9590.00, // 10 x 959,00 € (media SEPIE)
            subvencionDeclarada: 0.00,
            apoyoIndividualDeclarado: 0.00,
            apoyoViajeDeclarado: 0.00,
            porcentajeDeclarado: 0.0
          },
          SMP: {
            codigo: "SMP",
            idFormulario: "HESMT01",
            nombre: "Movilidad de estudiantes para prácticas (HESMT01)",
            participantesConcedidos: 4,
            participantesDeclarados: 0,
            subvencionConcedida: 5986.00, // 4 x 1.496,50 € (media SEPIE)
            subvencionDeclarada: 0.00,
            apoyoIndividualDeclarado: 0.00,
            apoyoViajeDeclarado: 0.00,
            porcentajeDeclarado: 0.0
          },
          STT: {
            codigo: "STT",
            idFormulario: "HESTT",
            nombre: "Movilidad de personal para formación",
            participantesConcedidos: 0,
            participantesDeclarados: 0,
            subvencionConcedida: 0.00,
            subvencionDeclarada: 0.00,
            apoyoIndividualDeclarado: 0.00,
            apoyoViajeDeclarado: 0.00,
            porcentajeDeclarado: 0.0
          }
        },
        apoyoOrganizativo: {
          participantesConcedidos: 14,
          participantesDeclarados: 0,
          subvencionConcedida: 5600.00, // 14 x 400 €
          subvencionDeclarada: 0.00,
          porcentajeDeclarado: 0.0
        },
        transferenciaPermitidaEstudiantesAPersonal: {
          concedidoEstudiantes: 5986.00,
          maximoTransferible10Pct: 598.60
        }
      }
    }
  },

  /**
   * LISTADO DE MOVILIDADES (DECLARADAS Y PLANIFICADAS)
   * Nota: Las 5 movilidades con estado "Declarada" en 2025 suman exactamente:
   * - SMP (2 part.): 2.680,00 € apoyo individual + 790,00 € viaje = 3.470,00 €
   * - STT (3 part.): 2.368,00 € apoyo individual + 309,00 € viaje = 2.677,00 €
   * - Total Movilidad Declarada 2025 = 6.147,00 € (5.048,00 € individual + 1.099,00 € viaje)
   */
  movilidades: [
    // --- CONVOCATORIA 2025: 5 MOVILIDADES DECLARADAS EN BENEFICIARY MODULE ---
    {
      id: "MOV-2025-01",
      convocatoria: "2025",
      tipo: "SMP",
      estado: "Declarada",
      participante: "Estudiante Prácticas SMP #1 (CFGS)",
      departamento: "FP Grado Superior - Prácticas FCT",
      pais: "Italia",
      grupoPais: 1,
      ciudadDestino: "Bolonia",
      duracionDias: 73, // ~2,4 meses
      diasViaje: 0,
      bandaDistancia: "2000-2999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 1340.00,
      apoyoViaje: 395.00,
      totalSubvencion: 1735.00,
      notas: "Movilidad SMP declarada en Beneficiary Module"
    },
    {
      id: "MOV-2025-02",
      convocatoria: "2025",
      tipo: "SMP",
      estado: "Declarada",
      participante: "Estudiante Prácticas SMP #2 (CFGS)",
      departamento: "FP Grado Superior - Prácticas FCT",
      pais: "Alemania",
      grupoPais: 1,
      ciudadDestino: "Berlín",
      duracionDias: 73,
      diasViaje: 0,
      bandaDistancia: "2000-2999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 1340.00,
      apoyoViaje: 395.00,
      totalSubvencion: 1735.00,
      notas: "Movilidad SMP declarada en Beneficiary Module (Total SMP = 3.470,00 €)"
    },
    {
      id: "MOV-2025-03",
      convocatoria: "2025",
      tipo: "STT",
      estado: "Declarada",
      participante: "Docente Formación STT #1",
      departamento: "Profesorado CFGS",
      pais: "Italia",
      grupoPais: 1,
      ciudadDestino: "Milán",
      duracionDias: 5,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 800.00,
      apoyoViaje: 309.00,
      totalSubvencion: 1109.00,
      notas: "Movilidad STT declarada con apoyo individual y apoyo de viaje (309 €)"
    },
    {
      id: "MOV-2025-04",
      convocatoria: "2025",
      tipo: "STT",
      estado: "Declarada",
      participante: "Docente Formación STT #2",
      departamento: "Profesorado CFGS",
      pais: "Francia",
      grupoPais: 1,
      ciudadDestino: "Lyon",
      duracionDias: 5,
      diasViaje: 0,
      bandaDistancia: "0-9",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 784.00,
      apoyoViaje: 0.00,
      totalSubvencion: 784.00,
      notas: "Movilidad STT declarada en Beneficiary Module (Apoyo individual registrado)"
    },
    {
      id: "MOV-2025-05",
      convocatoria: "2025",
      tipo: "STT",
      estado: "Declarada",
      participante: "Docente Formación STT #3",
      departamento: "Profesorado CFGS",
      pais: "Portugal",
      grupoPais: 2,
      ciudadDestino: "Oporto",
      duracionDias: 5,
      diasViaje: 0,
      bandaDistancia: "0-9",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 784.00,
      apoyoViaje: 0.00,
      totalSubvencion: 784.00,
      notas: "Movilidad STT declarada en Beneficiary Module (Suma STT = 2.677,00 €)"
    },

    // --- CONVOCATORIA 2025: 5 PLAZAS PENDIENTES / PLANIFICADAS PARA EJECUTAR EL SALDO RESTANTE (4.518,00 €) ---
    {
      id: "MOV-2025-06",
      convocatoria: "2025",
      tipo: "STA",
      estado: "Planificada",
      participante: "Docente Docencia STA #1 (Plaza pendiente)",
      departamento: "Profesorado CFGS",
      pais: "Italia",
      grupoPais: 1,
      ciudadDestino: "Roma",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Plaza STA concedida pendiente de ejecución (Media presupuestada: 959 €)"
    },
    {
      id: "MOV-2025-07",
      convocatoria: "2025",
      tipo: "STA",
      estado: "Planificada",
      participante: "Docente Docencia STA #2 (Plaza pendiente)",
      departamento: "Profesorado CFGS",
      pais: "Portugal",
      grupoPais: 2,
      ciudadDestino: "Lisboa",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Plaza STA concedida pendiente de ejecución (Media presupuestada: 959 €)"
    },
    {
      id: "MOV-2025-08",
      convocatoria: "2025",
      tipo: "STT",
      estado: "Planificada",
      participante: "Docente Formación STT #4 (Plaza pendiente)",
      departamento: "Profesorado CFGS",
      pais: "Países Bajos",
      grupoPais: 1,
      ciudadDestino: "Ámsterdam",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 558.00,
      apoyoViaje: 309.00,
      totalSubvencion: 867.00,
      notas: "Plaza STT pendiente ajustada al saldo disponible tras trasvase a SMP"
    },
    {
      id: "MOV-2025-09",
      convocatoria: "2025",
      tipo: "STT",
      estado: "Planificada",
      participante: "Docente Formación STT #5 (Plaza pendiente)",
      departamento: "Profesorado CFGS",
      pais: "Alemania",
      grupoPais: 1,
      ciudadDestino: "Múnich",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 558.00,
      apoyoViaje: 309.00,
      totalSubvencion: 867.00,
      notas: "Plaza STT pendiente ajustada al saldo disponible"
    },
    {
      id: "MOV-2025-10",
      convocatoria: "2025",
      tipo: "STT",
      estado: "Planificada",
      participante: "Docente Formación STT #6 (Plaza pendiente)",
      departamento: "Profesorado CFGS",
      pais: "Irlanda",
      grupoPais: 1,
      ciudadDestino: "Dublín",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 557.00,
      apoyoViaje: 309.00,
      totalSubvencion: 866.00,
      notas: "Plaza STT pendiente ajustada para cuadrar el 100% del saldo (4.518 €)"
    },

    // --- CONVOCATORIA 2026: PREVISIÓN INICIAL DE LAS 14 PLAZAS SOLICITADAS (4 SMP + 10 STA) ---
    {
      id: "MOV-2026-01",
      convocatoria: "2026",
      tipo: "SMP",
      estado: "Planificada",
      participante: "Plaza Solicitada SMP #1 (HESMT01)",
      departamento: "CFGS - FCT / Prácticas",
      pais: "Italia",
      grupoPais: 1,
      ciudadDestino: "Por definir",
      duracionDias: 65,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 1187.50,
      apoyoViaje: 309.00,
      totalSubvencion: 1496.50,
      notas: "Solicitud Call 2026 - Estudiante en prácticas (1 de 4)"
    },
    {
      id: "MOV-2026-02",
      convocatoria: "2026",
      tipo: "SMP",
      estado: "Planificada",
      participante: "Plaza Solicitada SMP #2 (HESMT01)",
      departamento: "CFGS - FCT / Prácticas",
      pais: "Alemania",
      grupoPais: 1,
      ciudadDestino: "Por definir",
      duracionDias: 65,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 1187.50,
      apoyoViaje: 309.00,
      totalSubvencion: 1496.50,
      notas: "Solicitud Call 2026 - Estudiante en prácticas (2 de 4)"
    },
    {
      id: "MOV-2026-03",
      convocatoria: "2026",
      tipo: "SMP",
      estado: "Planificada",
      participante: "Plaza Solicitada SMP #3 (HESMT01)",
      departamento: "CFGS - FCT / Prácticas",
      pais: "Francia",
      grupoPais: 1,
      ciudadDestino: "Por definir",
      duracionDias: 65,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 1187.50,
      apoyoViaje: 309.00,
      totalSubvencion: 1496.50,
      notas: "Solicitud Call 2026 - Estudiante en prácticas (3 de 4)"
    },
    {
      id: "MOV-2026-04",
      convocatoria: "2026",
      tipo: "SMP",
      estado: "Planificada",
      participante: "Plaza Solicitada SMP #4 (HESMT01)",
      departamento: "CFGS - FCT / Prácticas",
      pais: "Portugal",
      grupoPais: 2,
      ciudadDestino: "Por definir",
      duracionDias: 68,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 1187.50,
      apoyoViaje: 309.00,
      totalSubvencion: 1496.50,
      notas: "Solicitud Call 2026 - Estudiante en prácticas (4 de 4)"
    },
    {
      id: "MOV-2026-05",
      convocatoria: "2026",
      tipo: "STA",
      estado: "Planificada",
      participante: "Plaza Solicitada STA #1 (HESTA02)",
      departamento: "Profesorado CFGS",
      pais: "Italia",
      grupoPais: 1,
      ciudadDestino: "Por definir",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Solicitud Call 2026 - Personal docencia (1 de 10)"
    },
    {
      id: "MOV-2026-06",
      convocatoria: "2026",
      tipo: "STA",
      estado: "Planificada",
      participante: "Plaza Solicitada STA #2 (HESTA02)",
      departamento: "Profesorado CFGS",
      pais: "Alemania",
      grupoPais: 1,
      ciudadDestino: "Por definir",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Solicitud Call 2026 - Personal docencia (2 de 10)"
    },
    {
      id: "MOV-2026-07",
      convocatoria: "2026",
      tipo: "STA",
      estado: "Planificada",
      participante: "Plaza Solicitada STA #3 (HESTA02)",
      departamento: "Profesorado CFGS",
      pais: "Francia",
      grupoPais: 1,
      ciudadDestino: "Por definir",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Solicitud Call 2026 - Personal docencia (3 de 10)"
    },
    {
      id: "MOV-2026-08",
      convocatoria: "2026",
      tipo: "STA",
      estado: "Planificada",
      participante: "Plaza Solicitada STA #4 (HESTA02)",
      departamento: "Profesorado CFGS",
      pais: "Países Bajos",
      grupoPais: 1,
      ciudadDestino: "Por definir",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Solicitud Call 2026 - Personal docencia (4 de 10)"
    },
    {
      id: "MOV-2026-09",
      convocatoria: "2026",
      tipo: "STA",
      estado: "Planificada",
      participante: "Plaza Solicitada STA #5 (HESTA02)",
      departamento: "Profesorado CFGS",
      pais: "Portugal",
      grupoPais: 2,
      ciudadDestino: "Por definir",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Solicitud Call 2026 - Personal docencia (5 de 10)"
    },
    {
      id: "MOV-2026-10",
      convocatoria: "2026",
      tipo: "STA",
      estado: "Planificada",
      participante: "Plaza Solicitada STA #6 (HESTA02)",
      departamento: "Profesorado CFGS",
      pais: "Irlanda",
      grupoPais: 1,
      ciudadDestino: "Por definir",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Solicitud Call 2026 - Personal docencia (6 de 10)"
    },
    {
      id: "MOV-2026-11",
      convocatoria: "2026",
      tipo: "STA",
      estado: "Planificada",
      participante: "Plaza Solicitada STA #7 (HESTA02)",
      departamento: "Profesorado CFGS",
      pais: "Finlandia",
      grupoPais: 1,
      ciudadDestino: "Por definir",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Solicitud Call 2026 - Personal docencia (7 de 10)"
    },
    {
      id: "MOV-2026-12",
      convocatoria: "2026",
      tipo: "STA",
      estado: "Planificada",
      participante: "Plaza Solicitada STA #8 (HESTA02)",
      departamento: "Profesorado CFGS",
      pais: "Polonia",
      grupoPais: 3,
      ciudadDestino: "Por definir",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Solicitud Call 2026 - Personal docencia (8 de 10)"
    },
    {
      id: "MOV-2026-13",
      convocatoria: "2026",
      tipo: "STA",
      estado: "Planificada",
      participante: "Plaza Solicitada STA #9 (HESTA02)",
      departamento: "Profesorado CFGS",
      pais: "Chequia",
      grupoPais: 2,
      ciudadDestino: "Por definir",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Solicitud Call 2026 - Personal docencia (9 de 10)"
    },
    {
      id: "MOV-2026-14",
      convocatoria: "2026",
      tipo: "STA",
      estado: "Planificada",
      participante: "Plaza Solicitada STA #10 (HESTA02)",
      departamento: "Profesorado CFGS",
      pais: "Grecia",
      grupoPais: 2,
      ciudadDestino: "Por definir",
      duracionDias: 4,
      diasViaje: 0,
      bandaDistancia: "500-1999",
      viajeEcologico: false,
      menoresOportunidades: false,
      apoyoIndividual: 650.00,
      apoyoViaje: 309.00,
      totalSubvencion: 959.00,
      notas: "Solicitud Call 2026 - Personal docencia (10 de 10)"
    }
  ]
};
