import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

const TABS_EQUIPO = [
  { id:"hardware",label:"Hardware",icon:"💻",color:"#3b82f6",fields:[
    {key:"alias",label:"Nombre / Descripción",type:"text"},
    {key:"tipoEquipo",label:"Tipo",type:"select",options:["PC","LAPTOP","IMPRESORA","SERVIDOR","SWITCH","NO-BREAK","MONITOR","SCANNER","OTRO"]},
    {key:"marca",label:"Marca",type:"text"},{key:"modelo",label:"Modelo",type:"text"},
    {key:"noSerie",label:"No. Serie",type:"text"},{key:"noInventario",label:"No. Inventario",type:"text"},
    {key:"anioAdq",label:"Año",type:"number"},{key:"procedencia",label:"Procedencia",type:"text"},
    {key:"tipoProcesador",label:"Procesador",type:"text"},{key:"velocidadProc",label:"GHz",type:"text"},
    {key:"discoDuro",label:"Disco (GB)",type:"number"},{key:"ram",label:"RAM (GB)",type:"number"},
    {key:"garantia",label:"Garantía",type:"select",options:["SI","NO"]},
    {key:"vigenciaGarantia",label:"Vigencia (meses)",type:"number"},{key:"centroCostos",label:"Centro Costos",type:"text"},
  ]},
  { id:"red",label:"Red",icon:"🌐",color:"#8b5cf6",fields:[
    {key:"nombreUsuario",label:"Usuario",type:"text"},{key:"hostname",label:"Hostname",type:"text"},
    {key:"redLAN",label:"LAN",type:"select",options:["SI","NO"]},{key:"ip",label:"IP",type:"text"},
    {key:"mac",label:"MAC",type:"text"},{key:"mascara",label:"Máscara",type:"text"},
    {key:"estaticaDinamica",label:"Est/Din",type:"select",options:["ESTATICA","DINAMICA"]},
    {key:"onDomain",label:"Dominio",type:"select",options:["SI","NO"]},
    {key:"internet",label:"Internet",type:"select",options:["NORMAL","EXTENDIDO","SIN ACCESO"]},
  ]},
  { id:"resguardo",label:"Resguardo",icon:"👤",color:"#10b981",fields:[
    {key:"nombres",label:"Nombre(s)",type:"text"},{key:"apPaterno",label:"Ap. Paterno",type:"text"},
    {key:"apMaterno",label:"Ap. Materno",type:"text"},{key:"correo",label:"Correo",type:"text"},
    {key:"matricula",label:"Matrícula",type:"text"},{key:"puesto",label:"Puesto",type:"text"},
    {key:"claveOrg",label:"CLAVE Org.",type:"text"},{key:"nombreAdscripcion",label:"Adscripción",type:"text"},
    {key:"claveAdscripcion",label:"CLAVE Adscripción",type:"text"},
    {key:"tipoContratacion",label:"Contratación",type:"select",options:["BASE","CONFIANZA A","CONFIANZA B","EVENTUAL","HONORARIOS"]},
  ]},
  { id:"ubicacion",label:"Ubicación",icon:"📍",color:"#f59e0b",fields:[
    {key:"no",label:"No.",type:"number",readonly:true},{key:"entidad",label:"Entidad",type:"text"},
    {key:"unidad",label:"Unidad",type:"text"},{key:"subTipo",label:"Sub Tipo",type:"text"},
    {key:"catalogada",label:"Catalogada",type:"text"},{key:"nombreUnidad",label:"Nombre Unidad",type:"text"},
    {key:"calle",label:"Calle",type:"text"},{key:"numero",label:"Número",type:"text"},
    {key:"nivel",label:"Nivel",type:"text"},{key:"colonia",label:"Colonia",type:"text"},
    {key:"municipio",label:"Municipio",type:"text"},{key:"cp",label:"CP",type:"text"},
    {key:"idRed",label:"ID Red",type:"text"},
  ]},
  { id:"licencias",label:"Licencias",icon:"🪟",color:"#06b6d4",fields:[
    {key:"so",label:"S.O.",type:"select",options:["WINDOWS XP","WINDOWS 7","WINDOWS 8","WINDOWS 10","WINDOWS 11","LINUX","OTRO"]},
    {key:"servicePack",label:"SP",type:"text"},{key:"tipoSistema",label:"32/64",type:"select",options:["32","64"]},
    {key:"ofimatica",label:"Ofimática",type:"select",options:["OFFICE 2010","OFFICE 2013","OFFICE 2016","OFFICE 2019","OFFICE 365","OPEN OFFICE","NINGUNO"]},
    {key:"obsoleto",label:"Obsoleto",type:"select",options:["SI","NO"]},
  ]},
  { id:"apps",label:"Apps",icon:"📦",color:"#ec4899",fields:[
    {key:"app_nitroPdf",label:"NITRO PDF",type:"check"},{key:"app_adobeReader",label:"ADOBE READER",type:"check"},
    {key:"app_java",label:"JAVA",type:"check"},{key:"app_chrome",label:"CHROME",type:"check"},
    {key:"app_firefox",label:"FIREFOX",type:"check"},{key:"app_edge",label:"EDGE",type:"check"},
    {key:"app_office",label:"OFFICE",type:"check"},{key:"app_teams",label:"TEAMS",type:"check"},
    {key:"app_vnc",label:"VNC",type:"check"},{key:"app_forefront",label:"FOREFRONT",type:"check"},
    {key:"app_webex",label:"WEBEX",type:"check"},{key:"app_zoom",label:"ZOOM",type:"check"},
  ]},
  { id:"institucional",label:"Enterprise",icon:"🏢",color:"#f43f5e",fields:[
    {key:"sys_crm",label:"CRM",type:"check"},{key:"sys_directory",label:"Directory",type:"check"},
    {key:"sys_hrms",label:"HRMS",type:"check"},{key:"sys_helpdesk",label:"Helpdesk",type:"check"},
    {key:"sys_inventory",label:"Inventory",type:"check"},{key:"sys_dms",label:"DMS",type:"check"},
    {key:"sys_workflow",label:"Workflow",type:"check"},{key:"sys_database",label:"Database",type:"check"},
    {key:"sys_analytics",label:"Analytics",type:"check"},{key:"sys_reporting",label:"Reporting",type:"check"},
    {key:"sys_compliance",label:"Compliance",type:"check"},{key:"sys_procurement",label:"Procurement",type:"check"},
    {key:"sys_itsm",label:"ITSM",type:"check"},{key:"sys_fileserver",label:"FileServer",type:"check"},
  ]},
  { id:"notas",label:"Notas",icon:"📝",color:"#a3a3a3",fields:[
    {key:"notas",label:"Notas / Observaciones",type:"textarea"},
  ]},
  { id:"criteriosEq",    label:"Criterios",     icon:"🔐", color:"#f59e0b", fields:[] },
  { id:"mantenimientoEq",label:"Mantenimiento",  icon:"🔧", color:"#06b6d4", fields:[] },
];

// ── CRITERIOS DE REVISIÓN ────────────────────────────────────────────────────
const CRITERIOS_SECTIONS = [
  {
    id: "cuentas",
    label: "Cuentas y Contraseñas",
    icon: "🔐",
    color: "#f59e0b",
    items: [
      { key: "crit_contraseniaVisible",       code: "A-01", label: "Contraseña visible", desc: "Validar que no se encuentre escrita por ningún medio la contraseña entregada" },
      { key: "crit_responsableCuentaGenerica", code: "A-02", label: "Responsable cuenta genérica", desc: "Verificación del responsable de la cuenta genérica" },
      { key: "crit_actualizacionesSO",         code: "A-03", label: "Actualizaciones S.O.", desc: "Validación de equipo en dominio, o revisión de últimas actualizaciones del S.O." },
      { key: "crit_borradoSeguro",             code: "A-04", label: "Borrado seguro", desc: "Revisión de solicitudes de baja de cuenta y cédula de borrado seguro" },
      { key: "crit_equiposBloqueados",         code: "A-05", label: "Equipos bloqueados/apagados", desc: "Validar que los equipos sean bloqueados por los usuarios y apagados al terminar jornada" },
      { key: "crit_contraseniaEstandares",     code: "A-06", label: "Contraseña estándares", desc: "Validar que la contraseña cumpla los estándares de seguridad establecidos" },
    ]
  },
  {
    id: "correo",
    label: "Correo Electrónico e Internet",
    icon: "📧",
    color: "#3b82f6",
    items: [
      { key: "crit_correoElectronico",  code: "B-01", label: "Correo electrónico", desc: "Validar uso ético del correo corporativo (no asuntos personales)" },
      { key: "crit_respaldoCorreoPST",  code: "B-02", label: "Respaldo correo PST", desc: "Validar respaldos del buzón en equipo de cómputo (no en servidor)" },
      { key: "crit_noProxyHistorial",   code: "B-03", label: "No proxy / historial", desc: "No existencia de proxy y revisión del histórico de navegación" },
      { key: "crit_noP2P",             code: "B-04", label: "No programas P2P", desc: "No existencia de programas P2P instalados" },
      { key: "crit_modemsNoAutorizados",code: "B-05", label: "Modems no autorizados", desc: "No existan modems no autorizados instalados" },
      { key: "crit_carpetaDescargas",   code: "B-06", label: "Carpeta descargas", desc: "Validar carpeta Downloads sin software no autorizado" },
    ]
  },
  {
    id: "seguridad",
    label: "Criterios de Seguridad",
    icon: "🛡️",
    color: "#10b981",
    items: [
      { key: "crit_agenteSystemCenter",      code: "C-01", label: "Agente System Center", desc: "Instalación del agente SCEP actualizado" },
      { key: "crit_panelControlBloqueado",    code: "C-02", label: "Panel de control bloqueado", desc: "Panel de control bloqueado en el equipo" },
      { key: "crit_imagenInstitucional",      code: "C-03", label: "Imagen corporativa", desc: "Imagen corporativa y software pre-instalado válido" },
      { key: "crit_softwareNoInstitucional",  code: "C-04", label: "Software no autorizado", desc: "No exista software fuera de la imagen corporativa" },
      { key: "crit_escritorioLimpio",         code: "C-05", label: "Escritorio limpio", desc: "Escritorio limpio (físico y lógico), sin archivos personales" },
      { key: "crit_equipoEnDominio",          code: "C-06", label: "Equipo en dominio", desc: "Configuración en dominio y permisos de administración" },
      { key: "crit_agenteActualizaciones",    code: "C-07", label: "Agente + actualizaciones", desc: "Sesión de dominio, agente System Center y actualizaciones recientes" },
      { key: "crit_bloqueoAdmin",             code: "C-08", label: "Bloqueo permisos admin", desc: "No existencia de permisos de administración (evitar desactivar antivirus)" },
      { key: "crit_carpetasCompartidas",      code: "C-09", label: "Carpetas compartidas", desc: "No carpetas compartidas ni contenido personal (imágenes, música, docs)" },
      { key: "crit_licenciamientoVigente",    code: "C-10", label: "Licenciamiento vigente", desc: "Licenciamiento vigente en equipo de cómputo" },
    ]
  }
];
const ALL_CRITERIOS = CRITERIOS_SECTIONS.flatMap(s => s.items);
const CRIT_KEYS = ALL_CRITERIOS.map(c => c.key);

// ── MANTENIMIENTO PREVENTIVO ─────────────────────────────────────────────────
const MANT_CHECKLISTS = {
  PC: [
    {
      id: "exterior", label: "Limpieza Exterior", icon: "🧹", color: "#3b82f6",
      items: [
        { key: "mant_limpCarcasa",      label: "Limpieza de carcasa" },
        { key: "mant_limpPanel",        label: "Limpieza de panel frontal" },
        { key: "mant_limpTerminales",   label: "Limpieza de terminales posterior" },
      ]
    },
    {
      id: "interior", label: "Limpieza Interior", icon: "🔧", color: "#8b5cf6",
      items: [
        { key: "mant_extResiduo",    label: "Extracción de residuos" },
        { key: "mant_sopleteo",      label: "Sopleteo de interior" },
        { key: "mant_limpFuente",    label: "Limpieza de fuente" },
        { key: "mant_revConexiones", label: "Revisión de conexiones" },
        { key: "mant_revDisipador",  label: "Revisión de disipador de calor" },
      ]
    },
    {
      id: "fisica", label: "Revisión Física", icon: "🔍", color: "#f59e0b",
      items: [
        { key: "mant_revDanios",      label: "Revisión de daños en carcasa" },
        { key: "mant_fotoEvidencia",   label: "Fotografía para evidencia" },
        { key: "mant_revPerifericos",  label: "Revisión de periféricos" },
      ]
    },
  ],
  IMPRESORA: [
    {
      id: "exterior", label: "Limpieza Exterior", icon: "🧹", color: "#3b82f6",
      items: [
        { key: "mant_limpCarcasa",     label: "Limpieza de carcasa" },
        { key: "mant_limpPanel",       label: "Limpieza de panel de control" },
        { key: "mant_limpPuertaPapel", label: "Limpieza puerta de ingreso de papel" },
      ]
    },
    {
      id: "interior", label: "Limpieza Interior", icon: "🔧", color: "#8b5cf6",
      items: [
        { key: "mant_extResiduoTinta", label: "Extracción de residuos de tinta" },
        { key: "mant_sopleteo",        label: "Sopleteo de interior" },
        { key: "mant_limpCharola",     label: "Limpieza de charola de admisión" },
        { key: "mant_revFusor",        label: "Revisión de fusor" },
        { key: "mant_revSensores",     label: "Revisión de sensores" },
      ]
    },
    {
      id: "insumos", label: "Revisión de Insumos", icon: "📦", color: "#f59e0b",
      items: [
        { key: "mant_nivelToner",       label: "Revisión nivel de tóner" },
        { key: "mant_unidadImagen",     label: "Revisión unidad de imagen" },
        { key: "mant_kitMantenimiento", label: "Revisión kit de mantenimiento" },
      ]
    },
  ]
};
const ALL_MANT_KEYS = [...new Set(
  [...MANT_CHECKLISTS.PC, ...MANT_CHECKLISTS.IMPRESORA]
    .flatMap(s => s.items.map(i => i.key))
)];

// ── Helpers de impresión (compartidos) ───────────────────────────────────────
function generarHTMLCriterios(rev) {
  const fecha = new Date(rev.fecha).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  const fechaCorta = rev.fecha || "";
  const cumpleCount = CRIT_KEYS.filter(k => rev[k]).length;
  const totalCount = CRIT_KEYS.length;
  const pct = rev.calificacion || Math.round((cumpleCount / totalCount) * 100);

  const critRows = CRITERIOS_SECTIONS.map(sec => {
    const sectionHeader = `
      <tr>
        <td colspan="4" style="background:#006847; color:white; padding:4px 8px; font-weight:700; font-size:9px; border:1px solid #005c3a;">
          ${sec.label.toUpperCase()}
        </td>
      </tr>`;
    const rows = sec.items.map((item, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#f0f8f0' : '#ffffff'}">
        <td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px; font-weight:600; width:70px; text-align:center; color:#006847">${item.code}</td>
        <td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px; color:#333">${item.desc}</td>
        <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-weight:700; font-size:8px; background:${rev[item.key] ? '#e8f5e9' : '#fff'}; color:${rev[item.key] ? '#006847' : '#999'}">${rev[item.key] ? '✓' : ''}</td>
        <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-weight:700; font-size:8px; background:${!rev[item.key] ? '#fce4ec' : '#fff'}; color:${!rev[item.key] ? '#c62828' : '#999'}">${!rev[item.key] ? '✓' : ''}</td>
      </tr>`).join("");
    return sectionHeader + rows;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Revisión Criterios - Folio ${rev.folio}</title>
<style>
  @page { size: portrait; margin: 0.8cm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html,body { height: 100%; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #333; }

  .header-bar {
    display: flex; align-items: center; justify-content: space-between;
    border: 2px solid #006847; border-radius: 4px; padding: 10px 16px; margin-bottom: 12px;
  }
  .header-bar img { height: 40px; }
  .header-bar .title { text-align: center; flex: 1; }
  .header-bar .title h1 { font-size: 12px; color: #006847; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
  .header-bar .title p { font-size: 9px; color: #666; margin-top: 2px; }
  .header-bar .folio-box { text-align: right; }
  .header-bar .folio-box .folio { font-size: 14px; font-weight: 800; color: #006847; }
  .header-bar .folio-box .fecha { font-size: 9px; color: #666; }

  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  .info-table td { padding: 4px 8px; border: 1px solid #c8d6c8; font-size: 8px; }
  .info-table .label { background: #e8f0e8; font-weight: 700; color: #006847; width: 120px; text-transform: uppercase; font-size: 9px; }

  .criteria-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }

  .score-box {
    text-align: center; padding: 6px; margin: 6px 0;
    border: 2px solid ${pct >= 80 ? '#006847' : pct >= 50 ? '#f57f17' : '#c62828'};
    border-radius: 6px;
    background: ${pct >= 80 ? '#e8f5e9' : pct >= 50 ? '#fff8e1' : '#fce4ec'};
  }
  .score-box .label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
  .score-box .value { font-size: 20px; font-weight: 800; color: ${pct >= 80 ? '#006847' : pct >= 50 ? '#f57f17' : '#c62828'}; }
  .score-box .detail { font-size: 9px; color: #999; margin-top: 2px; }

  .obs-box { padding: 8px 12px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; font-size: 10px; margin-bottom: 8px; }
  .obs-box strong { color: #006847; }

  .firma-row { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 0; }
  .firma-col { width: 42%; text-align: center; }
  .firma-col .line { border-top: 1px solid #333; margin-bottom: 6px; }
  .firma-col .role { font-size: 8px; color: #999; text-transform: uppercase; margin-bottom: 2px; }
  .firma-col .name { font-size: 10px; font-weight: 600; }
  .firma-col .mat { font-size: 9px; color: #666; }

  .footer { text-align: center; font-size: 7px; color: #aaa; margin-top: 20px; border-top: 1px solid #eee; padding-top: 6px; }
</style></head><body>
<div style="max-height:100vh;overflow:hidden;">

<!-- Header con logo -->
<div class="header-bar">
  <img src="/logo.svg" alt="Enterprise" />
  <div class="title">
    <h1>Security Criteria Review</h1>
    <p>StockBase Inventory Management</p>
  </div>
  <div class="folio-box">
    <div class="folio">FOLIO: ${rev.folio}</div>
    <div class="fecha">${fecha}</div>
  </div>
</div>

<!-- Datos generales -->
<table class="info-table">
  <tr>
    <td class="label">Adscripción</td><td>Main Warehouse</td>
    <td class="label">Área de Servicio</td><td>${rev.area || '—'}</td>
    <td class="label">Fecha</td><td>${fechaCorta}</td>
  </tr>
  <tr>
    <td class="label">Nombre de Usuario</td><td colspan="2">${rev.usuario || '—'}</td>
    <td class="label">Cuenta de Dominio</td><td>${rev.cuenta || '—'}</td>
    <td class="label">IP Equipo</td><td>${rev.ip || '—'}</td>
  </tr>
  <tr>
    <td class="label">Marca</td><td>${rev.marca || '—'}</td>
    <td class="label">Modelo</td><td>${rev.modelo || '—'}</td>
    <td class="label">No. Serie</td><td>${rev.noSerie || '—'}</td>
  </tr>
  <tr>
    <td class="label">Evaluador</td><td colspan="5">${rev.evaluador || '—'}</td>
  </tr>
</table>

<!-- Tabla de criterios -->
<table class="criteria-table">
  <thead>
    <tr style="background:#006847; color:white;">
      <th style="padding:4px 8px; border:1px solid #005c3a; font-size:8px; text-align:center; width:70px">CRITERIO</th>
      <th style="padding:4px 8px; border:1px solid #005c3a; font-size:8px; text-align:left">ACTIVIDAD</th>
      <th style="padding:4px 6px; border:1px solid #005c3a; font-size:8px; text-align:center; width:30px">SI</th>
      <th style="padding:4px 6px; border:1px solid #005c3a; font-size:8px; text-align:center; width:30px">NO</th>
    </tr>
  </thead>
  <tbody>
    ${critRows}
  </tbody>
</table>

<!-- Calificación -->
<div class="score-box">
  <div class="label">Calificación</div>
  <div class="value">${pct}%</div>
  <div class="detail">${cumpleCount} de ${totalCount} criterios cumplidos</div>
</div>

${rev.observaciones ? `<div class="obs-box"><strong>Observaciones:</strong> ${rev.observaciones}</div>` : ''}
${rev.soporte ? `<div class="obs-box"><strong>Soporte proporcionado:</strong> ${rev.soporte}</div>` : ''}

<!-- Firmas -->
<div class="firma-row">
  <div class="firma-col">
    <div class="line"></div>
    <div class="role">Usuario del equipo</div>
    <div class="name">${rev.usuario || '—'}</div>
  </div>
  <div class="firma-col">
    <div class="line"></div>
    <div class="role">Evaluador</div>
    <div class="name">${rev.evaluador || '—'}</div>
  </div>
</div>

<div class="footer">Generado el ${fecha} — Sistema de Gestión StockBase — Headquarters</div>

</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

function generarHTMLMantenimiento(m) {
  const tipo = m.tipo || "PC";
  const checklist = MANT_CHECKLISTS[tipo] || MANT_CHECKLISTS.PC;
  const fecha = new Date(m.fecha).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  const fechaCorta = m.fecha || "";

  const allItems = checklist.flatMap(s => s.items);
  const done = allItems.filter(i => m[i.key]).length;
  const total = allItems.length;

  const checkRows = checklist.map(sec => {
    const header = `
      <tr>
        <td colspan="3" style="background:#006847; color:white; padding:4px 8px; font-weight:700; font-size:9px; border:1px solid #005c3a;">
          ${sec.label.toUpperCase()}
        </td>
      </tr>`;
    const rows = sec.items.map((item, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#f0f8f0' : '#ffffff'}">
        <td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px; color:#333">${item.label}</td>
        <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-weight:700; font-size:8px; background:${m[item.key] ? '#e8f5e9' : '#fff'}; color:${m[item.key] ? '#006847' : '#999'}">${m[item.key] ? '✓' : ''}</td>
        <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-weight:700; font-size:8px; background:${!m[item.key] ? '#fce4ec' : '#fff'}; color:${!m[item.key] ? '#c62828' : '#999'}">${!m[item.key] ? '✓' : ''}</td>
      </tr>`).join("");
    return header + rows;
  }).join("");

  const fotosHtml = (m.fotos || []).length > 0 ? `
    <div style="margin-top:10px; page-break-inside:avoid;">
      <div style="background:#006847; color:white; padding:6px 12px; font-weight:700; font-size:10px; border-radius:3px 3px 0 0;">EVIDENCIA FOTOGRÁFICA</div>
      <div style="border:1px solid #c8d6c8; border-top:none; padding:8px; display:flex; flex-wrap:wrap; gap:6px;">
        ${(m.fotos || []).map(f => f.tipo === "imagen"
          ? `<img src="${f.data}" style="max-width:180px; max-height:135px; border:1px solid #ddd; border-radius:3px; object-fit:cover;" />`
          : `<div style="padding:8px 12px; background:#f5f5f5; border:1px solid #ddd; border-radius:3px; font-size:9px; color:#666; max-width:180px;">📝 ${f.data}</div>`
        ).join("")}
      </div>
    </div>` : '';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Mantenimiento ${tipo} - Folio ${m.folio}</title>
<style>
  @page { size: landscape; margin: 1cm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html,body { height: 100%; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #333; }

  .header-bar {
    display: flex; align-items: center; justify-content: space-between;
    border: 2px solid #006847; border-radius: 4px; padding: 10px 16px; margin-bottom: 10px;
  }
  .header-bar img { height: 50px; }
  .header-bar .title { text-align: center; flex: 1; }
  .header-bar .title h1 { font-size: 14px; color: #006847; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
  .header-bar .title p { font-size: 9px; color: #666; margin-top: 2px; }
  .header-bar .folio-box { text-align: right; }
  .header-bar .folio-box .folio { font-size: 13px; font-weight: 800; color: #006847; }
  .header-bar .folio-box .fecha { font-size: 9px; color: #666; }

  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  .info-table td { padding: 4px 10px; border: 1px solid #c8d6c8; font-size: 10px; }
  .info-table .label { background: #e8f0e8; font-weight: 700; color: #006847; width: 110px; text-transform: uppercase; font-size: 9px; }

  .check-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }

  .status-bar {
    display: flex; align-items: center; gap: 12px; padding: 6px 12px;
    background: #f0f8f0; border: 1px solid #c8d6c8; border-radius: 4px; margin-bottom: 8px;
  }
  .status-bar .count { font-size: 14px; font-weight: 800; color: #006847; }
  .status-bar .text { font-size: 10px; color: #666; }

  .cond-box { padding: 8px 12px; background: #fffde7; border: 1px solid #f9a825; border-radius: 4px; font-size: 10px; margin-bottom: 8px; }
  .cond-box strong { color: #006847; }

  .firma-row { display: flex; justify-content: space-between; margin-top: 60px; }
  .firma-col { width: 42%; text-align: center; }
  .firma-col .line { border-top: 1px solid #333; margin-bottom: 6px; }
  .firma-col .role { font-size: 8px; color: #999; text-transform: uppercase; margin-bottom: 2px; }
  .firma-col .name { font-size: 10px; font-weight: 600; }
  .firma-col .mat { font-size: 9px; color: #666; }

  .footer { text-align: center; font-size: 7px; color: #aaa; margin-top: 15px; border-top: 1px solid #eee; padding-top: 6px; }
</style></head><body>
<div style="max-height:100vh;overflow:hidden;">

<!-- Header con logo -->
<div class="header-bar">
  <img src="/logo.svg" alt="Enterprise" />
  <div class="title">
    <h1>Preventive Maintenance Control</h1>
    <p>StockBase Inventory Management</p>
  </div>
  <div class="folio-box">
    <div class="folio">FOLIO: ${m.folio}</div>
    <div class="fecha">${fecha}</div>
    <div style="font-size:10px; font-weight:700; color:#006847; margin-top:2px;">${tipo}</div>
  </div>
</div>

<!-- Datos generales -->
<table class="info-table">
  <tr>
    <td class="label">Sede</td><td>${m.sede || 'Main Warehouse'}</td>
    <td class="label">Lugar</td><td>${m.lugar || m.area || '—'}</td>
    <td class="label">Tipo Equipo</td><td>${tipo}</td>
  </tr>
  <tr>
    <td class="label">No. Serie</td><td>${m.noSerie || '—'}</td>
    <td class="label">Área</td><td>${m.area || '—'}</td>
    <td class="label">Hora</td><td>${m.hora || '—'}</td>
  </tr>
  <tr>
    <td class="label">Responsable</td><td colspan="2">${m.responsable || '—'}</td>
    <td class="label">Usuario</td><td colspan="2">${m.nombreUsuario || '—'}</td>
  </tr>
  <tr>
    <td class="label">Fuera de Servicio</td><td style="font-weight:700; color:${m.fueraServicio ? '#c62828' : '#006847'}">${m.fueraServicio ? 'SÍ' : 'NO'}</td>
    <td class="label" colspan="4"></td>
  </tr>
</table>

<!-- Barra de progreso -->
<div class="status-bar">
  <div class="count">${done}/${total}</div>
  <div class="text">elementos revisados</div>
  <div style="flex:1; height:8px; background:#ddd; border-radius:4px; overflow:hidden;">
    <div style="height:100%; width:${total > 0 ? (done/total*100) : 0}%; background:#006847; border-radius:4px;"></div>
  </div>
</div>

<!-- Checklist -->
<table class="check-table">
  <thead>
    <tr style="background:#006847; color:white;">
      <th style="padding:6px 10px; border:1px solid #005c3a; font-size:9px; text-align:left">ELEMENTO</th>
      <th style="padding:6px 8px; border:1px solid #005c3a; font-size:9px; text-align:center; width:35px">SI</th>
      <th style="padding:6px 8px; border:1px solid #005c3a; font-size:9px; text-align:center; width:35px">NO</th>
    </tr>
  </thead>
  <tbody>
    ${checkRows}
  </tbody>
</table>

${fotosHtml}

${m.condiciones ? `<div class="cond-box"><strong>Condiciones y/o Recomendaciones:</strong> ${m.condiciones}</div>` : ''}

<!-- Firmas -->
<div class="firma-row">
  <div class="firma-col">
    <div class="line"></div>
    <div class="role">Usuario del Equipo</div>
    <div class="name">${m.nombreUsuario || '—'}</div>
  </div>
  <div class="firma-col">
    <div class="line"></div>
    <div class="role">Responsable del Mantenimiento</div>
    <div class="name">${m.responsable || '—'}</div>
  </div>
</div>

<div class="footer">Generado el ${fecha} — Sistema de Gestión StockBase — Headquarters</div>

</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

// ── FORMATOS VACÍOS ─────────────────────────────────────────────────────────
function generarFormatoVacioCriterios() {
  const fecha = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

  const critRows = CRITERIOS_SECTIONS.map(sec => {
    const sectionHeader = `<tr><td colspan="4" style="background:#006847; color:white; padding:4px 8px; font-weight:700; font-size:9px; border:1px solid #005c3a;">${sec.label.toUpperCase()}</td></tr>`;
    const rows = sec.items.map((item, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#f0f8f0' : '#ffffff'}">
        <td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px; font-weight:600; width:70px; text-align:center; color:#006847">${item.code}</td>
        <td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px; color:#333">${item.desc}</td>
        <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-size:8px;"></td>
        <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-size:8px;"></td>
      </tr>`).join("");
    return sectionHeader + rows;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Formato Vacío - Criterios de Seguridad</title>
<style>
  @page { size: portrait; margin: 0.8cm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html,body { height: 100%; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #333; }
  .header-bar { display: flex; align-items: center; justify-content: space-between; border: 2px solid #006847; border-radius: 4px; padding: 10px 16px; margin-bottom: 12px; }
  .header-bar img { height: 40px; }
  .header-bar .title { text-align: center; flex: 1; }
  .header-bar .title h1 { font-size: 12px; color: #006847; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
  .header-bar .title p { font-size: 9px; color: #666; margin-top: 2px; }
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  .info-table td { padding: 4px 8px; border: 1px solid #c8d6c8; font-size: 8px; }
  .info-table .label { background: #e8f0e8; font-weight: 700; color: #006847; width: 120px; text-transform: uppercase; font-size: 9px; }
  .firma-row { display: flex; justify-content: space-between; margin-top: 60px; }
  .firma-col { width: 42%; text-align: center; }
  .firma-col .line { border-top: 1px solid #333; margin-bottom: 6px; }
  .firma-col .role { font-size: 8px; color: #999; text-transform: uppercase; margin-bottom: 2px; }
  .firma-col .name { font-size: 10px; font-weight: 600; }
  .footer { text-align: center; font-size: 7px; color: #aaa; margin-top: 20px; border-top: 1px solid #eee; padding-top: 6px; }
</style></head><body>
<div style="max-height:100vh;overflow:hidden;">
<div class="header-bar">
  <img src="/logo.svg" alt="Enterprise" />
  <div class="title">
    <h1>Security Criteria Review</h1>
    <p>StockBase Inventory Management</p>
  </div>
  <div style="text-align:right;">
    <div style="font-size:14px; font-weight:800; color:#006847;">FOLIO: ______</div>
    <div style="font-size:9px; color:#666;">${fecha}</div>
  </div>
</div>
<table class="info-table">
  <tr>
    <td class="label">Adscripción</td><td>&nbsp;</td>
    <td class="label">Área de Servicio</td><td>&nbsp;</td>
    <td class="label">Fecha</td><td>&nbsp;</td>
  </tr>
  <tr>
    <td class="label">Nombre de Usuario</td><td colspan="2">&nbsp;</td>
    <td class="label">Cuenta de Dominio</td><td>&nbsp;</td>
    <td class="label">IP Equipo</td><td>&nbsp;</td>
  </tr>
  <tr>
    <td class="label">Marca</td><td>&nbsp;</td>
    <td class="label">Modelo</td><td>&nbsp;</td>
    <td class="label">No. Serie</td><td>&nbsp;</td>
  </tr>
  <tr>
    <td class="label">Evaluador</td><td colspan="5">&nbsp;</td>
  </tr>
</table>
<table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
  <thead>
    <tr style="background:#006847; color:white;">
      <th style="padding:4px 8px; border:1px solid #005c3a; font-size:8px; text-align:center; width:70px">CRITERIO</th>
      <th style="padding:4px 8px; border:1px solid #005c3a; font-size:8px; text-align:left">ACTIVIDAD</th>
      <th style="padding:4px 6px; border:1px solid #005c3a; font-size:8px; text-align:center; width:30px">SI</th>
      <th style="padding:4px 6px; border:1px solid #005c3a; font-size:8px; text-align:center; width:30px">NO</th>
    </tr>
  </thead>
  <tbody>${critRows}</tbody>
</table>
<div style="text-align:center; padding:6px; border:2px solid #006847; border-radius:6px; background:#e8f5e9;">
  <div style="font-size:10px; color:#666; text-transform:uppercase;">Calificación</div>
  <div style="font-size:20px; font-weight:800; color:#006847;">____%</div>
  <div style="font-size:9px; color:#999;">___ de ${CRIT_KEYS.length} criterios cumplidos</div>
</div>
<div style="margin-top:8px; padding:8px 12px; background:#f5f5f5; border:1px solid #ddd; border-radius:4px; font-size:10px;">
  <strong style="color:#006847;">Observaciones:</strong> <span style="color:#999;">________________________________________</span>
</div>
<div class="firma-row">
  <div class="firma-col"><div class="line"></div><div class="role">Usuario del equipo</div><div class="name">&nbsp;</div></div>
  <div class="firma-col"><div class="line"></div><div class="role">Evaluador</div><div class="name">&nbsp;</div></div>
</div>
<div class="footer">Generado el ${fecha} — Sistema de Gestión StockBase — Headquarters</div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

function generarFormatoVacioMantenimiento(tipo) {
  const fecha = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  const checklist = MANT_CHECKLISTS[tipo] || MANT_CHECKLISTS.PC;
  const total = checklist.flatMap(s => s.items).length;

  const checkRows = checklist.map(sec => {
    const header = `<tr><td colspan="3" style="background:#006847; color:white; padding:4px 8px; font-weight:700; font-size:9px; border:1px solid #005c3a;">${sec.label.toUpperCase()}</td></tr>`;
    const rows = sec.items.map((item, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#f0f8f0' : '#ffffff'}">
        <td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px; color:#333">${item.label}</td>
        <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-size:8px;"></td>
        <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-size:8px;"></td>
      </tr>`).join("");
    return header + rows;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Formato Vacío - Mantenimiento ${tipo}</title>
<style>
  @page { size: landscape; margin: 1cm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html,body { height: 100%; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #333; }
  .header-bar { display: flex; align-items: center; justify-content: space-between; border: 2px solid #006847; border-radius: 4px; padding: 10px 16px; margin-bottom: 10px; }
  .header-bar img { height: 50px; }
  .header-bar .title { text-align: center; flex: 1; }
  .header-bar .title h1 { font-size: 14px; color: #006847; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
  .header-bar .title p { font-size: 9px; color: #666; margin-top: 2px; }
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  .info-table td { padding: 4px 10px; border: 1px solid #c8d6c8; font-size: 10px; }
  .info-table .label { background: #e8f0e8; font-weight: 700; color: #006847; width: 110px; text-transform: uppercase; font-size: 9px; }
  .firma-row { display: flex; justify-content: space-between; margin-top: 60px; }
  .firma-col { width: 42%; text-align: center; }
  .firma-col .line { border-top: 1px solid #333; margin-bottom: 6px; }
  .firma-col .role { font-size: 8px; color: #999; text-transform: uppercase; margin-bottom: 2px; }
  .firma-col .name { font-size: 10px; font-weight: 600; }
  .footer { text-align: center; font-size: 7px; color: #aaa; margin-top: 15px; border-top: 1px solid #eee; padding-top: 6px; }
</style></head><body>
<div style="max-height:100vh;overflow:hidden;">
<div class="header-bar">
  <img src="/logo.svg" alt="Enterprise" />
  <div class="title">
    <h1>Preventive Maintenance Control</h1>
    <p>StockBase Inventory Management</p>
  </div>
  <div style="text-align:right;">
    <div style="font-size:13px; font-weight:800; color:#006847;">FOLIO: ______</div>
    <div style="font-size:9px; color:#666;">${fecha}</div>
    <div style="font-size:10px; font-weight:700; color:#006847; margin-top:2px;">${tipo}</div>
  </div>
</div>
<table class="info-table">
  <tr>
    <td class="label">Sede</td><td>&nbsp;</td>
    <td class="label">Lugar</td><td>&nbsp;</td>
    <td class="label">Tipo Equipo</td><td>${tipo}</td>
  </tr>
  <tr>
    <td class="label">No. Serie</td><td>&nbsp;</td>
    <td class="label">Área</td><td>&nbsp;</td>
    <td class="label">Hora</td><td>&nbsp;</td>
  </tr>
  <tr>
    <td class="label">Responsable</td><td colspan="2">&nbsp;</td>
    <td class="label">Usuario</td><td colspan="2">&nbsp;</td>
  </tr>
  <tr>
    <td class="label">Fuera de Servicio</td><td>&nbsp;</td>
    <td class="label" colspan="4"></td>
  </tr>
</table>
<div style="display:flex; align-items:center; gap:12px; padding:6px 12px; background:#f0f8f0; border:1px solid #c8d6c8; border-radius:4px; margin-bottom:8px;">
  <div style="font-size:14px; font-weight:800; color:#006847;">___/${total}</div>
  <div style="font-size:10px; color:#666;">elementos revisados</div>
</div>
<table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
  <thead>
    <tr style="background:#006847; color:white;">
      <th style="padding:6px 10px; border:1px solid #005c3a; font-size:9px; text-align:left">ELEMENTO</th>
      <th style="padding:6px 8px; border:1px solid #005c3a; font-size:9px; text-align:center; width:35px">SI</th>
      <th style="padding:6px 8px; border:1px solid #005c3a; font-size:9px; text-align:center; width:35px">NO</th>
    </tr>
  </thead>
  <tbody>${checkRows}</tbody>
</table>
<div style="padding:8px 12px; background:#fffde7; border:1px solid #f9a825; border-radius:4px; font-size:10px; margin-bottom:8px;">
  <strong style="color:#006847;">Condiciones y/o Recomendaciones:</strong> <span style="color:#999;">________________________________________</span>
</div>
<div class="firma-row">
  <div class="firma-col"><div class="line"></div><div class="role">Usuario del Equipo</div><div class="name">&nbsp;</div></div>
  <div class="firma-col"><div class="line"></div><div class="role">Responsable del Mantenimiento</div><div class="name">&nbsp;</div></div>
</div>
<div class="footer">Generado el ${fecha} — Sistema de Gestión StockBase — Headquarters</div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

// ── API helpers ──────────────────────────────────────────────────────────────
const apiJson = (url, opts = {}) => {
  const { headers: extraHeaders = {}, ...rest } = opts;
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  const token = sessionStorage.getItem('authToken');
  if (token) headers['x-session-token'] = token;
  return fetch(url, { headers, ...rest })
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      return data;
    }));
};

// ── CSV IMPORT ──────────────────────────────────────────────────────────────
const CSV_MAP = {
  // Ubicación / General
  "no.":"no","no":"no","número":"no",
  "área":"area","area":"area","departamento":"area","servicio":"area",
  "nivel":"nivel","id red":"idRed","entidad":"entidad","unidad":"unidad",
  "nombre unidad":"nombreUnidad","calle":"calle","número ext":"numero","colonia":"colonia",
  "municipio":"municipio","cp":"cp","código postal":"cp",
  "procedencia":"procedencia","centro costos":"centroCostos","clave org.":"claveOrg",
  // Hardware
  "tipo de equipo":"tipoEquipo","tipo equipo":"tipoEquipo","tipo":"tipoEquipo",
  "marca":"marca","modelo":"modelo",
  "no. serie":"noSerie","no serie":"noSerie","número de serie":"noSerie","serie":"noSerie","no.serie":"noSerie",
  "no. inventario":"noInventario","no inventario":"noInventario","número de inventario":"noInventario","inventario":"noInventario","no.inventario":"noInventario",
  "año de adquisición":"anioAdq","año adquisición":"anioAdq","año":"anioAdq","anio":"anioAdq",
  "tipo procesador":"tipoProcesador","procesador":"tipoProcesador","tipo de procesador":"tipoProcesador",
  "velocidad (ghz)":"velocidadProc","velocidad ghz":"velocidadProc","velocidad":"velocidadProc","ghz":"velocidadProc",
  "disco duro (gb)":"discoDuro","disco duro gb":"discoDuro","disco duro":"discoDuro","disco":"discoDuro","hdd (gb)":"discoDuro","hdd":"discoDuro",
  "memoria ram (gb)":"ram","ram (gb)":"ram","ram gb":"ram","ram":"ram","memoria":"ram",
  "garantía":"garantia","garantia":"garantia",
  "vigencia garantía":"vigenciaGarantia","vigencia garantia":"vigenciaGarantia","vigencia (meses)":"vigenciaGarantia",
  // Red
  "nombre de usuario":"nombreUsuario","nombre usuario":"nombreUsuario","usuario de red":"nombreUsuario","usuario":"nombreUsuario",
  "hostname":"hostname",
  "red lan":"redLAN","lan":"redLAN","red":"redLAN",
  "dirección ip":"ip","direccion ip":"ip","ip":"ip","dirección ip local":"ip",
  "mac address":"mac","dirección mac":"mac","mac":"mac",
  "máscara":"mascara","mascara":"mascara","máscara subred":"mascara",
  "estática/dinámica":"estaticaDinamica","estatica/dinamica":"estaticaDinamica","tipo ip":"estaticaDinamica",
  "domain connection":"onDomain","dominio":"onDomain",
  "internet":"internet","acceso internet":"internet",
  // Resguardo
  "nombre(s)":"nombres","nombres":"nombres","nombre":"nombres",
  "apellido paterno":"apPaterno","ap. paterno":"apPaterno","paterno":"apPaterno",
  "apellido materno":"apMaterno","ap. materno":"apMaterno","materno":"apMaterno",
  "correo":"correo","correo electrónico":"correo","email":"correo","correo electronico":"correo",
  "matrícula":"matricula","matricula":"matricula","número de matrícula":"matricula","no. matrícula":"matricula",
  "puesto":"puesto","cargo":"puesto",
  "adscripción":"nombreAdscripcion","adscripcion":"nombreAdscripcion","nombre adscripción":"nombreAdscripcion",
  "clave adscripción":"claveAdscripcion","clave adscripcion":"claveAdscripcion",
  "tipo contratación":"tipoContratacion","tipo contratacion":"tipoContratacion","contratación":"tipoContratacion",
  // Licencias
  "s.o.":"so","sistema operativo":"so","so":"so","windows":"so",
  "sistema operativo (indicar la versión)":"so","sistema operativo (indicar la version)":"so",
  "service pack":"servicePack","sp":"servicePack",
  "32/64 bits":"tipoSistema","32/64":"tipoSistema","bits":"tipoSistema","arquitectura":"tipoSistema",
  "ofimática":"ofimatica","ofimatica":"ofimatica","versión office":"ofimatica","version office":"ofimatica",
  "obsoleto":"obsoleto",
  // Apps (checkboxes)
  "nitro pdf":"app_nitroPdf","nitropdf":"app_nitroPdf","nitro":"app_nitroPdf",
  "adobe reader":"app_adobeReader","adobe":"app_adobeReader","acrobat":"app_adobeReader",
  "java":"app_java",
  "chrome":"app_chrome","google chrome":"app_chrome",
  "firefox":"app_firefox","mozilla firefox":"app_firefox",
  "edge":"app_edge","microsoft edge":"app_edge",
  "office":"app_office","ms office":"app_office",
  "teams":"app_teams","microsoft teams":"app_teams",
  "vnc":"app_vnc","vnc viewer":"app_vnc","ultravnc":"app_vnc",
  "forefront":"app_forefront","microsoft forefront":"app_forefront",
  "webex":"app_webex","cisco webex":"app_webex",
  "zoom":"app_zoom",
  // Enterprise Systems (checkboxes)
  "analytics":"sys_analytics",
  "audit":"sys_audit",
  "benefits":"sys_benefits",
  "billing":"sys_billing",
  "catering":"sys_catering",
  "compliance":"sys_compliance",
  "crm":"sys_crm",
  "database":"sys_database",
  "datahub":"sys_datahub",
  "directory":"sys_directory",
  "dms":"sys_dms",
  "erp":"sys_erp",
  "facilities":"sys_facilities",
  "fileserver":"sys_fileserver",
  "finance":"sys_finance",
  "frontdesk":"sys_frontdesk",
  "grants":"sys_grants",
  "helpdesk":"sys_helpdesk",
  "hrms":"sys_hrms",
  "inventory":"sys_inventory",
  "itsm":"sys_itsm",
  "leave":"sys_leave",
  "logistics":"sys_logistics",
  "operations":"sys_operations",
  "payroll":"sys_payroll",
  "planning":"sys_planning",
  "procurement":"sys_procurement",
  "quality":"sys_quality",
  "recruiting":"sys_recruiting",
  "reporting":"sys_reporting",
  "retail":"sys_retail",
  "tax":"sys_tax",
  "vendors":"sys_vendors",
  "verify":"sys_verify",
  "workflow":"sys_workflow",
  // Notas
  "notas":"notas","observaciones":"notas","comentarios":"notas",
  "nombre equipo":"alias",
};

const BOOL_KEYS = new Set([
  "app_nitroPdf","app_adobeReader","app_java","app_ie11","app_chrome","app_firefox",
  "app_edge","app_office","app_openOffice","app_teams","app_vnc","app_forefront",
  "app_webex","app_nero","app_scanner","app_dvd","app_zoom",
  "sys_erp","sys_planning","sys_payroll","sys_crm","sys_directory","sys_hrms","sys_helpdesk",
  "sys_inventory","sys_benefits","sys_billing","sys_tax","sys_datahub","sys_finance",
  "sys_dms","sys_workflow","sys_database","sys_analytics","sys_quality",
  "sys_leave","sys_reporting","sys_compliance","sys_audit",
  "sys_retail","sys_logistics","sys_facilities","sys_frontdesk","sys_catering",
  "sys_procurement","sys_grants","sys_finance_app","sys_compliance_app",
  "sys_fileserver","sys_operations","sys_verify","sys_reporting_app",
  "sys_recruiting","sys_facilities_app","sys_itsm","sys_vendors",
  "redLAN","onDomain",
]);

const NUM_KEYS = new Set(["no","anioAdq","discoDuro","ram","vigenciaGarantia"]);

function parseCSVLine(line) {
  const result = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { result.push(cur); cur = ""; }
    else { cur += c; }
  }
  result.push(cur);
  return result.map(v => v.replace(/^"|"$/g, "").trim());
}
// ────────────────────────────────────────────────────────────────────────────

function daysSince(d) { if (!d) return Infinity; return Math.floor((new Date() - new Date(d)) / 864e5); }
function valBadge(d) { if (!d) return { t:"Pendiente", bg:"rgba(100,116,139,0.12)", c:"#64748b" }; return { t:"Validado", bg:"rgba(34,197,94,0.15)", c:"#22c55e" }; }
function estadoBadge(e) { if (e === "resuelto") return { t:"Resuelto", bg:"rgba(34,197,94,0.15)", c:"#22c55e" }; if (e === "proceso") return { t:"En Proceso", bg:"rgba(59,130,246,0.15)", c:"#60a5fa" }; return { t:"Pendiente", bg:"rgba(245,158,11,0.15)", c:"#f59e0b" }; }

const inputStyle = { width:"100%", padding:"8px 12px", boxSizing:"border-box", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit" };
const readonlyStyle = { ...inputStyle, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", color:"#64748b" };
const btnStyle = (c, bg) => ({ padding:"6px 14px", borderRadius:8, border:"1px solid " + c + "33", background:bg || c + "15", color:c, fontSize:12, cursor:"pointer", fontWeight:600, whiteSpace:"nowrap" });

function CheckBox({ checked, onChange, size = 22 }) {
  return (
    <button onClick={onChange} style={{ width:size, height:size, borderRadius:6, border:checked?"none":"2px solid rgba(255,255,255,0.2)", background:checked?"linear-gradient(135deg,#22c55e,#10b981)":"rgba(255,255,255,0.03)", color:"#fff", fontSize:size*0.55, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      {checked ? "✓" : ""}
    </button>
  );
}

function DeptSelect({ value, onChange, style: extra, extraAreas = [] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState("");
  const [addingNew, setAddingNew] = useState(false);

  const handleSelect = (newArea) => {
    if (value && newArea !== value) {
      if (!window.confirm(`¿Mover equipo a "${newArea}"?\nÁrea actual: ${value}`)) return;
    }
    onChange(newArea);
    setOpen(false);
    setQ("");
  };
  const ref = useRef(null);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setAddingNew(false); } }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);

  // Solo áreas que existen en los equipos importados (sin lista estática)
  const allAreas = [...new Set(extraAreas)].filter(Boolean).sort();

  const filtered = q ? allAreas.filter(d => d.toLowerCase().includes(q.toLowerCase())) : null;

  // Build grouped list when not searching
  const grouped = !filtered ? (() => {
    const groups = {};
    allAreas.forEach(d => {
      const cat = getDeptCategory(d);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(d);
    });
    return Object.entries(groups).sort(([a],[b]) => a.localeCompare(b));
  })() : null;

  return (
    <div ref={ref} style={{ position:"relative", ...extra }}>
      <div onClick={() => { setOpen(!open); setAddingNew(false); }} style={{ ...inputStyle, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ whiteSpace:"normal" }}>{value || "Seleccionar área..."}</span>
        <span style={{ fontSize:10, marginLeft:8 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:50, background:"#1e293b", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, boxShadow:"0 12px 40px rgba(0,0,0,0.5)", maxHeight:300, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar área..." autoFocus style={{ padding:"10px 12px", background:"rgba(255,255,255,0.05)", border:"none", borderBottom:"1px solid rgba(255,255,255,0.08)", color:"#f1f5f9", fontSize:13, outline:"none" }} />
          <div style={{ overflowY:"auto", flex:1 }}>
            {filtered ? (
              filtered.length === 0
                ? <div style={{ padding:12, color:"#475569", fontSize:12 }}>Sin resultados</div>
                : filtered.map(d => (
                    <div key={d} onClick={() => handleSelect(d)} style={{ padding:"8px 12px", cursor:"pointer", fontSize:12, color:d === value ? "#60a5fa" : "#cbd5e1" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {d}
                    </div>
                  ))
            ) : grouped.map(([cat, depts]) => (
                <div key={cat}>
                  <div onClick={() => handleSelect(cat)} style={{ padding:"7px 12px 4px", fontSize:13, color: cat === value ? "#60a5fa" : "#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", borderTop:"1px solid rgba(255,255,255,0.08)", marginTop:4, cursor:"pointer", background:"rgba(255,255,255,0.03)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    title={`Seleccionar "${cat}" como área general`}>
                    {cat}
                  </div>
                  {(depts.length === 1 && depts[0] === cat ? [] : depts).map(d => (
                    <div key={d} onClick={() => handleSelect(d)} style={{ padding:"5px 12px 5px 22px", cursor:"pointer", fontSize:11, color:d === value ? "#60a5fa" : "#94a3b8" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {d}
                    </div>
                  ))}
                </div>
              ))
            }
            {/* Agregar nueva área */}
            {!addingNew ? (
              <div onClick={() => setAddingNew(true)} style={{ padding:"8px 12px", cursor:"pointer", fontSize:12, color:"#22c55e", borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:4 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                + Agregar nueva área
              </div>
            ) : (
              <div style={{ padding:"8px 12px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:6 }}>
                <input value={custom} onChange={e => setCustom(e.target.value.toUpperCase())} placeholder="Nombre del área..." autoFocus style={{ flex:1, padding:"6px 10px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:6, color:"#f1f5f9", fontSize:12, outline:"none" }} onKeyDown={e => { if (e.key === "Enter" && custom.trim()) { handleSelect(custom.trim()); setAddingNew(false); setCustom(""); }}} />
                <button onClick={() => { if (custom.trim()) { handleSelect(custom.trim()); setAddingNew(false); setCustom(""); }}} style={{ padding:"4px 10px", background:"#22c55e20", border:"1px solid #22c55e44", borderRadius:6, color:"#22c55e", fontSize:11, cursor:"pointer" }}>OK</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange, disabled }) {
  if (field.type === "textarea") return <textarea value={value ?? ""} onChange={e => onChange(e.target.value)} rows={5} placeholder="Notas..." readOnly={disabled} style={{ ...inputStyle, resize:"vertical", minHeight:100, ...(disabled ? { opacity:0.7, cursor:"default" } : {}) }} />;
  if (field.type === "select") return <select value={value || ""} onChange={e => onChange(e.target.value)} disabled={field.readonly || disabled} style={{ ...(field.readonly || disabled ? readonlyStyle : inputStyle), cursor:field.readonly || disabled ? "default" : "pointer" }}><option value="">—</option>{field.options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
  return <input type={field.type === "number" ? "number" : "text"} value={value ?? ""} onChange={e => onChange(e.target.value)} readOnly={field.readonly || disabled} style={field.readonly || disabled ? readonlyStyle : inputStyle} />;
}

function getDeptCategory(area) {
  if (!area) return "NO DEPARTMENT";
  if (area.endsWith(" HQ")) return area;
  if (area.endsWith(" Annex")) return area;
  if (area.startsWith("IT")) return "IT DEPARTMENT";
  if (area.startsWith("WAREHOUSE")) return "WAREHOUSE";
  if (area.startsWith("ACCOUNTING") || area.startsWith("FINANCE")) return "FINANCE";
  if (area.startsWith("HR") || area.startsWith("HUMAN")) return "HUMAN RESOURCES";
  if (area.startsWith("SALES")) return "SALES";
  if (area.startsWith("CUSTOMER") || area.startsWith("SUPPORT")) return "CUSTOMER SERVICE";
  if (area.startsWith("MANAGEMENT") || area.startsWith("DIRECTION")) return "MANAGEMENT";
  if (area.startsWith("RECEPTION")) return "RECEPTION";
  if (area.startsWith("QUALITY")) return "QUALITY CONTROL";
  if (area.startsWith("SHIPPING")) return "SHIPPING";
  if (area.startsWith("MAINTENANCE")) return "MAINTENANCE";
  // For custom areas: the full name IS the category
  return area;
}

// Extrae la parte específica de un área compuesta para mostrarlo como nombre en la tabla
// e.g. "WAREHOUSE A SHELF 3" -> "SHELF 3", "OFFICE 12" -> "12"
function getAreaSuffix(area) {
  if (!area) return "";
  // Extract the specific part of a composite area name
  // e.g. "WAREHOUSE A SHELF 3" -> "SHELF 3", "OFFICE 12" -> "12"
  const m = area.match(/\s+(\d.*)$/);
  if (m) return m[1].trim();
  const parts = area.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(" ") : "";
}

function ResponsableSelect({ value, onChange }) {
  const [custom, setCustom] = useState(false);
  const opciones = getResponsableOpciones();
  const isCustom = custom || (!opciones.includes(value) && value !== "");

  if (isCustom) {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase())}
          placeholder="Nombre del responsable..."
          autoFocus
          style={inputStyle}
        />
        <button
          onClick={() => { setCustom(false); onChange(getResponsableDefault()); }}
          style={btnStyle("#64748b")}
          title="Volver a lista"
        >↩</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <select value={value} onChange={e => {
        if (e.target.value === "__otro__") { setCustom(true); onChange(""); }
        else onChange(e.target.value);
      }} style={{ ...inputStyle, cursor: "pointer" }}>
        {opciones.map(op => <option key={op} value={op}>{op}</option>)}
        <option value="__otro__">✏️ Otro responsable...</option>
      </select>
    </div>
  );
}

function getResponsableOpciones() {
  const h = new Date().getHours();
  if (h >= 7 && h < 12) return ["ALEX MARTINEZ GARCIA", "CARLOS RODRIGUEZ LOPEZ"];
  if (h >= 12 && h < 15) return ["ALEX MARTINEZ GARCIA", "CARLOS RODRIGUEZ LOPEZ"];
  if (h >= 15 && h < 20) return ["CARLOS RODRIGUEZ LOPEZ", "ALEX MARTINEZ GARCIA"];
  return ["ALEX MARTINEZ GARCIA", "CARLOS RODRIGUEZ LOPEZ"];
}
function getResponsableDefault() {
  const h = new Date().getHours();
  if (h >= 7 && h < 12) return "ALEX MARTINEZ GARCIA";
  if (h >= 12 && h < 15) return "ALEX MARTINEZ GARCIA";
  if (h >= 15 && h < 20) return "CARLOS RODRIGUEZ LOPEZ";
  return "ALEX MARTINEZ GARCIA";
}

// ── Helper: comprimir imagen a max 800px ─────────────────────────────────────
function compressImage(file, maxW = 800) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxW) { h = (maxW / w) * h; w = maxW; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── CriteriosEquipoTab ───────────────────────────────────────────────────────
function CriteriosEquipoTab({ equipo, criterios, equipos, onCrear, onEliminar }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(null);

  const misCriterios = criterios.filter(c => c.equipoId === equipo.id);

  const initDraft = () => ({
    id: "crit_" + Date.now(),
    equipoId: equipo.id,
    fecha: new Date().toISOString().split("T")[0],
    evaluador: getResponsableDefault(),
    matriculaEval: "",
    noSerie: equipo.noSerie || "",
    area: equipo.area || "",
    usuario: [equipo.nombres, equipo.apPaterno].filter(Boolean).join(" "),
    cuenta: equipo.nombreUsuario || "",
    marca: equipo.marca || "",
    modelo: equipo.modelo || "",
    hostname: equipo.hostname || "",
    ip: equipo.ip || "",
    inventario: equipo.noInventario || "",
    ...Object.fromEntries(CRIT_KEYS.map(k => [k, false])),
    calificacion: 0,
    soporte: "",
    observaciones: "",
    matriculaUsuario: equipo.matricula || "",
  });

  const calcCalificacion = (d) => {
    const total = CRIT_KEYS.length;
    const cumple = CRIT_KEYS.filter(k => d[k]).length;
    return Math.round((cumple / total) * 100);
  };

  const toggleCrit = (key) => {
    setDraft(prev => {
      const next = { ...prev, [key]: !prev[key] };
      next.calificacion = calcCalificacion(next);
      return next;
    });
  };

  const guardar = async () => {
    draft.calificacion = calcCalificacion(draft);
    await onCrear(draft);
    setShowForm(false);
    setDraft(null);
  };

  return (
    <div>
      {misCriterios.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>
            Historial de revisiones ({misCriterios.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {misCriterios.map(rev => {
              const pct = rev.calificacion || 0;
              const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
              return (
                <div key={rev.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, minWidth: 50 }}>#{rev.folio}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", minWidth: 80 }}>{rev.fecha}</span>
                  <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, color, fontWeight: 700, minWidth: 40 }}>{pct}%</span>
                  <span style={{ fontSize: 10, color: "#64748b" }}>{rev.evaluador || "—"}</span>
                  <button onClick={() => generarHTMLCriterios(rev)} style={btnStyle("#3b82f6")} title="Imprimir reporte">📄</button>
                  {onEliminar && <button onClick={() => { if (window.confirm("¿Eliminar esta revisión de criterios?")) onEliminar(rev.id); }} style={btnStyle("#ef4444")} title="Eliminar">🗑️</button>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!showForm ? (
        onCrear && <button onClick={() => { setDraft(initDraft()); setShowForm(true); }} style={{ padding: "10px 20px", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          🔐 Nueva Revisión de Criterios
        </button>
      ) : draft && (
        <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontSize: 14, color: "#f59e0b" }}>🔐 Nueva Revisión — #{equipo.no}</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: draft.calificacion >= 80 ? "#22c55e" : draft.calificacion >= 50 ? "#f59e0b" : "#ef4444" }}>
                {draft.calificacion}%
              </span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Evaluador</label>
              <ResponsableSelect value={draft.evaluador} onChange={v => setDraft(p => ({ ...p, evaluador: v }))} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Matrícula evaluador</label>
              <input value={draft.matriculaEval} onChange={e => setDraft(p => ({ ...p, matriculaEval: e.target.value }))} placeholder="Matrícula" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Usuario del equipo</label>
              <input value={draft.usuario} onChange={e => setDraft(p => ({ ...p, usuario: e.target.value }))} placeholder="Nombre" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Matrícula usuario</label>
              <input value={draft.matriculaUsuario} onChange={e => setDraft(p => ({ ...p, matriculaUsuario: e.target.value }))} placeholder="Matrícula" style={inputStyle} />
            </div>
          </div>
          {CRITERIOS_SECTIONS.map(sec => {
            const done = sec.items.filter(i => draft[i.key]).length;
            const total = sec.items.length;
            return (
              <div key={sec.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12 }}>{sec.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sec.color, textTransform: "uppercase" }}>{sec.label}</span>
                  <span style={{ fontSize: 10, color: "#64748b" }}>({done}/{total})</span>
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(done / total) * 100}%`, background: sec.color, borderRadius: 2 }} />
                  </div>
                  <button onClick={() => { const allDone = sec.items.every(i => draft[i.key]); const upd = { ...draft }; sec.items.forEach(i => upd[i.key] = !allDone); upd.calificacion = calcCalificacion(upd); setDraft(upd); }} style={{ padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#94a3b8", fontSize: 9, cursor: "pointer" }}>
                    {sec.items.every(i => draft[i.key]) ? "↩" : "✓ Todo"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 4 }}>
                  {sec.items.map(item => (
                    <div key={item.key} onClick={() => toggleCrit(item.key)} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 10px", background: draft[item.key] ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (draft[item.key] ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"), borderRadius: 8, cursor: "pointer" }}>
                      <CheckBox checked={draft[item.key]} onChange={() => {}} size={18} />
                      <div>
                        <div style={{ fontSize: 11, color: draft[item.key] ? "#86efac" : "#94a3b8", fontWeight: 600 }}>
                          <span style={{ color: "#64748b", fontSize: 9, marginRight: 4 }}>[{item.code}]</span>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 9, color: "#475569", marginTop: 1, lineHeight: 1.3 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Soporte proporcionado</label>
              <textarea value={draft.soporte} onChange={e => setDraft(p => ({ ...p, soporte: e.target.value }))} rows={2} placeholder="Descripción del soporte brindado..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Observaciones</label>
              <textarea value={draft.observaciones} onChange={e => setDraft(p => ({ ...p, observaciones: e.target.value }))} rows={2} placeholder="Observaciones generales..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
            <button onClick={() => { setShowForm(false); setDraft(null); }} style={btnStyle("#94a3b8")}>Cancelar</button>
            <button onClick={guardar} style={{ ...btnStyle("#22c55e"), background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff" }}>✅ Guardar Revisión</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CriteriosMainTab ─────────────────────────────────────────────────────────
function CriteriosMainTab({ criterios, equipos, onCrear, onEliminar, readOnly }) {
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEquipoId, setSelectedEquipoId] = useState("");
  const [filterUnidadForm, setFilterUnidadForm] = useState("");
  const [filterDeptForm, setFilterDeptForm] = useState("");
  const [critDraft, setCritDraft] = useState(null);
  const [checkedCritIds, setCheckedCritIds] = useState(new Set());

  const areas = [...new Set(criterios.map(c => c.area).filter(Boolean))].sort();

  const filtered = criterios.filter(c => {
    if (filterArea && c.area !== filterArea) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return [c.noSerie, c.area, c.usuario, c.evaluador, String(c.folio)].some(v => v && v.toLowerCase().includes(s));
  });

  const imprimirMultipleCrit = (ids) => {
    const revs = criterios.filter(c => ids.has(c.id));
    if (revs.length === 0) return;
    const pages = revs.map(rev => {
      const fecha = new Date(rev.fecha).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
      const cumpleCount = CRIT_KEYS.filter(k => rev[k]).length;
      const totalCount = CRIT_KEYS.length;
      const pct = rev.calificacion || Math.round((cumpleCount / totalCount) * 100);
      const critRows = CRITERIOS_SECTIONS.map(sec => {
        const sectionHeader = `<tr><td colspan="4" style="background:#006847; color:white; padding:4px 8px; font-weight:700; font-size:9px; border:1px solid #005c3a;">${sec.label.toUpperCase()}</td></tr>`;
        const rows = sec.items.map((item, idx) => `
        <tr style="background:${idx % 2 === 0 ? '#f0f8f0' : '#fff'}">
          <td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px; font-weight:600; width:70px; text-align:center; color:#006847">${item.code}</td>
          <td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px">${item.desc}</td>
          <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-weight:700; font-size:8px; background:${rev[item.key] ? '#e8f5e9' : '#fff'}; color:${rev[item.key] ? '#006847' : '#999'}">${rev[item.key] ? '✓' : ''}</td>
          <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-weight:700; font-size:8px; background:${!rev[item.key] ? '#fce4ec' : '#fff'}; color:${!rev[item.key] ? '#c62828' : '#999'}">${!rev[item.key] ? '✓' : ''}</td>
        </tr>`).join("");
        return sectionHeader + rows;
      }).join("");
      return `
    <div style="page-break-after: always;">
      <div style="display:flex; align-items:center; justify-content:space-between; border:2px solid #006847; border-radius:4px; padding:10px 16px; margin-bottom:12px;">
        <img src="/logo.svg" alt="Enterprise" style="height:40px;" />
        <div style="text-align:center; flex:1;"><h1 style="font-size:12px; color:#006847; text-transform:uppercase; letter-spacing:1px;">Security Criteria Review</h1><p style="font-size:9px; color:#666;">StockBase — Main Facility</p></div>
        <div style="text-align:right;"><div style="font-size:14px; font-weight:800; color:#006847;">FOLIO: ${rev.folio}</div><div style="font-size:9px; color:#666;">${fecha}</div></div>
      </div>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <tr><td style="padding:4px 8px; border:1px solid #c8d6c8; background:#e8f0e8; font-weight:700; color:#006847; font-size:8px; width:100px;">Área</td><td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px;">${rev.area || '—'}</td><td style="padding:4px 8px; border:1px solid #c8d6c8; background:#e8f0e8; font-weight:700; color:#006847; font-size:8px; width:100px;">Usuario</td><td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px;">${rev.usuario || '—'}</td><td style="padding:4px 8px; border:1px solid #c8d6c8; background:#e8f0e8; font-weight:700; color:#006847; font-size:8px; width:100px;">Serie</td><td style="padding:4px 8px; border:1px solid #c8d6c8; font-size:8px; font-family:monospace;">${rev.noSerie || '—'}</td></tr>
      </table>
      <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
        <thead><tr style="background:#006847; color:white;"><th style="padding:4px 8px; border:1px solid #005c3a; font-size:8px; width:70px;">CRITERIO</th><th style="padding:4px 8px; border:1px solid #005c3a; font-size:8px; text-align:left;">ACTIVIDAD</th><th style="padding:4px 6px; border:1px solid #005c3a; font-size:8px; width:30px;">SI</th><th style="padding:4px 6px; border:1px solid #005c3a; font-size:8px; width:30px;">NO</th></tr></thead>
        <tbody>${critRows}</tbody>
      </table>
      <div style="text-align:center; padding:6px; border:2px solid ${pct >= 80 ? '#006847' : '#f57f17'}; border-radius:6px; background:${pct >= 80 ? '#e8f5e9' : '#fff8e1'};">
        <div style="font-size:8px; color:#666;">CALIFICACIÓN</div>
        <div style="font-size:20px; font-weight:800; color:${pct >= 80 ? '#006847' : '#f57f17'};">${pct}%</div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:60px;">
        <div style="width:42%; text-align:center;"><div style="border-top:1px solid #333; margin-bottom:6px;"></div><div style="font-size:8px; color:#999; text-transform:uppercase;">Usuario del equipo</div><div style="font-size:10px; font-weight:600;">${rev.usuario || '—'}</div></div>
        <div style="width:42%; text-align:center;"><div style="border-top:1px solid #333; margin-bottom:6px;"></div><div style="font-size:8px; color:#999; text-transform:uppercase;">Evaluador</div><div style="font-size:10px; font-weight:600;">${rev.evaluador || '—'}</div></div>
      </div>
    </div>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Criterios - ${revs.length} reportes</title>
    <style>@page { size: portrait; margin: 0.8cm; } * { margin:0; padding:0; box-sizing:border-box; } html,body { height:100%; } body { font-family: Arial, sans-serif; font-size:8px; color:#333; }</style>
    </head><body>${pages}<script>window.onload=function(){window.print()}</script></body></html>`;
    const w = window.open("", "_blank"); w.document.write(html); w.document.close();
  };

  const selEquipo = equipos.find(e => e.id === selectedEquipoId);
  const unidadesForm = [...new Set(equipos.map(e => e.unidad).filter(Boolean))].sort();
  const deptsForm = [...new Set(
    equipos
      .filter(e => !filterUnidadForm || (e.unidad || '') === filterUnidadForm)
      .map(e => getDeptCategory(e.area))
  )].sort();
  const equiposForm = equipos
    .filter(e => e.activo !== 0)
    .filter(e => !filterUnidadForm || (e.unidad || '') === filterUnidadForm)
    .filter(e => !filterDeptForm || getDeptCategory(e.area) === filterDeptForm)
    .sort((a, b) => (a.area || "").localeCompare(b.area || ""));

  const initCritDraft = (eq) => ({
    id: "crit_" + Date.now(),
    equipoId: eq.id,
    fecha: new Date().toISOString().split("T")[0],
    evaluador: getResponsableDefault(),
    matriculaEval: "",
    noSerie: eq.noSerie || "",
    area: eq.area || "",
    usuario: [eq.nombres, eq.apPaterno].filter(Boolean).join(" "),
    cuenta: eq.nombreUsuario || "",
    marca: eq.marca || "",
    modelo: eq.modelo || "",
    hostname: eq.hostname || "",
    ip: eq.ip || "",
    inventario: eq.noInventario || "",
    ...Object.fromEntries(CRIT_KEYS.map(k => [k, false])),
    calificacion: 0,
    soporte: "",
    observaciones: "",
    matriculaUsuario: eq.matricula || "",
  });

  const calcCalif = (d) => {
    const total = CRIT_KEYS.length;
    const cumple = CRIT_KEYS.filter(k => d[k]).length;
    return Math.round((cumple / total) * 100);
  };

  const toggleCritDraft = (key) => {
    setCritDraft(prev => {
      const next = { ...prev, [key]: !prev[key] };
      next.calificacion = calcCalif(next);
      return next;
    });
  };

  const selectEquipoCrit = (eqId) => {
    setSelectedEquipoId(eqId);
    const eq = equipos.find(e => e.id === eqId);
    if (eq) setCritDraft(initCritDraft(eq));
  };

  const guardarCrit = async () => {
    const final = { ...critDraft, calificacion: calcCalif(critDraft) };
    await onCrear(final);
    setShowForm(false);
    setCritDraft(null);
    setSelectedEquipoId("");
  };

  const exportarCriterios = async () => {
    const XLSX = await import('xlsx-js-style');

    // Estilos corporativos
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
      fill: { fgColor: { rgb: "006847" }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: { top: {style:"thin"}, bottom: {style:"thin"}, left: {style:"thin"}, right: {style:"thin"} }
    };
    const labelStyle = {
      font: { bold: true, color: { rgb: "006847" }, sz: 9 },
      fill: { fgColor: { rgb: "E8F0E8" }, patternType: "solid" },
      border: { top: {style:"thin"}, bottom: {style:"thin"}, left: {style:"thin"}, right: {style:"thin"} }
    };
    const cellStyle = {
      font: { sz: 9 },
      border: { top: {style:"thin"}, bottom: {style:"thin"}, left: {style:"thin"}, right: {style:"thin"} },
      alignment: { wrapText: true }
    };
    const siStyle = {
      ...cellStyle,
      font: { bold: true, color: { rgb: "006847" }, sz: 9 },
      fill: { fgColor: { rgb: "E8F5E9" }, patternType: "solid" },
      alignment: { horizontal: "center" }
    };
    const noStyle = {
      ...cellStyle,
      font: { bold: true, color: { rgb: "C62828" }, sz: 9 },
      fill: { fgColor: { rgb: "FCE4EC" }, patternType: "solid" },
      alignment: { horizontal: "center" }
    };
    const titleStyle = {
      font: { bold: true, color: { rgb: "006847" }, sz: 14 },
      alignment: { horizontal: "center" }
    };

    const wb = XLSX.utils.book_new();

    // Hoja 1: Historial completo
    const data = filtered.map(c => ({
      "Folio": c.folio,
      "Fecha": c.fecha,
      "Serie": c.noSerie || "",
      "Área": c.area || "",
      "Usuario": c.usuario || "",
      "Cuenta": c.cuenta || "",
      "Marca": c.marca || "",
      "Modelo": c.modelo || "",
      "IP": c.ip || "",
      "Evaluador": c.evaluador || "",
      "Matrícula evaluador": c.matriculaEval || "",
      ...Object.fromEntries(ALL_CRITERIOS.map(cr => [cr.label, c[cr.key] ? "SI" : "NO"])),
      "Calificación": (c.calificacion || 0) + "%",
      "Soporte": c.soporte || "",
      "Observaciones": c.observaciones || "",
    }));

    // Crear hoja con título
    const ws = XLSX.utils.aoa_to_sheet([["Historial de Revisiones de Criterios — StockBase Headquarters"]]);
    XLSX.utils.sheet_add_json(ws, data, { origin: "A2" });

    // Aplicar estilos al título
    ws["A1"].s = titleStyle;
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Object.keys(data[0] || {}).length - 1 } }];

    // Aplicar estilos a headers (fila 2)
    const cols = Object.keys(data[0] || {});
    cols.forEach((_, ci) => {
      const addr = XLSX.utils.encode_cell({ r: 1, c: ci });
      if (ws[addr]) ws[addr].s = headerStyle;
    });

    // Aplicar estilos a datos y colorear SI/NO
    data.forEach((row, ri) => {
      cols.forEach((col, ci) => {
        const addr = XLSX.utils.encode_cell({ r: ri + 2, c: ci });
        if (!ws[addr]) return;
        const val = ws[addr].v;
        if (val === "SI") ws[addr].s = siStyle;
        else if (val === "NO") ws[addr].s = noStyle;
        else if (ri % 2 === 1) ws[addr].s = { ...cellStyle, fill: { fgColor: { rgb: "F0F8F0" }, patternType: "solid" } };
        else ws[addr].s = cellStyle;
      });
    });

    // Anchos de columna
    ws["!cols"] = [
      {wch:6},{wch:11},{wch:14},{wch:25},{wch:20},{wch:15},{wch:12},{wch:15},{wch:14},{wch:15},{wch:15},
      ...ALL_CRITERIOS.map(() => ({wch:8})),
      {wch:10},{wch:25},{wch:25}
    ];
    ws["!rows"] = [{ hpt: 24 }, { hpt: 18 }];

    XLSX.utils.book_append_sheet(wb, ws, "Criterios");

    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Criteria_StockBase_${fecha}.xlsx`);
  };

  const exportarPDFCrit = async (revs) => {
    const html2pdf = (await import('html2pdf.js')).default;

    const pages = revs.map(rev => {
      const fecha = new Date(rev.fecha).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
      const cumpleCount = CRIT_KEYS.filter(k => rev[k]).length;
      const totalCount = CRIT_KEYS.length;
      const pct = rev.calificacion || Math.round((cumpleCount / totalCount) * 100);

      const critRows = CRITERIOS_SECTIONS.map(sec => {
        const header = `<tr><td colspan="4" style="background:#006847;color:white;padding:6px 10px;font-weight:700;font-size:10px;border:1px solid #005c3a;">${sec.label.toUpperCase()}</td></tr>`;
        const rows = sec.items.map((item, idx) => `
          <tr style="background:${idx%2===0?'#f0f8f0':'#fff'}">
            <td style="padding:5px 8px;border:1px solid #c8d6c8;font-size:9px;font-weight:600;width:60px;text-align:center;color:#006847">${item.code}</td>
            <td style="padding:5px 8px;border:1px solid #c8d6c8;font-size:9px">${item.desc}</td>
            <td style="padding:5px 6px;border:1px solid #c8d6c8;text-align:center;width:30px;font-weight:700;font-size:9px;color:${rev[item.key]?'#006847':'#ccc'}">${rev[item.key]?'✓':''}</td>
            <td style="padding:5px 6px;border:1px solid #c8d6c8;text-align:center;width:30px;font-weight:700;font-size:9px;color:${!rev[item.key]?'#c62828':'#ccc'}">${!rev[item.key]?'✓':''}</td>
          </tr>`).join("");
        return header + rows;
      }).join("");

      return `<div style="page-break-after:always;padding:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #006847;padding-bottom:8px;margin-bottom:10px;">
          <img src="/logo.svg" style="height:50px;" />
          <div style="text-align:center;flex:1;"><div style="font-size:14px;font-weight:700;color:#006847;">SECURITY CRITERIA REVIEW</div><div style="font-size:8px;color:#666;">StockBase — Main Facility</div></div>
          <div style="text-align:right;"><div style="font-size:12px;font-weight:800;color:#006847;">FOLIO: ${rev.folio}</div><div style="font-size:8px;color:#666;">${fecha}</div></div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;"><tr>
          <td style="padding:4px 8px;border:1px solid #c8d6c8;background:#e8f0e8;font-weight:700;color:#006847;font-size:8px;width:90px;">ÁREA</td><td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:9px;">${rev.area||'—'}</td>
          <td style="padding:4px 8px;border:1px solid #c8d6c8;background:#e8f0e8;font-weight:700;color:#006847;font-size:8px;width:90px;">USUARIO</td><td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:9px;">${rev.usuario||'—'}</td>
          <td style="padding:4px 8px;border:1px solid #c8d6c8;background:#e8f0e8;font-weight:700;color:#006847;font-size:8px;width:90px;">NO. SERIE</td><td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:9px;">${rev.noSerie||'—'}</td>
        </tr></table>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          <thead><tr style="background:#006847;color:white;"><th style="padding:5px 8px;border:1px solid #005c3a;font-size:8px;width:60px;">CRITERIO</th><th style="padding:5px 8px;border:1px solid #005c3a;font-size:8px;text-align:left;">ACTIVIDAD</th><th style="padding:5px 6px;border:1px solid #005c3a;font-size:8px;width:30px;">SI</th><th style="padding:5px 6px;border:1px solid #005c3a;font-size:8px;width:30px;">NO</th></tr></thead>
          <tbody>${critRows}</tbody>
        </table>
        <div style="text-align:center;padding:8px;border:2px solid ${pct>=80?'#006847':'#f57f17'};border-radius:4px;background:${pct>=80?'#e8f5e9':'#fff8e1'};margin-bottom:8px;">
          <div style="font-size:8px;color:#666;">CALIFICACIÓN</div><div style="font-size:22px;font-weight:800;color:${pct>=80?'#006847':'#f57f17'};">${pct}%</div>
        </div>
        ${rev.observaciones?`<div style="padding:6px 10px;background:#f5f5f5;border:1px solid #ddd;border-radius:3px;font-size:9px;margin-bottom:6px;"><strong style="color:#006847;">Observaciones:</strong> ${rev.observaciones}</div>`:''}
        <div style="display:flex;justify-content:space-between;margin-top:60px;">
          <div style="width:42%;text-align:center;"><div style="border-top:1px solid #333;margin-bottom:5px;"></div><div style="font-size:7px;color:#999;text-transform:uppercase;">Usuario del equipo</div><div style="font-size:9px;font-weight:600;">${rev.usuario||'—'}</div></div>
          <div style="width:42%;text-align:center;"><div style="border-top:1px solid #333;margin-bottom:5px;"></div><div style="font-size:7px;color:#999;text-transform:uppercase;">Evaluador</div><div style="font-size:9px;font-weight:600;">${rev.evaluador||'—'}</div></div>
        </div>
      </div>`;
    }).join("");

    const container = document.createElement('div');
    container.innerHTML = pages;
    document.body.appendChild(container);

    try {
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `Criteria_StockBase_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      }).from(container).save();
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", padding: "16px 20px" }}>
      {showStats && (() => {
        const total = criterios.length;
        const promedioGral = total > 0 ? Math.round(criterios.reduce((s, c) => s + (c.calificacion || 0), 0) / total) : 0;
        const perfectos = criterios.filter(c => (c.calificacion || 0) === 100).length;
        const bajos = criterios.filter(c => (c.calificacion || 0) < 50).length;
        const statCard = (label, value, color, sub) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}30`, borderRadius: 10, padding: "10px 16px", minWidth: 90, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, fontWeight: 600 }}>{label}</div>
            {sub && <div style={{ fontSize: 9, color: "#475569", marginTop: 1 }}>{sub}</div>}
          </div>
        );
        return (
          <div style={{ padding: "0 0 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {statCard("REVISIONES", total, "#60a5fa")}
            {statCard("PROMEDIO", promedioGral + "%", promedioGral >= 80 ? "#22c55e" : "#f59e0b")}
            {statCard("100%", perfectos, "#22c55e", "perfectos")}
            {statCard("< 50%", bajos, "#ef4444", "requieren atención")}
          </div>
        );
      })()}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {!readOnly && <button onClick={() => { setShowForm(!showForm); setCritDraft(null); setSelectedEquipoId(""); setFilterUnidadForm(""); setFilterDeptForm(""); }} style={{ padding: "10px 24px", background: showForm ? "rgba(100,116,139,0.2)" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          {showForm ? "✕ Cerrar formulario" : "🔐 Nueva Revisión de Criterios"}
        </button>}
        {!showForm && <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar folio, serie, área, evaluador..." style={{ flex: 1, minWidth: 200, ...inputStyle }} />
          <select value={filterArea} onChange={e => setFilterArea(e.target.value)} style={{ ...inputStyle, width: "auto", color: "#94a3b8", maxWidth: 200 }}>
            <option value="">Todas las áreas</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={() => setShowStats(v => !v)} style={{ ...btnStyle(showStats ? "#60a5fa" : "#475569"), background: showStats ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.04)" }}>📊 Stats</button>
          <button onClick={exportarCriterios} style={btnStyle("#10b981")}>📊 Exportar Excel</button>
          <button onClick={() => exportarPDFCrit(filtered)} style={btnStyle("#ef4444")}>📕 Exportar PDF</button>
          <button onClick={() => imprimirMultipleCrit(new Set(filtered.map(c => c.id)))} style={btnStyle("#8b5cf6")}>📄 Imprimir filtrados ({filtered.length})</button>
          <button onClick={generarFormatoVacioCriterios} style={btnStyle("#006847")}>📄 Formato vacío</button>
        </>}
      </div>
      {showForm && (
        <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#f59e0b" }}>🔐 Nueva Revisión de Criterios</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3, fontWeight: 600 }}>UNIDAD</label>
              <select value={filterUnidadForm} onChange={e => { setFilterUnidadForm(e.target.value); setFilterDeptForm(""); setSelectedEquipoId(""); setCritDraft(null); }} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Todas</option>
                {unidadesForm.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3, fontWeight: 600 }}>DEPARTAMENTO</label>
              <select value={filterDeptForm} onChange={e => { setFilterDeptForm(e.target.value); setSelectedEquipoId(""); setCritDraft(null); }} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Todos</option>
                {deptsForm.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3, fontWeight: 600 }}>EQUIPO</label>
              <select value={selectedEquipoId} onChange={e => selectEquipoCrit(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">— Seleccionar equipo —</option>
                {equiposForm.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.area} — {eq.tipoEquipo} — {eq.marca} {eq.modelo} ({eq.noSerie || "sin serie"})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {critDraft && selEquipo && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Evaluador</label>
                  <ResponsableSelect value={critDraft.evaluador} onChange={v => setCritDraft(p => ({ ...p, evaluador: v }))} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Matrícula evaluador</label>
                  <input value={critDraft.matriculaEval} onChange={e => setCritDraft(p => ({ ...p, matriculaEval: e.target.value }))} placeholder="Matrícula" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Usuario del equipo</label>
                  <input value={critDraft.usuario} onChange={e => setCritDraft(p => ({ ...p, usuario: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Matrícula usuario</label>
                  <input value={critDraft.matriculaUsuario} onChange={e => setCritDraft(p => ({ ...p, matriculaUsuario: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              {CRITERIOS_SECTIONS.map(sec => {
                const done = sec.items.filter(i => critDraft[i.key]).length;
                const total = sec.items.length;
                return (
                  <div key={sec.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12 }}>{sec.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sec.color, textTransform: "uppercase" }}>{sec.label}</span>
                      <span style={{ fontSize: 10, color: "#64748b" }}>({done}/{total})</span>
                      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(done / total) * 100}%`, background: sec.color, borderRadius: 2 }} />
                      </div>
                      <button onClick={() => { const allDone = sec.items.every(i => critDraft[i.key]); const upd = { ...critDraft }; sec.items.forEach(i => upd[i.key] = !allDone); upd.calificacion = calcCalif(upd); setCritDraft(upd); }} style={{ padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#94a3b8", fontSize: 9, cursor: "pointer" }}>
                        {sec.items.every(i => critDraft[i.key]) ? "↩" : "✓ Todo"}
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 4 }}>
                      {sec.items.map(item => (
                        <div key={item.key} onClick={() => toggleCritDraft(item.key)} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 10px", background: critDraft[item.key] ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (critDraft[item.key] ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"), borderRadius: 8, cursor: "pointer" }}>
                          <CheckBox checked={critDraft[item.key]} onChange={() => {}} size={18} />
                          <div>
                            <div style={{ fontSize: 11, color: critDraft[item.key] ? "#86efac" : "#94a3b8", fontWeight: 600 }}>
                              <span style={{ color: "#64748b", fontSize: 9, marginRight: 4 }}>[{item.code}]</span>
                              {item.label}
                            </div>
                            <div style={{ fontSize: 9, color: "#475569", marginTop: 1 }}>{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0" }}>
                <span style={{ fontSize: 11, color: "#64748b" }}>Calificación:</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: critDraft.calificacion >= 80 ? "#22c55e" : critDraft.calificacion >= 50 ? "#f59e0b" : "#ef4444" }}>
                  {critDraft.calificacion}%
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Soporte proporcionado</label>
                  <textarea value={critDraft.soporte} onChange={e => setCritDraft(p => ({ ...p, soporte: e.target.value }))} rows={2} placeholder="Soporte brindado..." style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Observaciones</label>
                  <textarea value={critDraft.observaciones} onChange={e => setCritDraft(p => ({ ...p, observaciones: e.target.value }))} rows={2} placeholder="Observaciones..." style={{ ...inputStyle, resize: "vertical" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowForm(false); setCritDraft(null); }} style={btnStyle("#94a3b8")}>Cancelar</button>
                <button onClick={guardarCrit} style={{ ...btnStyle("#22c55e"), background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff" }}>✅ Guardar Revisión</button>
              </div>
            </>
          )}
        </div>
      )}
      {checkedCritIds.size > 0 && (
        <div style={{ padding: "6px 16px", background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", gap: 10, marginBottom: 8, borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: "#fbbf24" }}>{checkedCritIds.size} revisión(es) seleccionada(s)</span>
          <button onClick={() => imprimirMultipleCrit(checkedCritIds)} style={btnStyle("#3b82f6")}>📄 Imprimir seleccionados</button>
          <button onClick={() => setCheckedCritIds(new Set())} style={btnStyle("#94a3b8")}>✕ Cancelar</button>
        </div>
      )}
      {!showForm && <div style={{ overflowX: "auto", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", width: 36 }}>
                <input type="checkbox" checked={filtered.length > 0 && filtered.every(c => checkedCritIds.has(c.id))} onChange={e => { if (e.target.checked) { setCheckedCritIds(new Set(filtered.map(c => c.id))); } else { setCheckedCritIds(new Set()); } }} style={{ cursor: "pointer" }} />
              </th>
              {["Folio", "Fecha", "Serie", "Área", "Usuario", "Evaluador", "Calificación", "Acciones"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#64748b", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(rev => {
              const pct = rev.calificacion || 0;
              const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
              const isExp = expandedId === rev.id;
              return (
                <React.Fragment key={rev.id}>
                  <tr onClick={() => setExpandedId(isExp ? null : rev.id)} style={{ cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "8px 12px", width: 36 }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={checkedCritIds.has(rev.id)} onChange={e => { const next = new Set(checkedCritIds); e.target.checked ? next.add(rev.id) : next.delete(rev.id); setCheckedCritIds(next); }} style={{ cursor: "pointer" }} />
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{rev.folio}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#94a3b8" }}>{rev.fecha}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#cbd5e1", fontFamily: "monospace" }}>{rev.noSerie}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#cbd5e1" }}>{rev.area}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#cbd5e1" }}>{rev.usuario}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#60a5fa" }}>{rev.evaluador}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 60, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => generarHTMLCriterios(rev)} style={btnStyle("#3b82f6")} title="Imprimir">📄</button>
                        {onEliminar && <button onClick={() => { if (window.confirm("¿Eliminar esta revisión?")) onEliminar(rev.id); }} style={btnStyle("#ef4444")} title="Eliminar">🗑️</button>}
                      </div>
                    </td>
                  </tr>
                  {isExp && (
                    <tr>
                      <td colSpan={9} style={{ padding: "12px 16px", background: "rgba(245,158,11,0.04)", borderBottom: "2px solid rgba(245,158,11,0.2)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 4 }}>
                          {ALL_CRITERIOS.map(item => (
                            <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 8px", fontSize: 10, color: rev[item.key] ? "#86efac" : "#f87171" }}>
                              <span>{rev[item.key] ? "✅" : "❌"}</span>
                              <span style={{ color: "#94a3b8" }}>[{item.code}]</span>
                              {item.label}
                            </div>
                          ))}
                        </div>
                        {(rev.observaciones || rev.soporte) && (
                          <div style={{ marginTop: 8, display: "flex", gap: 12, fontSize: 11 }}>
                            {rev.soporte && <div><span style={{ color: "#3b82f6", fontWeight: 600 }}>Soporte:</span> <span style={{ color: "#cbd5e1" }}>{rev.soporte}</span></div>}
                            {rev.observaciones && <div><span style={{ color: "#f59e0b", fontWeight: 600 }}>Obs:</span> <span style={{ color: "#cbd5e1" }}>{rev.observaciones}</span></div>}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={9} style={{ padding: 30, textAlign: "center", color: "#475569" }}>No hay revisiones de criterios</td></tr>}
          </tbody>
        </table>
      </div>}
    </div>
  );
}

// ── MantenimientoEquipoTab ────────────────────────────────────────────────────
function MantenimientoEquipoTab({ equipo, mantenimientos, onCrear, onEliminar }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(null);

  const mis = mantenimientos.filter(m => m.equipoId === equipo.id);

  const initDraft = () => {
    const tipo = (equipo.tipoEquipo === "IMPRESORA") ? "IMPRESORA" : "PC";
    return {
      id: "mant_" + Date.now(),
      equipoId: equipo.id,
      tipo,
      fecha: new Date().toISOString().split("T")[0],
      sede: "Main Warehouse",
      lugar: equipo.area || "",
      responsable: getResponsableDefault(),
      matriculaResponsable: "",
      noSerie: equipo.noSerie || "",
      area: equipo.area || "",
      fueraServicio: false,
      ...Object.fromEntries(ALL_MANT_KEYS.map(k => [k, false])),
      hora: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false }),
      nombreUsuario: [equipo.nombres, equipo.apPaterno].filter(Boolean).join(" "),
      matriculaUsuario: equipo.matricula || "",
      nombreResponsable: "",
      condiciones: "",
      fotos: [],
    };
  };

  const toggleCheck = (key) => {
    setDraft(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addFoto = async (file) => {
    if (!file) return;
    if (draft.fotos.length >= 5) { alert("Máximo 5 fotos por registro"); return; }
    const base64 = await compressImage(file);
    setDraft(prev => ({ ...prev, fotos: [...prev.fotos, { tipo: "imagen", data: base64 }] }));
  };

  const addFotoTexto = () => {
    const nota = prompt("Descripción de la evidencia fotográfica:");
    if (nota && nota.trim()) {
      setDraft(prev => ({ ...prev, fotos: [...prev.fotos, { tipo: "texto", data: nota.trim() }] }));
    }
  };

  const removeFoto = (idx) => {
    setDraft(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== idx) }));
  };

  const guardar = async () => {
    console.log('[guardar mant EquipoTab]', draft);
    try {
      await onCrear(draft);
      setShowForm(false);
      setDraft(null);
    } catch (err) {
      console.error('[guardar mant EquipoTab] error:', err);
      alert('Error al guardar mantenimiento: ' + (err?.message || err));
    }
  };

  return (
    <div>
      {/* Historial */}
      {mis.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>
            Historial de mantenimientos ({mis.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mis.map(m => {
              const checklist = MANT_CHECKLISTS[m.tipo] || MANT_CHECKLISTS.PC;
              const allItems = checklist.flatMap(s => s.items);
              const done = allItems.filter(i => m[i.key]).length;
              const total = allItems.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const fotosCount = (m.fotos || []).length;
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, color: "#06b6d4", fontWeight: 700, minWidth: 50 }}>#{m.folio}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", minWidth: 80 }}>{m.fecha}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: m.tipo === "IMPRESORA" ? "rgba(236,72,153,0.12)" : "rgba(59,130,246,0.12)", color: m.tipo === "IMPRESORA" ? "#ec4899" : "#3b82f6", fontWeight: 600 }}>{m.tipo}</span>
                  <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: "#06b6d4", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#06b6d4", fontWeight: 600 }}>{done}/{total}</span>
                  {fotosCount > 0 && <span style={{ fontSize: 10, color: "#64748b" }}>📷 {fotosCount}</span>}
                  <span style={{ fontSize: 10, color: "#64748b" }}>{m.responsable}</span>
                  <button onClick={() => generarHTMLMantenimiento(m)} style={btnStyle("#3b82f6")} title="Imprimir">📄</button>
                  {onEliminar && <button onClick={() => { if (window.confirm("¿Eliminar?")) onEliminar(m.id); }} style={btnStyle("#ef4444")} title="Eliminar">🗑️</button>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Botón / Formulario */}
      {!showForm ? (
        onCrear && <button onClick={() => { setDraft(initDraft()); setShowForm(true); }} style={{ padding: "10px 20px", background: "linear-gradient(135deg,#06b6d4,#0891b2)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          🔧 Nuevo Mantenimiento Preventivo
        </button>
      ) : draft && (
        <div style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontSize: 14, color: "#06b6d4" }}>🔧 Mantenimiento — {draft.tipo} — #{equipo.no}</h4>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8, marginBottom: 14, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11 }}><span style={{ color: "#64748b" }}>Tipo: </span><span style={{ color: draft.tipo === "IMPRESORA" ? "#ec4899" : "#3b82f6", fontWeight: 600 }}>{draft.tipo}</span></div>
            <div style={{ fontSize: 11 }}><span style={{ color: "#64748b" }}>Serie: </span><span style={{ color: "#cbd5e1", fontFamily: "monospace" }}>{draft.noSerie}</span></div>
            <div style={{ fontSize: 11 }}><span style={{ color: "#64748b" }}>Área: </span><span style={{ color: "#cbd5e1" }}>{draft.area}</span></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3, fontWeight: 600 }}>RESPONSABLE DEL MANTENIMIENTO</label>
              <ResponsableSelect value={draft.responsable} onChange={v => setDraft(p => ({ ...p, responsable: v }))} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Matrícula del responsable</label>
              <input value={draft.matriculaResponsable || ""} onChange={e => setDraft(p => ({ ...p, matriculaResponsable: e.target.value }))} placeholder="Matrícula" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Usuario del equipo</label>
              <input value={draft.nombreUsuario} onChange={e => setDraft(p => ({ ...p, nombreUsuario: e.target.value }))} placeholder="Nombre del usuario" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Matrícula usuario</label>
              <input value={draft.matriculaUsuario || ""} onChange={e => setDraft(p => ({ ...p, matriculaUsuario: e.target.value }))} placeholder="Matrícula" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Hora</label>
              <input type="time" value={draft.hora} onChange={e => setDraft(p => ({ ...p, hora: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Fecha</label>
              <input type="date" value={draft.fecha} onChange={e => setDraft(p => ({ ...p, fecha: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>EQUIPO FUERA DE SERVICIO:</label>
            <CheckBox checked={draft.fueraServicio} onChange={() => setDraft(p => ({ ...p, fueraServicio: !p.fueraServicio }))} size={20} />
            <span style={{ fontSize: 11, color: draft.fueraServicio ? "#ef4444" : "#22c55e", fontWeight: 600 }}>{draft.fueraServicio ? "SÍ" : "NO"}</span>
          </div>

          {(MANT_CHECKLISTS[draft.tipo] || MANT_CHECKLISTS.PC).map(sec => {
            const done = sec.items.filter(i => draft[i.key]).length;
            const total = sec.items.length;
            return (
              <div key={sec.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span>{sec.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sec.color, textTransform: "uppercase" }}>{sec.label}</span>
                  <span style={{ fontSize: 10, color: "#64748b" }}>({done}/{total})</span>
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${total > 0 ? (done / total) * 100 : 0}%`, background: sec.color, borderRadius: 2 }} />
                  </div>
                  <button onClick={() => { const allDone = sec.items.every(i => draft[i.key]); const upd = { ...draft }; sec.items.forEach(i => upd[i.key] = !allDone); setDraft(upd); }} style={{ padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#94a3b8", fontSize: 9, cursor: "pointer" }}>
                    {sec.items.every(i => draft[i.key]) ? "↩" : "✓ Todo"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 4 }}>
                  {sec.items.map(item => (
                    <div key={item.key} onClick={() => toggleCheck(item.key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: draft[item.key] ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (draft[item.key] ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"), borderRadius: 8, cursor: "pointer" }}>
                      <CheckBox checked={draft[item.key]} onChange={() => {}} size={18} />
                      <span style={{ fontSize: 11, color: draft[item.key] ? "#86efac" : "#94a3b8" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ marginBottom: 14, padding: "10px 12px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase" }}>📷 Evidencia Fotográfica</span>
              <span style={{ fontSize: 10, color: "#64748b" }}>({draft.fotos.length}/5)</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {draft.fotos.map((f, i) => (
                <div key={i} style={{ position: "relative", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {f.tipo === "imagen" ? (
                    <img src={f.data} alt={`Foto ${i + 1}`} style={{ width: 100, height: 75, objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: 100, height: 75, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", padding: 6 }}>
                      <span style={{ fontSize: 9, color: "#94a3b8", textAlign: "center" }}>📝 {f.data.slice(0, 30)}</span>
                    </div>
                  )}
                  <button onClick={() => removeFoto(i)} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <label style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #8b5cf633", background: "#8b5cf615", color: "#8b5cf6", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                📷 Subir Foto
                <input type="file" accept="image/*" onChange={e => addFoto(e.target.files[0])} style={{ display: "none" }} />
              </label>
              <button onClick={addFotoTexto} style={btnStyle("#64748b")}>📝 Nota de texto</button>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Condiciones y/o recomendaciones</label>
            <textarea value={draft.condiciones} onChange={e => setDraft(p => ({ ...p, condiciones: e.target.value }))} rows={2} placeholder="Condiciones, recomendaciones..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => { setShowForm(false); setDraft(null); }} style={btnStyle("#94a3b8")}>Cancelar</button>
            <button onClick={guardar} style={{ ...btnStyle("#06b6d4"), background: "linear-gradient(135deg,#06b6d4,#0891b2)", color: "#fff" }}>✅ Guardar Mantenimiento</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MantenimientoMainTab ──────────────────────────────────────────────────────
function MantenimientoMainTab({ mantenimientos, equipos, onCrear, onEliminar, readOnly }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [selectedEquipoId, setSelectedEquipoId] = useState("");
  const [draft, setDraft] = useState(null);
  const [filterUnidadMant, setFilterUnidadMant] = useState("");
  const [filterDeptMant, setFilterDeptMant] = useState("");
  const [checkedMantIds, setCheckedMantIds] = useState(new Set());

  const selEquipo = equipos.find(e => e.id === selectedEquipoId);

  const unidadesMant = [...new Set(equipos.map(e => e.unidad).filter(Boolean))].sort();
  const deptsMant = [...new Set(
    equipos
      .filter(e => e.tipoEquipo === "PC" || e.tipoEquipo === "LAPTOP" || e.tipoEquipo === "IMPRESORA")
      .filter(e => !filterUnidadMant || (e.unidad || '') === filterUnidadMant)
      .map(e => getDeptCategory(e.area))
  )].sort();
  const equiposMant = equipos
    .filter(e => e.activo !== 0)
    .filter(e => e.tipoEquipo === "PC" || e.tipoEquipo === "LAPTOP" || e.tipoEquipo === "IMPRESORA")
    .filter(e => !filterUnidadMant || (e.unidad || '') === filterUnidadMant)
    .filter(e => !filterDeptMant || getDeptCategory(e.area) === filterDeptMant)
    .sort((a, b) => (a.area || "").localeCompare(b.area || ""));

  const initDraft = (eq) => {
    const tipo = (eq.tipoEquipo === "IMPRESORA") ? "IMPRESORA" : "PC";
    return {
      id: "mant_" + Date.now(),
      equipoId: eq.id,
      tipo,
      fecha: new Date().toISOString().split("T")[0],
      sede: "Main Warehouse",
      lugar: eq.area || "",
      responsable: getResponsableDefault(),
      matriculaResponsable: "",
      noSerie: eq.noSerie || "",
      area: eq.area || "",
      fueraServicio: false,
      ...Object.fromEntries(ALL_MANT_KEYS.map(k => [k, false])),
      hora: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false }),
      nombreUsuario: [eq.nombres, eq.apPaterno].filter(Boolean).join(" "),
      matriculaUsuario: eq.matricula || "",
      nombreResponsable: "",
      condiciones: "",
      fotos: [],
      firmaUsuario: "",
    };
  };

  const selectEquipo = (eqId) => {
    setSelectedEquipoId(eqId);
    const eq = equipos.find(e => e.id === eqId);
    if (eq) setDraft(initDraft(eq));
  };

  const toggleCheck = (key) => {
    setDraft(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addFoto = async (file) => {
    if (!file) return;
    if (draft.fotos.length >= 5) { alert("Máximo 5 fotos por registro"); return; }
    const base64 = await compressImage(file);
    setDraft(prev => ({ ...prev, fotos: [...prev.fotos, { tipo: "imagen", data: base64 }] }));
  };

  const addFotoTexto = () => {
    const nota = prompt("Descripción de la evidencia fotográfica:");
    if (nota && nota.trim()) {
      setDraft(prev => ({ ...prev, fotos: [...prev.fotos, { tipo: "texto", data: nota.trim() }] }));
    }
  };

  const removeFoto = (idx) => {
    setDraft(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== idx) }));
  };

  const guardar = async () => {
    console.log('[guardar mant MainTab]', draft);
    try {
      await onCrear(draft);
      setShowForm(false);
      setDraft(null);
      setSelectedEquipoId("");
    } catch (err) {
      console.error('[guardar mant MainTab] error:', err);
      alert('Error al guardar mantenimiento: ' + (err?.message || err));
    }
  };

  const filtered = mantenimientos.filter(m => {
    if (filterTipo && m.tipo !== filterTipo) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return [m.noSerie, m.area, m.responsable, String(m.folio), m.nombreUsuario].some(v => v && v.toLowerCase().includes(s));
  });

  const imprimirMultipleMant = (ids) => {
    const items = mantenimientos.filter(m => ids.has(m.id));
    if (items.length === 0) return;
    const pages = items.map(m => {
      const tipo = m.tipo || "PC";
      const checklist = MANT_CHECKLISTS[tipo] || MANT_CHECKLISTS.PC;
      const fecha = new Date(m.fecha).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
      const allItems = checklist.flatMap(s => s.items);
      const done = allItems.filter(i => m[i.key]).length;
      const total = allItems.length;
      const checkRows = checklist.map(sec => {
        const header = `<tr><td colspan="3" style="background:#006847; color:white; padding:4px 8px; font-weight:700; font-size:9px; border:1px solid #005c3a;">${sec.label.toUpperCase()}</td></tr>`;
        const rows = sec.items.map((item, idx) => `
        <tr style="background:${idx % 2 === 0 ? '#f0f8f0' : '#fff'}">
          <td style="padding:6px 10px; border:1px solid #c8d6c8; font-size:10px;">${item.label}</td>
          <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-weight:700; font-size:8px; background:${m[item.key] ? '#e8f5e9' : '#fff'}; color:${m[item.key] ? '#006847' : '#999'}">${m[item.key] ? '✓' : ''}</td>
          <td style="padding:4px 6px; border:1px solid #c8d6c8; text-align:center; width:30px; font-weight:700; font-size:8px; background:${!m[item.key] ? '#fce4ec' : '#fff'}; color:${!m[item.key] ? '#c62828' : '#999'}">${!m[item.key] ? '✓' : ''}</td>
        </tr>`).join("");
        return header + rows;
      }).join("");
      return `
    <div style="page-break-after: always;">
      <div style="display:flex; align-items:center; justify-content:space-between; border:2px solid #006847; border-radius:4px; padding:10px 16px; margin-bottom:10px;">
        <img src="/logo.svg" alt="Enterprise" style="height:50px;" />
        <div style="text-align:center; flex:1;"><h1 style="font-size:14px; color:#006847; text-transform:uppercase; letter-spacing:1px;">Preventive Maintenance Control</h1><p style="font-size:9px; color:#666;">StockBase — Main Facility</p></div>
        <div style="text-align:right;"><div style="font-size:13px; font-weight:800; color:#006847;">FOLIO: ${m.folio}</div><div style="font-size:9px; color:#666;">${fecha}</div><div style="font-size:10px; font-weight:700; color:#006847;">${tipo}</div></div>
      </div>
      <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
        <tr><td style="padding:4px 10px; border:1px solid #c8d6c8; background:#e8f0e8; font-weight:700; color:#006847; width:110px; font-size:9px;">Serie</td><td style="padding:4px 10px; border:1px solid #c8d6c8; font-size:10px;">${m.noSerie || '—'}</td><td style="padding:4px 10px; border:1px solid #c8d6c8; background:#e8f0e8; font-weight:700; color:#006847; width:110px; font-size:9px;">Área</td><td style="padding:4px 10px; border:1px solid #c8d6c8; font-size:10px;">${m.area || '—'}</td><td style="padding:4px 10px; border:1px solid #c8d6c8; background:#e8f0e8; font-weight:700; color:#006847; width:110px; font-size:9px;">Responsable</td><td style="padding:4px 10px; border:1px solid #c8d6c8; font-size:10px;">${m.responsable || '—'}</td></tr>
        <tr><td style="padding:4px 10px; border:1px solid #c8d6c8; background:#e8f0e8; font-weight:700; color:#006847; font-size:9px;">Usuario</td><td style="padding:4px 10px; border:1px solid #c8d6c8; font-size:10px;">${m.nombreUsuario || '—'}</td><td style="padding:4px 10px; border:1px solid #c8d6c8; background:#e8f0e8; font-weight:700; color:#006847; font-size:9px;">Hora</td><td style="padding:4px 10px; border:1px solid #c8d6c8; font-size:10px;">${m.hora || '—'}</td><td style="padding:4px 10px; border:1px solid #c8d6c8; background:#e8f0e8; font-weight:700; color:#006847; font-size:9px;">Fuera servicio</td><td style="padding:4px 10px; border:1px solid #c8d6c8; font-weight:700; color:${m.fueraServicio ? '#c62828' : '#006847'}; font-size:10px;">${m.fueraServicio ? 'SÍ' : 'NO'}</td></tr>
      </table>
      <div style="display:flex; align-items:center; gap:12px; padding:6px 12px; background:#f0f8f0; border:1px solid #c8d6c8; border-radius:4px; margin-bottom:8px;">
        <span style="font-size:14px; font-weight:800; color:#006847;">${done}/${total}</span>
        <span style="font-size:10px; color:#666;">elementos revisados</span>
        <div style="flex:1; height:8px; background:#ddd; border-radius:4px; overflow:hidden;"><div style="height:100%; width:${total > 0 ? Math.round(done/total*100) : 0}%; background:#006847; border-radius:4px;"></div></div>
      </div>
      <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
        <thead><tr style="background:#006847; color:white;"><th style="padding:6px 10px; border:1px solid #005c3a; font-size:9px; text-align:left;">ELEMENTO</th><th style="padding:6px 8px; border:1px solid #005c3a; font-size:9px; text-align:center; width:35px;">SI</th><th style="padding:6px 8px; border:1px solid #005c3a; font-size:9px; text-align:center; width:35px;">NO</th></tr></thead>
        <tbody>${checkRows}</tbody>
      </table>
      <div style="display:flex; justify-content:space-between; margin-top:60px;">
        <div style="width:42%; text-align:center;"><div style="border-top:1px solid #333; margin-bottom:6px;"></div><div style="font-size:8px; color:#999; text-transform:uppercase;">Usuario del Equipo</div><div style="font-size:10px; font-weight:600;">${m.nombreUsuario || '—'}</div></div>
        <div style="width:42%; text-align:center;"><div style="border-top:1px solid #333; margin-bottom:6px;"></div><div style="font-size:8px; color:#999; text-transform:uppercase;">Responsable del Mantenimiento</div><div style="font-size:10px; font-weight:600;">${m.responsable || '—'}</div></div>
      </div>
    </div>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mantenimiento - ${items.length} reportes</title>
    <style>@page { size: landscape; margin: 1cm; } * { margin:0; padding:0; box-sizing:border-box; } body { font-family: Arial, sans-serif; font-size:10px; color:#333; }</style>
    </head><body>${pages}<script>window.onload=function(){window.print()}</script></body></html>`;
    const w = window.open("", "_blank"); w.document.write(html); w.document.close();
  };

  const exportarMant = async () => {
    const XLSX = await import('xlsx-js-style');

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
      fill: { fgColor: { rgb: "006847" }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: { top: {style:"thin"}, bottom: {style:"thin"}, left: {style:"thin"}, right: {style:"thin"} }
    };
    const cellStyle = {
      font: { sz: 9 },
      border: { top: {style:"thin"}, bottom: {style:"thin"}, left: {style:"thin"}, right: {style:"thin"} },
      alignment: { wrapText: true }
    };
    const siStyle = { ...cellStyle, font: { bold: true, color: { rgb: "006847" }, sz: 9 }, fill: { fgColor: { rgb: "E8F5E9" }, patternType: "solid" }, alignment: { horizontal: "center" } };
    const noStyle = { ...cellStyle, font: { bold: true, color: { rgb: "C62828" }, sz: 9 }, fill: { fgColor: { rgb: "FCE4EC" }, patternType: "solid" }, alignment: { horizontal: "center" } };
    const titleStyle = { font: { bold: true, color: { rgb: "006847" }, sz: 14 }, alignment: { horizontal: "center" } };

    const wb = XLSX.utils.book_new();

    const data = filtered.map(m => {
      const checklist = MANT_CHECKLISTS[m.tipo] || MANT_CHECKLISTS.PC;
      const allItems = checklist.flatMap(s => s.items);
      return {
        "Folio": m.folio, "Fecha": m.fecha, "Tipo": m.tipo, "Serie": m.noSerie || "",
        "Área": m.area || "", "Responsable": m.responsable || "",
        "Matrícula responsable": m.matriculaResponsable || "",
        "Fuera de Servicio": m.fueraServicio ? "SI" : "NO",
        ...Object.fromEntries(allItems.map(i => [i.label, m[i.key] ? "SI" : "NO"])),
        "Hora": m.hora || "", "Usuario": m.nombreUsuario || "",
        "Condiciones": m.condiciones || "", "Fotos": (m.fotos || []).length,
      };
    });

    const ws = XLSX.utils.aoa_to_sheet([["Preventive Maintenance Control — StockBase Headquarters"]]);
    XLSX.utils.sheet_add_json(ws, data, { origin: "A2" });

    ws["A1"].s = titleStyle;
    const cols = Object.keys(data[0] || {});
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: cols.length - 1 } }];

    cols.forEach((_, ci) => {
      const addr = XLSX.utils.encode_cell({ r: 1, c: ci });
      if (ws[addr]) ws[addr].s = headerStyle;
    });

    data.forEach((row, ri) => {
      cols.forEach((col, ci) => {
        const addr = XLSX.utils.encode_cell({ r: ri + 2, c: ci });
        if (!ws[addr]) return;
        const val = ws[addr].v;
        if (val === "SI") ws[addr].s = siStyle;
        else if (val === "NO") ws[addr].s = noStyle;
        else if (ri % 2 === 1) ws[addr].s = { ...cellStyle, fill: { fgColor: { rgb: "F0F8F0" }, patternType: "solid" } };
        else ws[addr].s = cellStyle;
      });
    });

    ws["!rows"] = [{ hpt: 24 }, { hpt: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, "Mantenimiento");
    XLSX.writeFile(wb, `Maintenance_StockBase_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportarPDFMant = async (mants) => {
    const html2pdf = (await import('html2pdf.js')).default;

    const pages = mants.map(m => {
      const tipo = m.tipo || "PC";
      const checklist = MANT_CHECKLISTS[tipo] || MANT_CHECKLISTS.PC;
      const fecha = new Date(m.fecha).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
      const allItems = checklist.flatMap(s => s.items);
      const done = allItems.filter(i => m[i.key]).length;
      const total = allItems.length;

      const checkRows = checklist.map(sec => {
        const header = `<tr><td colspan="3" style="background:#006847;color:white;padding:6px 10px;font-weight:700;font-size:10px;border:1px solid #005c3a;">${sec.label.toUpperCase()}</td></tr>`;
        const rows = sec.items.map((item, idx) => `
          <tr style="background:${idx%2===0?'#f0f8f0':'#fff'}">
            <td style="padding:5px 8px;border:1px solid #c8d6c8;font-size:9px">${item.label}</td>
            <td style="padding:5px 6px;border:1px solid #c8d6c8;text-align:center;width:30px;font-weight:700;font-size:9px;color:${m[item.key]?'#006847':'#ccc'}">${m[item.key]?'✓':''}</td>
            <td style="padding:5px 6px;border:1px solid #c8d6c8;text-align:center;width:30px;font-weight:700;font-size:9px;color:${!m[item.key]?'#c62828':'#ccc'}">${!m[item.key]?'✓':''}</td>
          </tr>`).join("");
        return header + rows;
      }).join("");

      const fotosHtml = (m.fotos||[]).length > 0 ? `
        <div style="margin-top:8px;">
          <div style="background:#006847;color:white;padding:4px 10px;font-weight:700;font-size:9px;border-radius:3px 3px 0 0;">EVIDENCIA FOTOGRÁFICA</div>
          <div style="border:1px solid #c8d6c8;border-top:none;padding:6px;display:flex;flex-wrap:wrap;gap:4px;">
            ${(m.fotos||[]).map(f => f.tipo==="imagen"?`<img src="${f.data}" style="max-width:150px;max-height:110px;border:1px solid #ddd;border-radius:2px;"/>`:`<div style="padding:6px;background:#f5f5f5;border:1px solid #ddd;border-radius:2px;font-size:8px;max-width:150px;">📝 ${f.data}</div>`).join("")}
          </div>
        </div>` : '';

      return `<div style="page-break-after:always;padding:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #006847;padding-bottom:8px;margin-bottom:10px;">
          <img src="/logo.svg" style="height:45px;" />
          <div style="text-align:center;flex:1;"><div style="font-size:13px;font-weight:700;color:#006847;">PREVENTIVE MAINTENANCE CONTROL</div><div style="font-size:8px;color:#666;">StockBase — Main Facility</div></div>
          <div style="text-align:right;"><div style="font-size:11px;font-weight:800;color:#006847;">FOLIO: ${m.folio}</div><div style="font-size:8px;color:#666;">${fecha}</div><div style="font-size:9px;font-weight:700;color:#006847;">${tipo}</div></div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:6px;"><tr>
          <td style="padding:4px 8px;border:1px solid #c8d6c8;background:#e8f0e8;font-weight:700;color:#006847;font-size:8px;width:90px;">SEDE</td><td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:9px;">${m.sede||'Main Warehouse'}</td>
          <td style="padding:4px 8px;border:1px solid #c8d6c8;background:#e8f0e8;font-weight:700;color:#006847;font-size:8px;width:90px;">ÁREA</td><td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:9px;">${m.area||'—'}</td>
          <td style="padding:4px 8px;border:1px solid #c8d6c8;background:#e8f0e8;font-weight:700;color:#006847;font-size:8px;width:90px;">SERIE</td><td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:9px;">${m.noSerie||'—'}</td>
        </tr><tr>
          <td style="padding:4px 8px;border:1px solid #c8d6c8;background:#e8f0e8;font-weight:700;color:#006847;font-size:8px;">RESPONSABLE</td><td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:9px;">${m.responsable||'—'}</td>
          <td style="padding:4px 8px;border:1px solid #c8d6c8;background:#e8f0e8;font-weight:700;color:#006847;font-size:8px;">USUARIO</td><td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:9px;">${m.nombreUsuario||'—'}</td>
          <td style="padding:4px 8px;border:1px solid #c8d6c8;background:#e8f0e8;font-weight:700;color:#006847;font-size:8px;">HORA</td><td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:9px;">${m.hora||'—'}</td>
        </tr></table>
        <div style="display:flex;align-items:center;gap:10px;padding:5px 10px;background:#f0f8f0;border:1px solid #c8d6c8;border-radius:3px;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:800;color:#006847;">${done}/${total}</span>
          <span style="font-size:9px;color:#666;">elementos revisados</span>
          <div style="flex:1;height:6px;background:#ddd;border-radius:3px;overflow:hidden;"><div style="height:100%;width:${total>0?(done/total*100):0}%;background:#006847;border-radius:3px;"></div></div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
          <thead><tr style="background:#006847;color:white;"><th style="padding:5px 8px;border:1px solid #005c3a;font-size:8px;text-align:left;">ELEMENTO</th><th style="padding:5px 6px;border:1px solid #005c3a;font-size:8px;width:30px;">SI</th><th style="padding:5px 6px;border:1px solid #005c3a;font-size:8px;width:30px;">NO</th></tr></thead>
          <tbody>${checkRows}</tbody>
        </table>
        ${fotosHtml}
        ${m.condiciones?`<div style="padding:5px 10px;background:#fffde7;border:1px solid #f9a825;border-radius:3px;font-size:9px;margin-top:6px;"><strong style="color:#006847;">Condiciones:</strong> ${m.condiciones}</div>`:''}
        <div style="display:flex;justify-content:space-between;margin-top:60px;">
          <div style="width:42%;text-align:center;"><div style="border-top:1px solid #333;margin-bottom:5px;"></div><div style="font-size:7px;color:#999;text-transform:uppercase;">Usuario del Equipo</div><div style="font-size:9px;font-weight:600;">${m.nombreUsuario||'—'}</div></div>
          <div style="width:42%;text-align:center;"><div style="border-top:1px solid #333;margin-bottom:5px;"></div><div style="font-size:7px;color:#999;text-transform:uppercase;">Responsable del Mantenimiento</div><div style="font-size:9px;font-weight:600;">${m.responsable||'—'}</div></div>
        </div>
      </div>`;
    }).join("");

    const container = document.createElement('div');
    container.innerHTML = pages;
    document.body.appendChild(container);

    try {
      await html2pdf().set({
        margin: [6, 6, 6, 6],
        filename: `Maintenance_StockBase_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'landscape' },
        pagebreak: { mode: ['css', 'legacy'] }
      }).from(container).save();
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", padding: "16px 20px" }}>
      {showStats && (() => {
        const total = mantenimientos.length;
        const pcs = mantenimientos.filter(m => m.tipo === "PC").length;
        const imps = mantenimientos.filter(m => m.tipo === "IMPRESORA").length;
        const hoy = new Date().toISOString().split("T")[0];
        const hoyCount = mantenimientos.filter(m => m.fecha === hoy).length;
        const conFotos = mantenimientos.filter(m => (m.fotos || []).length > 0).length;
        const statCard = (label, value, color, sub) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}30`, borderRadius: 10, padding: "10px 16px", minWidth: 90, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, fontWeight: 600 }}>{label}</div>
            {sub && <div style={{ fontSize: 9, color: "#475569", marginTop: 1 }}>{sub}</div>}
          </div>
        );
        return (
          <div style={{ padding: "0 0 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {statCard("TOTAL", total, "#60a5fa")}
            {statCard("PCs", pcs, "#3b82f6")}
            {statCard("IMPRESORAS", imps, "#ec4899")}
            {statCard("HOY", hoyCount, "#06b6d4")}
            {statCard("CON FOTOS", conFotos, "#8b5cf6")}
          </div>
        );
      })()}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {!readOnly && <button onClick={() => { setShowForm(!showForm); setDraft(null); setSelectedEquipoId(""); }} style={{ padding: "10px 24px", background: showForm ? "rgba(100,116,139,0.2)" : "linear-gradient(135deg,#06b6d4,#0891b2)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          {showForm ? "✕ Cerrar formulario" : "🔧 Nuevo Mantenimiento"}
        </button>}
        {!showForm && <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar folio, serie, responsable..." style={{ flex: 1, minWidth: 200, ...inputStyle }} />
          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ ...inputStyle, width: "auto", color: "#94a3b8" }}>
            <option value="">Todos los tipos</option>
            <option value="PC">💻 PCs</option>
            <option value="IMPRESORA">🖨️ Impresoras</option>
          </select>
          <button onClick={() => setShowStats(v => !v)} style={{ ...btnStyle(showStats ? "#60a5fa" : "#475569"), background: showStats ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.04)" }}>📊 Stats</button>
          <button onClick={exportarMant} style={btnStyle("#10b981")}>📊 Exportar Excel</button>
          <button onClick={() => exportarPDFMant(filtered)} style={btnStyle("#ef4444")}>📕 Exportar PDF</button>
          <button onClick={() => imprimirMultipleMant(new Set(filtered.map(m => m.id)))} style={btnStyle("#8b5cf6")}>📄 Imprimir filtrados ({filtered.length})</button>
          <button onClick={() => generarFormatoVacioMantenimiento("PC")} style={btnStyle("#006847")}>📄 Formato PC</button>
          <button onClick={() => generarFormatoVacioMantenimiento("IMPRESORA")} style={btnStyle("#006847")}>📄 Formato Impresora</button>
        </>}
      </div>
      {showForm && (
        <div style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#06b6d4" }}>🔧 Nuevo Registro de Mantenimiento Preventivo</h4>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3, fontWeight: 600 }}>SELECCIONAR EQUIPO</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8 }}>
              <select value={filterUnidadMant} onChange={e => { setFilterUnidadMant(e.target.value); setFilterDeptMant(""); setSelectedEquipoId(""); setDraft(null); }} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Todas las unidades</option>
                {unidadesMant.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <select value={filterDeptMant} onChange={e => { setFilterDeptMant(e.target.value); setSelectedEquipoId(""); setDraft(null); }} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Todos los dptos.</option>
                {deptsMant.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={selectedEquipoId} onChange={e => selectEquipo(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">— Seleccionar equipo ({equiposMant.length}) —</option>
                {equiposMant.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.area} — {eq.tipoEquipo} — {eq.marca} {eq.modelo} ({eq.noSerie || "sin serie"})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {draft && selEquipo && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8, marginBottom: 14, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 11 }}><span style={{ color: "#64748b" }}>Tipo: </span><span style={{ color: draft.tipo === "IMPRESORA" ? "#ec4899" : "#3b82f6", fontWeight: 600 }}>{draft.tipo}</span></div>
                <div style={{ fontSize: 11 }}><span style={{ color: "#64748b" }}>Serie: </span><span style={{ color: "#cbd5e1", fontFamily: "monospace" }}>{draft.noSerie}</span></div>
                <div style={{ fontSize: 11 }}><span style={{ color: "#64748b" }}>Área: </span><span style={{ color: "#cbd5e1" }}>{draft.area}</span></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3, fontWeight: 600 }}>RESPONSABLE DEL MANTENIMIENTO</label>
                  <ResponsableSelect value={draft.responsable} onChange={v => setDraft(p => ({ ...p, responsable: v }))} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Matrícula del responsable</label>
                  <input value={draft.matriculaResponsable || ""} onChange={e => setDraft(p => ({ ...p, matriculaResponsable: e.target.value }))} placeholder="Matrícula" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Usuario del equipo</label>
                  <input value={draft.nombreUsuario} onChange={e => setDraft(p => ({ ...p, nombreUsuario: e.target.value }))} placeholder="Nombre del usuario" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Matrícula usuario</label>
                  <input value={draft.matriculaUsuario || ""} onChange={e => setDraft(p => ({ ...p, matriculaUsuario: e.target.value }))} placeholder="Matrícula" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Hora</label>
                  <input type="time" value={draft.hora} onChange={e => setDraft(p => ({ ...p, hora: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Fecha</label>
                  <input type="date" value={draft.fecha} onChange={e => setDraft(p => ({ ...p, fecha: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>EQUIPO FUERA DE SERVICIO:</label>
                <CheckBox checked={draft.fueraServicio} onChange={() => setDraft(p => ({ ...p, fueraServicio: !p.fueraServicio }))} size={20} />
                <span style={{ fontSize: 11, color: draft.fueraServicio ? "#ef4444" : "#22c55e", fontWeight: 600 }}>{draft.fueraServicio ? "SÍ" : "NO"}</span>
              </div>
              {(MANT_CHECKLISTS[draft.tipo] || MANT_CHECKLISTS.PC).map(sec => {
                const done = sec.items.filter(i => draft[i.key]).length;
                const total = sec.items.length;
                return (
                  <div key={sec.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span>{sec.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sec.color, textTransform: "uppercase" }}>{sec.label}</span>
                      <span style={{ fontSize: 10, color: "#64748b" }}>({done}/{total})</span>
                      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${total > 0 ? (done / total) * 100 : 0}%`, background: sec.color, borderRadius: 2 }} />
                      </div>
                      <button onClick={() => { const allDone = sec.items.every(i => draft[i.key]); const upd = { ...draft }; sec.items.forEach(i => upd[i.key] = !allDone); setDraft(upd); }} style={{ padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#94a3b8", fontSize: 9, cursor: "pointer" }}>
                        {sec.items.every(i => draft[i.key]) ? "↩" : "✓ Todo"}
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 4 }}>
                      {sec.items.map(item => (
                        <div key={item.key} onClick={() => toggleCheck(item.key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: draft[item.key] ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (draft[item.key] ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"), borderRadius: 8, cursor: "pointer" }}>
                          <CheckBox checked={draft[item.key]} onChange={() => {}} size={18} />
                          <span style={{ fontSize: 11, color: draft[item.key] ? "#86efac" : "#94a3b8" }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ marginBottom: 14, padding: "10px 12px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase" }}>📷 Evidencia Fotográfica</span>
                  <span style={{ fontSize: 10, color: "#64748b" }}>({draft.fotos.length}/5)</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {draft.fotos.map((f, i) => (
                    <div key={i} style={{ position: "relative", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {f.tipo === "imagen" ? (
                        <img src={f.data} alt={`Foto ${i + 1}`} style={{ width: 100, height: 75, objectFit: "cover", display: "block" }} />
                      ) : (
                        <div style={{ width: 100, height: 75, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", padding: 6 }}>
                          <span style={{ fontSize: 9, color: "#94a3b8", textAlign: "center" }}>📝 {f.data.slice(0, 30)}{f.data.length > 30 ? "..." : ""}</span>
                        </div>
                      )}
                      <button onClick={() => removeFoto(i)} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(239,68,68,0.9)", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <label style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #8b5cf633", background: "#8b5cf615", color: "#8b5cf6", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                    📷 Tomar / Subir Foto
                    <input type="file" accept="image/*" capture="environment" onChange={e => addFoto(e.target.files[0])} style={{ display: "none" }} />
                  </label>
                  <button onClick={addFotoTexto} style={btnStyle("#64748b")}>📝 Nota de texto</button>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 3 }}>Condiciones y/o recomendaciones</label>
                <textarea value={draft.condiciones} onChange={e => setDraft(p => ({ ...p, condiciones: e.target.value }))} rows={2} placeholder="Condiciones encontradas, recomendaciones..." style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowForm(false); setDraft(null); }} style={btnStyle("#94a3b8")}>Cancelar</button>
                <button onClick={guardar} style={{ ...btnStyle("#06b6d4"), background: "linear-gradient(135deg,#06b6d4,#0891b2)", color: "#fff" }}>✅ Guardar Mantenimiento</button>
              </div>
            </>
          )}
        </div>
      )}
      {checkedMantIds.size > 0 && (
        <div style={{ padding: "6px 16px", background: "rgba(6,182,212,0.08)", borderBottom: "1px solid rgba(6,182,212,0.2)", display: "flex", alignItems: "center", gap: 10, marginBottom: 8, borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: "#06b6d4" }}>{checkedMantIds.size} mantenimiento(s) seleccionado(s)</span>
          <button onClick={() => imprimirMultipleMant(checkedMantIds)} style={btnStyle("#3b82f6")}>📄 Imprimir seleccionados</button>
          <button onClick={() => setCheckedMantIds(new Set())} style={btnStyle("#94a3b8")}>✕ Cancelar</button>
        </div>
      )}
      {!showForm && (
        <div style={{ overflowX: "auto", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", width: 36 }}>
                  <input type="checkbox" checked={filtered.length > 0 && filtered.every(m => checkedMantIds.has(m.id))} onChange={e => { if (e.target.checked) { setCheckedMantIds(new Set(filtered.map(m => m.id))); } else { setCheckedMantIds(new Set()); } }} style={{ cursor: "pointer" }} />
                </th>
                {["Folio", "Fecha", "Tipo", "Serie", "Área", "Responsable", "Checklist", "Fotos", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#64748b", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const checklist = MANT_CHECKLISTS[m.tipo] || MANT_CHECKLISTS.PC;
                const allItems = checklist.flatMap(s => s.items);
                const done = allItems.filter(i => m[i.key]).length;
                const total = allItems.length;
                const fotosCount = (m.fotos || []).length;
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "8px 12px", width: 36 }}>
                      <input type="checkbox" checked={checkedMantIds.has(m.id)} onChange={e => { const next = new Set(checkedMantIds); e.target.checked ? next.add(m.id) : next.delete(m.id); setCheckedMantIds(next); }} style={{ cursor: "pointer" }} />
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 700, color: "#06b6d4" }}>{m.folio}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#94a3b8" }}>{m.fecha}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: m.tipo === "IMPRESORA" ? "rgba(236,72,153,0.12)" : "rgba(59,130,246,0.12)", color: m.tipo === "IMPRESORA" ? "#ec4899" : "#3b82f6", fontWeight: 600 }}>{m.tipo}</span>
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#cbd5e1", fontFamily: "monospace" }}>{m.noSerie}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#cbd5e1" }}>{m.area}</td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#60a5fa", fontWeight: 600 }}>{m.responsable}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 50, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${total > 0 ? (done / total) * 100 : 0}%`, background: "#06b6d4", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#06b6d4" }}>{done}/{total}</span>
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: fotosCount > 0 ? "#8b5cf6" : "#475569" }}>
                      {fotosCount > 0 ? `📷 ${fotosCount}` : "—"}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => generarHTMLMantenimiento(m)} style={btnStyle("#3b82f6")} title="Imprimir">📄</button>
                        {onEliminar && <button onClick={() => { if (window.confirm("¿Eliminar?")) onEliminar(m.id); }} style={btnStyle("#ef4444")} title="Eliminar">🗑️</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={10} style={{ padding: 30, textAlign: "center", color: "#475569" }}>No hay registros de mantenimiento</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// =============== DASHBOARD PANEL ===============
function DashboardPanel({ equipos, criterios, mantenimientos, tickets }) {
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    import('recharts').then(mod => setCharts(mod));
  }, []);

  if (!charts) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando dashboard...</div>;

  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } = charts;

  const COLORS = ['#006847', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];

  // Datos para gráficas
  const tipoCount = {};
  equipos.forEach(e => { const t = e.tipoEquipo || "OTRO"; tipoCount[t] = (tipoCount[t]||0)+1; });
  const tipoData = Object.entries(tipoCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  const soData = {};
  equipos.forEach(e => { const s = e.so || "SIN S.O."; soData[s] = (soData[s]||0)+1; });
  const soChartData = Object.entries(soData).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  const deptCount = {};
  equipos.forEach(e => { const d = getDeptCategory(e.area); deptCount[d] = (deptCount[d]||0)+1; });
  const deptData = Object.entries(deptCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 12);

  // Criterios: promedio por mes
  const critByMonth = {};
  criterios.forEach(c => {
    const month = (c.fecha || "").slice(0, 7); // YYYY-MM
    if (!month) return;
    if (!critByMonth[month]) critByMonth[month] = { sum: 0, count: 0 };
    critByMonth[month].sum += (c.calificacion || 0);
    critByMonth[month].count++;
  });
  const critTrend = Object.entries(critByMonth).sort().map(([month, d]) => ({
    mes: month,
    promedio: Math.round(d.sum / d.count),
    revisiones: d.count
  }));

  // Mantenimientos por tipo
  const mantByTipo = { PC: 0, IMPRESORA: 0 };
  mantenimientos.forEach(m => { mantByTipo[m.tipo] = (mantByTipo[m.tipo]||0)+1; });
  const mantTipoData = Object.entries(mantByTipo).map(([name, value]) => ({ name, value }));

  // Tickets por estado
  const ticketEstado = { pendiente: 0, proceso: 0, resuelto: 0 };
  tickets.forEach(t => { ticketEstado[t.estado] = (ticketEstado[t.estado]||0)+1; });
  const ticketData = [
    { name: "Pendientes", value: ticketEstado.pendiente, color: "#f59e0b" },
    { name: "En proceso", value: ticketEstado.proceso, color: "#3b82f6" },
    { name: "Resueltos", value: ticketEstado.resuelto, color: "#22c55e" },
  ];

  const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, flex: 1, minWidth: 300 };
  const titleSt = { fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" };

  // ── Builder compartido para los 3 PDFs del dashboard ─────────────────────
  const buildDashboardHtml = (modo) => {
    const fecha = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
    const totalEquipos = equipos.length;

    // Captura SVGs (solo para 'graficas' y 'completo')
    let svgs = [];
    if (modo !== 'tablas') {
      const serializer = new XMLSerializer();
      svgs = Array.from(document.querySelectorAll('.recharts-wrapper svg')).map(svgEl => {
        const clone = svgEl.cloneNode(true);
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', '0'); bg.setAttribute('y', '0');
        bg.setAttribute('width', '100%'); bg.setAttribute('height', '100%');
        bg.setAttribute('fill', 'white');
        clone.insertBefore(bg, clone.firstChild);
        clone.setAttribute('width', '100%');
        clone.removeAttribute('style');
        clone.querySelectorAll('text').forEach(t => {
          if ((t.getAttribute('fill') || '') === '#94a3b8') t.setAttribute('fill', '#444');
        });
        clone.querySelectorAll('line,path').forEach(el => {
          if ((el.getAttribute('stroke') || '').startsWith('rgba(255,255,255')) el.setAttribute('stroke', '#ddd');
        });
        return serializer.serializeToString(clone);
      });
    }

    const chartBlock = (idx) => svgs[idx]
      ? `<div style="background:#fafafa;border:1px solid #e0e8e0;border-radius:4px;padding:8px 4px;margin-bottom:8px;overflow:hidden;">${svgs[idx]}</div>`
      : '';

    // Tablas de barras CSS (solo para 'tablas' y 'completo')
    const barRow = (label, value, max, color) =>
      `<tr><td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:8px;width:160px;">${label}</td>
       <td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:8px;width:36px;text-align:right;font-weight:700;color:${color}">${value}</td>
       <td style="padding:4px 8px;border:1px solid #c8d6c8;">
         <div style="height:8px;background:#e8f0e8;border-radius:2px;overflow:hidden;">
           <div style="height:100%;width:${max > 0 ? Math.round(value / max * 100) : 0}%;background:${color};border-radius:2px;"></div>
         </div></td></tr>`;

    const tipoRows  = tipoData.map(d => barRow(d.name, d.value, totalEquipos, "#006847")).join("");
    const soRows    = soChartData.map(d => barRow(d.name, d.value, totalEquipos, "#3b82f6")).join("");
    const deptRows  = deptData.map(d => barRow(d.name, d.value, deptData[0]?.value || 1, "#8b5cf6")).join("");
    const mantMax   = Math.max(...mantTipoData.map(d => d.value), 1);
    const mantRows  = mantTipoData.map(d => barRow(d.name, d.value, mantMax, "#06b6d4")).join("");
    const tColors   = { "Pendientes": "#f59e0b", "En proceso": "#3b82f6", "Resueltos": "#22c55e" };
    const ticketRows = ticketData.map(d => barRow(d.name, d.value, tickets.length || 1, tColors[d.name] || "#006847")).join("");

    const tendenciaTabla = critTrend.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#e8f0e8;">
          <th style="padding:4px 8px;border:1px solid #c8d6c8;font-size:8px;text-align:left;color:#006847;">Mes</th>
          <th style="padding:4px 8px;border:1px solid #c8d6c8;font-size:8px;text-align:center;color:#006847;">Promedio %</th>
          <th style="padding:4px 8px;border:1px solid #c8d6c8;font-size:8px;text-align:center;color:#006847;">Revisiones</th>
          <th style="padding:4px 8px;border:1px solid #c8d6c8;font-size:8px;color:#006847;">Barra</th>
        </tr></thead>
        <tbody>${critTrend.map((r, i) => `
          <tr style="background:${i % 2 === 0 ? '#f0f8f0' : '#fff'}">
            <td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:8px;">${r.mes}</td>
            <td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:8px;text-align:center;font-weight:700;color:${r.promedio>=80?'#006847':r.promedio>=50?'#f59e0b':'#c62828'}">${r.promedio}%</td>
            <td style="padding:4px 8px;border:1px solid #c8d6c8;font-size:8px;text-align:center;">${r.revisiones}</td>
            <td style="padding:4px 8px;border:1px solid #c8d6c8;">
              <div style="height:7px;background:#e8f0e8;border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${r.promedio}%;background:${r.promedio>=80?'#006847':r.promedio>=50?'#f59e0b':'#c62828'};border-radius:2px;"></div>
              </div></td>
          </tr>`).join("")}
        </tbody>
      </table>` : "";

    // Constructores de sección según modo
    const sT = (title, tRows) =>
      `<div style="margin-bottom:18px;page-break-inside:avoid;">
        <div style="background:#006847;color:white;padding:5px 10px;font-weight:700;font-size:9px;border-radius:3px 3px 0 0;text-transform:uppercase;">${title}</div>
        <table style="width:100%;border-collapse:collapse;">${tRows}</table>
       </div>`;
    const sG = (title, svgIdx) =>
      `<div style="margin-bottom:18px;page-break-inside:avoid;">
        <div style="background:#006847;color:white;padding:5px 10px;font-weight:700;font-size:9px;border-radius:3px 3px 0 0;text-transform:uppercase;">${title}</div>
        ${chartBlock(svgIdx)}
       </div>`;
    const sC = (title, svgIdx, tRows) =>
      `<div style="margin-bottom:18px;page-break-inside:avoid;">
        <div style="background:#006847;color:white;padding:5px 10px;font-weight:700;font-size:9px;border-radius:3px 3px 0 0;text-transform:uppercase;">${title}</div>
        ${chartBlock(svgIdx)}
        <table style="width:100%;border-collapse:collapse;">${tRows}</table>
       </div>`;

    const tendenciaHtml = critTrend.length > 0
      ? `<div style="margin-bottom:18px;page-break-inside:avoid;">
          <div style="background:#006847;color:white;padding:5px 10px;font-weight:700;font-size:9px;border-radius:3px 3px 0 0;text-transform:uppercase;">Tendencia de Criterios — Promedio Mensual</div>
          ${modo !== 'tablas' ? chartBlock(5) : ''}
          ${modo !== 'graficas' ? tendenciaTabla : ''}
         </div>`
      : '';

    const sections = {
      tablas:   sT("Equipos por tipo", tipoRows)    + sT("Tickets por estado", ticketRows)    + sT("Mantenimientos realizados", mantRows)    + sT("Equipos por departamento (Top 12)", deptRows)    + sT("Sistemas operativos", soRows),
      graficas: sG("Equipos por tipo", 0)           + sG("Tickets por estado", 1)             + sG("Mantenimientos realizados", 2)           + sG("Equipos por departamento (Top 12)", 3)           + sG("Sistemas operativos", 4),
      completo: sC("Equipos por tipo", 0, tipoRows) + sC("Tickets por estado", 1, ticketRows) + sC("Mantenimientos realizados", 2, mantRows) + sC("Equipos por departamento (Top 12)", 3, deptRows) + sC("Sistemas operativos", 4, soRows),
    };

    const titulo = { tablas: "Dashboard — Tablas", graficas: "Dashboard — Gráficas", completo: "Dashboard — Completo" };

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${titulo[modo]} — Main Warehouse</title>
<style>
  @page { size: portrait; margin: 1cm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size:9px; color:#333; }
  .header-bar { display:flex; align-items:center; justify-content:space-between; border:2px solid #006847; border-radius:4px; padding:10px 16px; margin-bottom:14px; }
  .header-bar img { height:45px; }
  .header-bar .title { text-align:center; flex:1; }
  .header-bar .title h1 { font-size:13px; color:#006847; margin:0; text-transform:uppercase; letter-spacing:1px; }
  .header-bar .title p { font-size:9px; color:#666; margin-top:3px; }
  .kpi-grid { display:flex; gap:10px; margin-bottom:18px; }
  .kpi { flex:1; border:1px solid #c8d6c8; border-radius:6px; padding:10px; text-align:center; background:#f0f8f0; }
  .kpi .val { font-size:22px; font-weight:800; }
  .kpi .lbl { font-size:8px; color:#666; text-transform:uppercase; margin-top:2px; }
  .footer { text-align:center; font-size:7px; color:#aaa; margin-top:20px; border-top:1px solid #eee; padding-top:6px; }
</style></head><body>
<div class="header-bar">
  <img src="/logo.svg" alt="Enterprise" />
  <div class="title">
    <h1>${titulo[modo]} — Inventario de Equipos</h1>
    <p>StockBase Inventory Management</p>
  </div>
  <div style="text-align:right;font-size:9px;color:#666;">${fecha}</div>
</div>
<div class="kpi-grid">
  <div class="kpi"><div class="val" style="color:#3b82f6">${equipos.length}</div><div class="lbl">Equipos registrados</div></div>
  <div class="kpi"><div class="val" style="color:#f59e0b">${criterios.length}</div><div class="lbl">Revisiones de criterios</div></div>
  <div class="kpi"><div class="val" style="color:#06b6d4">${mantenimientos.length}</div><div class="lbl">Mantenimientos</div></div>
  <div class="kpi"><div class="val" style="color:#8b5cf6">${tickets.length}</div><div class="lbl">Tickets</div></div>
</div>
${sections[modo]}${tendenciaHtml}
<div class="footer">Generado el ${fecha} — Sistema de Gestión StockBase — Headquarters</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
  };

  const abrirPDF = (html) => { const w = window.open("", "_blank"); w.document.write(html); w.document.close(); };
  const exportarPDFTablas   = () => abrirPDF(buildDashboardHtml('tablas'));
  const exportarPDFGraficas = () => abrirPDF(buildDashboardHtml('graficas'));
  const exportarPDFCompleto = () => abrirPDF(buildDashboardHtml('completo'));

  return (
    <div style={{ padding: "16px 20px", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
        <button onClick={exportarPDFTablas}   style={btnStyle("#64748b")}>📕 PDF Tablas</button>
        <button onClick={exportarPDFGraficas} style={btnStyle("#3b82f6")}>📊 PDF Gráficas</button>
        <button onClick={exportarPDFCompleto} style={btnStyle("#ef4444")}>📕 PDF Completo</button>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        {/* Equipos por tipo */}
        <div style={cardStyle}>
          <div style={titleSt}>Equipos por tipo</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={tipoData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,value}) => `${name}: ${value}`} labelLine={true}>
                {tipoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets por estado */}
        <div style={cardStyle}>
          <div style={titleSt}>Tickets por estado</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={ticketData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,value}) => `${name}: ${value}`}>
                {ticketData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mantenimientos por tipo */}
        <div style={cardStyle}>
          <div style={titleSt}>Mantenimientos realizados</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mantTipoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9" }} />
              <Bar dataKey="value" fill="#006847" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        {/* Equipos por departamento (top 12) */}
        <div style={{ ...cardStyle, flex: 2 }}>
          <div style={titleSt}>Equipos por departamento (Top 12)</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={160} tick={{ fill: "#94a3b8", fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9" }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sistemas operativos */}
        <div style={cardStyle}>
          <div style={titleSt}>Sistemas operativos</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={soChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name}: ${value}`} labelLine={true}>
                {soChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendencia de criterios por mes */}
      {critTrend.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={titleSt}>Tendencia de criterios — Promedio mensual</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={critTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="mes" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9" }} />
              <Legend />
              <Line type="monotone" dataKey="promedio" stroke="#006847" strokeWidth={2} dot={{ fill: "#006847" }} name="Promedio %" />
              <Line type="monotone" dataKey="revisiones" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} name="Revisiones" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── AuditLogTab ─────────────────────────────────────────────────────────────
function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson('/api/audit-log')
      .then(data => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return [l.fecha, l.usuario, l.accion, l.tipo, l.detalle, l.ip].some(v => v && String(v).toLowerCase().includes(s));
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "16px 20px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar en registro..." style={{ flex: 1, minWidth: 200, ...inputStyle }} />
        <span style={{ fontSize: 11, color: "#64748b" }}>{filtered.length} registro(s)</span>
      </div>
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando registro...</div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr>
                {["Fecha", "Usuario", "Accion", "Tipo", "Detalle", "IP"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#64748b", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", textTransform: "uppercase", position: "sticky", top: 0 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "8px 12px", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>{l.fecha ? new Date(l.fecha).toLocaleString("es-MX") : "—"}</td>
                  <td style={{ padding: "8px 12px", fontSize: 11, color: l.usuario === "admin" ? "#22c55e" : "#60a5fa", fontWeight: 600 }}>{l.usuario}</td>
                  <td style={{ padding: "8px 12px", fontSize: 11 }}>
                    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                      background: l.accion === "crear" ? "rgba(34,197,94,0.1)" : l.accion === "eliminar" ? "rgba(239,68,68,0.1)" : l.accion === "editar" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)",
                      color: l.accion === "crear" ? "#22c55e" : l.accion === "eliminar" ? "#ef4444" : l.accion === "editar" ? "#3b82f6" : "#f59e0b"
                    }}>{l.accion}</span>
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 11, color: "#cbd5e1" }}>{l.tipo}</td>
                  <td style={{ padding: "8px 12px", fontSize: 11, color: "#94a3b8", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.detalle || "—"}</td>
                  <td style={{ padding: "8px 12px", fontSize: 10, color: "#475569", fontFamily: "monospace" }}>{l.ip || "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#475569" }}>No hay registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// =============== MAIN APP ===============
export default function App() {
  const [role, setRole] = useState(sessionStorage.getItem('authRole') || null); // null | "admin" | "viewer" | "user"
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('authToken'));
  const [showAdminLogin, setShowAdminLogin] = useState(window.location.pathname === "/admin");
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState(false);
  const [mainTab, setMainTab] = useState("censo"); // "censo" | "tickets"

  // Censo state
  const [equipos, setEquipos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("hardware");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterUnidad, setFilterUnidad] = useState("");
  const [filterTipoEquipo, setFilterTipoEquipo] = useState("");
  const [showBajas, setShowBajas] = useState(false);
  const [confirmBaja, setConfirmBaja] = useState(null);
  const [showNewEqModal, setShowNewEqModal] = useState(false);
  const [newEqDraft, setNewEqDraft] = useState({ area:"", tipoEquipo:"", alias:"", unidad:"" });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkDraft, setBulkDraft] = useState({ unidad:"", area:"", nombres:"", apPaterno:"", apMaterno:"", correo:"", matricula:"", puesto:"", claveOrg:"", tipoContratacion:"" });
  const [showChart, setShowChart] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [importModal, setImportModal] = useState(null);
  const [sortCol, setSortCol] = useState("area");
  const [sortDir, setSortDir] = useState("asc");

  // Criterios + Mantenimiento state
  const [criterios, setCriterios] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);

  // Mapa state

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState("");
  const [editTicketId, setEditTicketId] = useState(null);
  const [newTicket, setNewTicket] = useState({ equipoSerie:"", equipoDesc:"", area:"", solicitante:"", matricula:"", descripcion:"", responsable: getResponsableDefault() });
  const [folioGenerado, setFolioGenerado] = useState(null);
  const [folioConsulta, setFolioConsulta] = useState("");
  const [ticketConsultado, setTicketConsultado] = useState(null);
  const [buscandoFolio, setBuscandoFolio] = useState(false);
  const [folioNoEncontrado, setFolioNoEncontrado] = useState(false);

  const saveTimeout = useRef(null);

  // Tickets: admin y viewer necesitan cargar todos
  useEffect(() => {
    if (role !== "admin" && role !== "viewer") return;
    apiJson('/api/tickets').then(setTickets).catch(() => setTickets([]));
  }, [role]);

  // Datos admin/viewer: se cargan cuando el usuario se autentica
  useEffect(() => {
    if (role !== "admin" && role !== "viewer") return;
    apiJson(`/api/equipos${showBajas ? '?incluirBajas=true' : ''}`).then(setEquipos).catch(() => setEquipos([]));
    apiJson('/api/criterios').then(setCriterios).catch(() => setCriterios([]));
    apiJson('/api/mantenimientos').then(setMantenimientos).catch(() => setMantenimientos([]));
  }, [role, showBajas]);

  // Si el usuario no es admin/viewer e intenta ver algo que no es tickets, forzar tickets
  useEffect(() => {
    if (role && role !== "admin" && role !== "viewer" && mainTab !== "tickets") {
      setMainTab("tickets");
    }
  }, [role]);

  const updateEq = useCallback((id, key, val) => {
    setEquipos(prev => {
      const next = prev.map(e => e.id === id ? { ...e, [key]: val } : e);
      const equipo = next.find(e => e.id === id);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      setSaving(true);
      saveTimeout.current = setTimeout(() => {
        apiJson(`/api/equipos/${id}`, { method: 'PUT', body: JSON.stringify(equipo) })
          .then(() => { setLastSaved(new Date().toLocaleTimeString("es-MX")); setSaving(false); })
          .catch(() => setSaving(false));
      }, 800);
      return next;
    });
  }, []);

  const confirmAddEquipo = useCallback(async () => {
    const id = String(Date.now());
    const mx = equipos.reduce((m, e) => Math.max(m, e.no || 0), 0);
    const n = { id, no:mx+1, entidad:"MAIN", unidad:newEqDraft.unidad||"", nombreUnidad:"", calle:"", numero:"", colonia:"", municipio:"CENTRAL", cp:"", validadoFecha:null, notas:"", area:newEqDraft.area, tipoEquipo:newEqDraft.tipoEquipo, alias:newEqDraft.alias };
    const created = await apiJson('/api/equipos', { method: 'POST', body: JSON.stringify(n) });
    setEquipos(prev => [...prev, created]);
    setSelectedId(created.id); setActiveTab("hardware");
    setShowNewEqModal(false); setNewEqDraft({ area:"", tipoEquipo:"", alias:"", unidad:"" });
  }, [equipos, newEqDraft]);

  const applyBulkResponsable = () => {
    const { unidad, area, ...campos } = bulkDraft;
    const preview = equipos.filter(e => e.area === area && (!unidad || e.unidad === unidad)).length;
    if (!window.confirm(`¿Actualizar resguardo de ${preview} equipo(s) en "${area}"?`)) return;
    apiJson('/api/equipos/bulk-responsable', {
      method: 'PUT',
      body: JSON.stringify({ area, unidad: unidad || null, campos })
    }).then(({ updated }) => {
      setEquipos(prev => prev.map(e => {
        if (e.area === area && (!unidad || e.unidad === unidad)) return { ...e, ...campos };
        return e;
      }));
      setShowBulkModal(false);
      setBulkDraft({ unidad:"", area:"", nombres:"", apPaterno:"", apMaterno:"", correo:"", matricula:"", puesto:"", claveOrg:"", tipoContratacion:"" });
      alert(`✅ ${updated} equipo(s) actualizados.`);
    }).catch(err => alert('Error: ' + err.message));
  };

  const deleteEquipo = useCallback(id => {
    apiJson(`/api/equipos/${id}`, { method: 'DELETE' })
      .then(() => {
        setEquipos(prev => prev.filter(e => e.id !== id));
        if (selectedId === id) setSelectedId(null);
        setConfirmDelete(null);
      })
      .catch(err => alert('Error al eliminar: ' + err.message));
  }, [selectedId]);

  const toggleBaja = useCallback(id => {
    apiJson(`/api/equipos/${id}/baja`, { method: 'PUT' })
      .then(resp => {
        setEquipos(prev => prev.map(e => e.id === id ? resp : e));
        setConfirmBaja(null);
      })
      .catch(err => alert('Error: ' + err.message));
  }, []);

  const buscarFolio = async () => {
    if (!folioConsulta) return;
    setBuscandoFolio(true);
    setTicketConsultado(null);
    setFolioNoEncontrado(false);
    try {
      const t = await apiJson(`/api/tickets/folio/${folioConsulta}`);
      setTicketConsultado(t);
    } catch {
      setFolioNoEncontrado(true);
    } finally {
      setBuscandoFolio(false);
    }
  };

  const submitTicket = async () => {
    const t = { id: "t" + Date.now(), fecha: new Date().toISOString().split("T")[0], ...newTicket, estado:"pendiente", respuesta:"", fechaResolucion:null };
    const created = await apiJson('/api/tickets', { method: 'POST', body: JSON.stringify(t) });
    setTickets(prev => [created, ...prev]);
    setFolioGenerado(created.folio);
    setNewTicket({ equipoSerie:"",equipoDesc:"",area:"",solicitante:"",matricula:"",descripcion:"", responsable: getResponsableDefault() });
    setShowTicketForm(false);
  };

  const updateTicket = (id, key, val) => {
    const next = tickets.map(t => t.id === id ? { ...t, [key]: val } : t);
    const ticket = next.find(t => t.id === id);
    setTickets(next);
    apiJson(`/api/tickets/${id}`, { method: 'PUT', body: JSON.stringify(ticket) })
      .catch(err => console.error('Error guardando ticket:', err));
  };
  const deleteTicket = (id) => {
    if (!window.confirm("¿Eliminar este ticket? Esta acción no se puede deshacer.")) return;
    apiJson(`/api/tickets/${id}`, { method: 'DELETE' })
      .then(() => setTickets(prev => prev.filter(t => t.id !== id)))
      .catch(err => alert('Error al eliminar ticket: ' + err.message));
    setEditTicketId(null);
  };

  // ── Criterios CRUD ──
  const crearCriterio = async (crit) => {
    const created = await apiJson('/api/criterios', { method: 'POST', body: JSON.stringify(crit) });
    setCriterios(prev => [created, ...prev]);
    return created;
  };
  const eliminarCriterio = async (id) => {
    await apiJson(`/api/criterios/${id}`, { method: 'DELETE' });
    setCriterios(prev => prev.filter(c => c.id !== id));
  };

  // ── Mantenimiento CRUD ──
  const crearMantenimiento = async (mant) => {
    const created = await apiJson('/api/mantenimientos', { method: 'POST', body: JSON.stringify(mant) });
    setMantenimientos(prev => [created, ...prev]);
    return created;
  };
  const eliminarMantenimiento = async (id) => {
    await apiJson(`/api/mantenimientos/${id}`, { method: 'DELETE' });
    setMantenimientos(prev => prev.filter(m => m.id !== id));
  };

  // Lookup equipo by serie for ticket form
  const lookupEquipo = (serie) => {
    if (!serie) return;
    if (role === "admin") {
      const eq = equipos.find(e => e.noSerie && e.noSerie.toLowerCase() === serie.toLowerCase());
      if (eq) { setNewTicket(prev => ({ ...prev, equipoSerie:eq.noSerie||"", equipoDesc:[eq.marca, eq.modelo].filter(Boolean).join(" "), area:eq.area || "", solicitante:[eq.nombres, eq.apPaterno].filter(Boolean).join(" "), matricula:eq.matricula || "" })); }
    } else {
      apiJson(`/api/equipos/serie/${encodeURIComponent(serie)}`).then(eq => {
        setNewTicket(prev => ({ ...prev, equipoSerie:eq.noSerie||"", equipoDesc:[eq.marca, eq.modelo].filter(Boolean).join(" "), area:eq.area || "", solicitante:[eq.nombres, eq.apPaterno].filter(Boolean).join(" "), matricula:eq.matricula || "" }));
      }).catch(() => {});
    }
  };

  // ── Importar CSV ──────────────────────────────────────────────────────────
  const importarCSV = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const lines = ev.target.result.split(/\r?\n/).filter(l => l.trim());
          // Fila 1 = título (se ignora), Fila 2 = encabezados
          if (lines.length < 3) { alert("El CSV tiene menos de 3 filas. Verifica que guardaste desde Excel."); return; }
          const headers = parseCSVLine(lines[1]);
          const importados = [];
          const sinMapeo = new Set();

          for (let i = 2; i < lines.length; i++) {
            const vals = parseCSVLine(lines[i]);
            const eq = {
              id: String(Date.now()) + "_" + i,
              entidad: "MAIN",
              municipio: "MAIN",
              validadoFecha: null,
              notas: "",
            };

            headers.forEach((h, idx) => {
              const norm = h.toLowerCase().replace(/\s+/g, " ").trim();
              const appKey = CSV_MAP[norm];
              if (!appKey) { if (h.trim()) sinMapeo.add(h.trim()); return; }
              let val = vals[idx] ?? "";
              if (BOOL_KEYS.has(appKey)) {
                const v = val.toUpperCase().trim();
                eq[appKey] = v === "SI" || v === "S" || v === "1" || v === "TRUE" || v === "X" || v === "✓";
              } else if (NUM_KEYS.has(appKey)) {
                const n = parseFloat(val.replace(",", "."));
                if (!isNaN(n)) eq[appKey] = n;
              } else {
                if (val) eq[appKey] = val;
              }
            });

            // Extraer clave corta desde nombreUnidad: "Main Warehouse HQ" → "Main Warehouse"
            // Siempre sobreescribir: la columna "Unidad" del Excel tiene el nombre largo
            if (eq.nombreUnidad) {
              const m = eq.nombreUnidad.trim().match(/^([A-ZÁÉÍÓÚ]+\s+\d+)/i);
              eq.unidad = m ? m[1] : eq.nombreUnidad.trim().split(/\s+/).slice(0, 2).join(' ');
            }

            if (!eq.noSerie && !eq.marca && !eq.area && !eq.no) continue;
            importados.push(eq);
          }

          if (importados.length === 0) { alert("No se encontraron equipos. Verifica que los encabezados estén en la fila 2."); return; }

          setImportModal({ importados, sinMapeo });
        } catch (err) {
          alert("Error al procesar el CSV: " + err.message);
        }
      };
      reader.readAsText(file, "UTF-8");
    };
    input.click();
  };
  // ─────────────────────────────────────────────────────────────────────────

  function ejecutarImportacion(modo) {
    if (!importModal) return;
    const { importados, sinMapeo } = importModal;
    const payload = modo === 'reemplazar' ? importados : [...equipos, ...importados];
    apiJson('/api/importar', { method: 'POST', body: JSON.stringify(payload) })
      .then(saved => {
        setEquipos(saved);
        setSelectedId(null);
        const aviso = sinMapeo.size > 0
          ? `\n\nColumnas no reconocidas (${sinMapeo.size}): ${[...sinMapeo].slice(0,5).join(", ")}${sinMapeo.size > 5 ? "..." : ""}`
          : "";
        alert(`Se importaron ${importados.length} equipos. Total actual: ${saved.length} equipos${aviso}`);
      })
      .catch(err => alert("Error al guardar en servidor: " + err.message))
      .finally(() => setImportModal(null));
  }

  function ejecutarUpsert() {
    if (!importModal) return;
    const { importados, sinMapeo } = importModal;
    apiJson('/api/equipos/upsert', { method: 'POST', body: JSON.stringify(importados) })
      .then(data => {
        setEquipos(data.equipos);
        setSelectedId(null);
        const aviso = sinMapeo.size > 0
          ? `\n\nColumnas no reconocidas (${sinMapeo.size}): ${[...sinMapeo].slice(0,5).join(", ")}${sinMapeo.size > 5 ? "..." : ""}`
          : "";
        alert(`Upsert completado: ${data.insertados} nuevos, ${data.actualizados} actualizados, ${data.sinCambios} sin cambios. Total: ${data.equipos.length} equipos${aviso}`);
      })
      .catch(err => alert("Error al guardar en servidor: " + err.message))
      .finally(() => setImportModal(null));
  }

  // ── Exportar Excel ────────────────────────────────────────
  const exportarExcel = async () => {
    const XLSX = await import('xlsx-js-style');
    
    // Hoja 1: Censo de Equipos (ordenado por no ASC)
    const censoData = [...equipos].sort((a,b) => (a.no||0) - (b.no||0)).map(eq => ({
      "No.": eq.no || "",
      "Área": eq.area || "",
      "Nombre Equipo": eq.alias || "",
      "Tipo": eq.tipoEquipo || "",
      "Marca": eq.marca || "",
      "Modelo": eq.modelo || "",
      "No. Serie": eq.noSerie || "",
      "No. Inventario": eq.noInventario || "",
      "Año Adquisición": eq.anioAdq || "",
      "Procesador": eq.tipoProcesador || "",
      "GHz": eq.velocidadProc || "",
      "Disco (GB)": eq.discoDuro || "",
      "RAM (GB)": eq.ram || "",
      "Garantía": eq.garantia || "",
      "Usuario Red": eq.nombreUsuario || "",
      "Hostname": eq.hostname || "",
      "IP": eq.ip || "",
      "MAC": eq.mac || "",
      "Máscara": eq.mascara || "",
      "Est/Din": eq.estaticaDinamica || "",
      "domain connection": eq.onDomain || "",
      "Internet": eq.internet || "",
      "Nombre(s)": eq.nombres || "",
      "Ap. Paterno": eq.apPaterno || "",
      "Ap. Materno": eq.apMaterno || "",
      "Correo": eq.correo || "",
      "Matrícula": eq.matricula || "",
      "Puesto": eq.puesto || "",
      "Entidad": eq.entidad || "",
      "Unidad": eq.nombreUnidad || "",
      "Catalogada": eq.catalogada || "",
      "S.O.": eq.so || "",
      "Ofimática": eq.ofimatica || "",
      "Obsoleto": eq.obsoleto || "",
      "Validado": eq.validadoFecha || "",
      "Notas": eq.notas || "",
    }));
    
    // Hoja 2: Tickets
    const ticketData = tickets.map(t => ({
      "Folio": t.folio,
      "Fecha": t.fecha,
      "Serie Equipo": t.equipoSerie || "",
      "Equipo": t.equipoDesc || "",
      "Área": t.area || "",
      "Solicitante": t.solicitante || "",
      "Matrícula": t.matricula || "",
      "Descripción": t.descripcion || "",
      "Asignado a": t.responsable || "",
      "Estado": t.estado || "",
      "Respuesta": t.respuesta || "",
      "Fecha Resolución": t.fechaResolucion || "",
    }));
    
    const COLS_CENSO = [
      {wch:5},{wch:30},{wch:20},{wch:10},{wch:18},{wch:20},{wch:15},{wch:18},
      {wch:8},{wch:18},{wch:6},{wch:8},{wch:6},{wch:6},{wch:18},{wch:18},
      {wch:14},{wch:18},{wch:14},{wch:10},{wch:6},{wch:10},{wch:15},{wch:15},
      {wch:15},{wch:28},{wch:10},{wch:20},{wch:12},{wch:20},{wch:14},{wch:12},
      {wch:14},{wch:8},{wch:12},{wch:30},
    ];

    // Estilos corporativos (solo título y headers, NO celdas de datos)
    const hdrStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 9 },
      fill: { fgColor: { rgb: "006847" }, patternType: "solid" },
      alignment: { horizontal: "center" },
    };
    const titleStyle = { font: { bold: true, color: { rgb: "006847" }, sz: 13 }, alignment: { horizontal: "center" } };

    // Helper: fila título con merge + headers verdes, sin estilos en datos
    const makeSheet = (data, titulo) => {
      if (data.length === 0) return null;
      // Limpiar valores: convertir null/undefined a ""
      const clean = data.map(row =>
        Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v == null ? "" : v]))
      );
      const hs = Object.keys(clean[0]);
      const ws = XLSX.utils.aoa_to_sheet([[titulo]]);
      XLSX.utils.sheet_add_json(ws, clean, { origin: "A2" });
      // Título: merge toda la fila + estilo
      ws["A1"].s = titleStyle;
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: hs.length - 1 } }];
      // Headers: solo estilo verde
      hs.forEach((_, ci) => {
        const a = XLSX.utils.encode_cell({ r: 1, c: ci });
        if (ws[a]) ws[a].s = hdrStyle;
      });
      ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 1, c: 0 }, e: { r: 1, c: hs.length - 1 } }) };
      ws["!rows"] = [{ hpt: 20 }, { hpt: 16 }];
      ws["!cols"] = COLS_CENSO;
      return ws;
    };

    const wb = XLSX.utils.book_new();

    // Hoja 1 – Censo completo
    const ws1 = makeSheet(censoData, "Censo de Equipos Main Warehouse - StockBase");
    XLSX.utils.book_append_sheet(wb, ws1, "Censo");

    // Hojas por unidad – una hoja por cada unidad, ordenada por área
    const equiposPorUnidad = {};
    [...equipos]
      .sort((a, b) => (a.area || "").localeCompare(b.area || "") || (a.no||0) - (b.no||0))
      .forEach(eq => {
        const u = eq.unidad || "SIN UNIDAD";
        if (!equiposPorUnidad[u]) equiposPorUnidad[u] = [];
        equiposPorUnidad[u].push(eq);
      });

    Object.entries(equiposPorUnidad).sort(([a],[b]) => a.localeCompare(b)).forEach(([unidad, lista]) => {
      const data = lista.map(eq => ({
        "No.": eq.no || "",
        "Área": eq.area || "",
        "Nombre Equipo": eq.alias || eq.tipoEquipo || "",
        "Tipo": eq.tipoEquipo || "",
        "Marca": eq.marca || "",
        "Modelo": eq.modelo || "",
        "No. Serie": eq.noSerie || "",
        "No. Inventario": eq.noInventario || "",
        "IP": eq.ip || "",
        "S.O.": eq.so || "",
        "RAM (GB)": eq.ram || "",
        "Disco (GB)": eq.discoDuro || "",
        "Nombre(s)": eq.nombres || "",
        "Ap. Paterno": eq.apPaterno || "",
        "Matrícula": eq.matricula || "",
        "Validado": eq.validadoFecha || "",
        "Notas": eq.notas || "",
      }));
      const sheetName = unidad.slice(0, 31); // Excel limita nombres a 31 chars
      const ws = makeSheet(data, `${unidad} — Equipos por Área`);
      if (ws) {
        ws["!cols"] = [{wch:5},{wch:30},{wch:20},{wch:10},{wch:18},{wch:20},{wch:14},{wch:18},{wch:14},{wch:14},{wch:8},{wch:8},{wch:18},{wch:18},{wch:12},{wch:12},{wch:30}];
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    });

    // Última hoja – Tickets
    const TICKET_COLS = ["Folio","Fecha","Serie Equipo","Equipo","Área","Solicitante","Matrícula","Descripción","Asignado a","Estado","Respuesta","Fecha Resolución"];
    const cleanTickets = ticketData.map(row =>
      Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v == null ? "" : v]))
    );
    // ticketCols: usar las columnas reales si hay datos, si no usar el fallback para que el merge y autofilter siempre sean correctos
    const ticketCols = cleanTickets.length > 0 ? Object.keys(cleanTickets[0]) : TICKET_COLS;
    const ws2 = XLSX.utils.aoa_to_sheet([["Tickets de Soporte — StockBase Headquarters"]]);
    XLSX.utils.sheet_add_json(ws2, cleanTickets, { origin: "A2" });
    ws2["A1"].s = titleStyle;
    ws2["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: ticketCols.length - 1 } }];
    ticketCols.forEach((_, ci) => { const a = XLSX.utils.encode_cell({ r: 1, c: ci }); if (ws2[a]) ws2[a].s = hdrStyle; });
    ws2["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 1, c: 0 }, e: { r: 1, c: ticketCols.length - 1 } }) };
    ws2["!cols"] = [{wch:6},{wch:11},{wch:14},{wch:22},{wch:25},{wch:25},{wch:10},{wch:40},{wch:12},{wch:10},{wch:40},{wch:11}];
    ws2["!rows"] = [{ hpt: 20 }, { hpt: 16 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Tickets");
    
    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Census_StockBase_${fecha}.xlsx`);
  };

  // ── Reporte PDF (imprimible) ──────────────────────────────
  const generarReportePDF = () => {
    const datos = sorted;
    const fecha = new Date().toLocaleDateString("es-MX", { year:"numeric", month:"long", day:"numeric" });
    const rows = datos.map((eq, idx) => `<tr style="background:${idx%2===0?'#fff':'#f0f8f0'}">
<td>${eq.no||""}</td><td>${eq.area||""}</td><td>${eq.alias||""}</td><td>${eq.tipoEquipo||""}</td>
<td>${eq.marca||""}</td><td>${eq.modelo||""}</td><td>${eq.noSerie||""}</td><td>${eq.ip||""}</td>
<td>${eq.so||""}</td><td>${eq.ram?eq.ram+" GB":""}</td>
<td>${[eq.nombres,eq.apPaterno].filter(Boolean).join(" ")}</td>
<td>${eq.validadoFecha||"Pendiente"}</td>
</tr>`).join("");
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Reporte Censo Main Warehouse</title>
<style>
  @page { size: landscape; margin: 1cm; }
  body { font-family: Arial, sans-serif; font-size: 9px; color: #333; margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 3px solid #006847; }
  .header img { height: 48px; }
  .header-center { text-align: center; flex: 1; }
  .header-title { font-size: 15px; font-weight: 700; color: #006847; }
  .header-sub { font-size: 9px; color: #666; }
  .header-right { text-align: right; font-size: 9px; color: #666; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #006847; color: white; padding: 5px 6px; text-align: left; font-size: 8px; border: 1px solid #005c3a; }
  td { padding: 4px 6px; border: 1px solid #c8d6c8; font-size: 8px; }
  .footer { margin-top: 10px; text-align: center; font-size: 8px; color: #999; }
</style></head><body>
<div class="header">
  <img src="/logo.svg" alt="Enterprise" />
  <div class="header-center">
    <div class="header-title">CENSO DE EQUIPOS DE CÓMPUTO</div>
    <div class="header-sub">StockBase — Main Facility</div>
  </div>
  <div class="header-right">${fecha}<br/><strong style="color:#006847;">${datos.length} equipos${filterCategory ? " · " + filterCategory : ""}</strong></div>
</div>
<table>
<thead><tr><th>#</th><th>Área</th><th>Nombre</th><th>Tipo</th><th>Marca</th><th>Modelo</th><th>Serie</th><th>IP</th><th>S.O.</th><th>RAM</th><th>Responsable</th><th>Validado</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="footer">Generado el ${fecha} · Sistema de Gestión StockBase Headquarters</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  // ── Reporte PDF Tickets (imprimible) ─────────────────────
  const generarReporteTicketsPDF = () => {
    const datos = filteredTickets;
    const fecha = new Date().toLocaleDateString("es-MX", { year:"numeric", month:"long", day:"numeric" });
    const rows = datos.map((t, idx) => `<tr style="background:${idx%2===0?'#fff':'#f0f8f0'}">
<td>${t.folio||""}</td><td>${t.fecha||""}</td><td>${t.area||""}</td>
<td>${t.solicitante||""}</td><td>${t.matricula||""}</td>
<td>${t.descripcion||""}</td><td>${t.responsable||""}</td>
<td>${t.estado||""}</td><td>${t.respuesta||""}</td><td>${t.fechaResolucion||""}</td>
</tr>`).join("");
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Reporte Tickets Main Warehouse</title>
<style>
  @page { size: portrait; margin: 1cm; }
  body { font-family: Arial, sans-serif; font-size: 8px; color: #333; margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 3px solid #006847; }
  .header img { height: 44px; }
  .header-center { text-align: center; flex: 1; }
  .header-title { font-size: 14px; font-weight: 700; color: #006847; }
  .header-sub { font-size: 8px; color: #666; }
  .header-right { text-align: right; font-size: 8px; color: #666; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #006847; color: white; padding: 5px 6px; text-align: left; font-size: 7px; border: 1px solid #005c3a; }
  td { padding: 4px 6px; border: 1px solid #c8d6c8; font-size: 7px; word-break: break-word; }
  .footer { margin-top: 10px; text-align: center; font-size: 7px; color: #999; }
</style></head><body>
<div class="header">
  <img src="/logo.svg" alt="Enterprise" />
  <div class="header-center">
    <div class="header-title">TICKETS DE SOPORTE TÉCNICO</div>
    <div class="header-sub">StockBase — Headquarters</div>
  </div>
  <div class="header-right">${fecha}<br/><strong style="color:#006847;">${datos.length} ticket${datos.length!==1?"s":""}${ticketFilter ? " · " + ticketFilter : ""}</strong></div>
</div>
<table>
<thead><tr><th>Folio</th><th>Fecha</th><th>Área</th><th>Solicitante</th><th>Matrícula</th><th>Descripción</th><th>Asignado a</th><th>Estado</th><th>Respuesta</th><th>F. Resolución</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="footer">Generado el ${fecha} · Sistema de Gestión StockBase Headquarters</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  const unidades = useMemo(
    () => [...new Set(equipos.map(e => e.unidad).filter(Boolean))].sort(),
    [equipos]
  );
  const categories = useMemo(
    () => [...new Set(
      equipos
        .filter(e => !filterUnidad || (e.unidad || '') === filterUnidad)
        .map(e => getDeptCategory(e.area))
    )].sort(),
    [equipos, filterUnidad]
  );
  const filtered = useMemo(
    () => equipos.filter(e => {
      if (filterUnidad && (e.unidad || '') !== filterUnidad) return false;
      if (filterCategory && getDeptCategory(e.area) !== filterCategory) return false;
      if (filterTipoEquipo && (e.tipoEquipo || '') !== filterTipoEquipo) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return [e.area,e.marca,e.modelo,e.noSerie,e.ip,e.nombres,e.apPaterno,e.noInventario,e.unidad].some(v => v && String(v).toLowerCase().includes(s));
    }),
    [equipos, filterUnidad, filterCategory, filterTipoEquipo, search]
  );
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => {
      let va = a[sortCol] ?? "", vb = b[sortCol] ?? "";
      if (typeof va === "number" && typeof vb === "number")
        return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb), undefined, {numeric:true})
        : String(vb).localeCompare(String(va), undefined, {numeric:true});
    }),
    [filtered, sortCol, sortDir]
  );
  const selected = equipos.find(e => e.id === selectedId);
  const handleSort = col => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("asc"); } };

  const filteredTickets = useMemo(
    () => tickets.filter(t => {
      if (ticketFilter && t.estado !== ticketFilter) return false;
      if (!ticketSearch) return true;
      const s = ticketSearch.toLowerCase();
      return [t.equipoSerie,t.equipoDesc,t.solicitante,t.descripcion,String(t.folio)].some(v => v && v.toLowerCase().includes(s));
    }),
    [tickets, ticketFilter, ticketSearch]
  );

  // ===== LOGIN =====
  if (!role) {
    const tryLogin = async () => {
      try {
        const resp = await apiJson('/api/login', {
          method: 'POST',
          body: JSON.stringify({ password: pass }),
        });
        sessionStorage.setItem('authToken', resp.token);
        sessionStorage.setItem('authRole', resp.role);
        setAuthToken(resp.token);
        setRole(resp.role);
        setMainTab("censo");
        setPass("");
      } catch (err) {
        setPassErr(err.message || 'Contraseña incorrecta');
        setPass("");
      }
    };
    const bgStyle = { minHeight:"100vh", background:"linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',-apple-system,sans-serif", padding:20 };
    const logoBlock = (
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ background:"white", padding:8, borderRadius:12, display:"inline-block" }}>
          <img src="/logo.svg" alt="Enterprise" style={{ height:56 }} />
        </div>
        <h1 style={{ color:"#f1f5f9", fontSize:22, fontWeight:700, margin:"16px 0 4px" }}>Sistema de Gestión</h1>
        <p style={{ color:"#64748b", fontSize:13, margin:0 }}>Main Warehouse / Annex — StockBase</p>
      </div>
    );

    if (showAdminLogin) {
      // Solo tarjeta de administración
      return (
        <div style={bgStyle}>
          <div style={{ width:"100%", maxWidth:420, display:"flex", flexDirection:"column" }}>
            {logoBlock}
            <div style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"24px 28px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                <div style={{ width:48, height:48, background:"linear-gradient(135deg,#006847,#004d38)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🔒</div>
                <div>
                  <h2 style={{ color:"#f1f5f9", fontSize:16, fontWeight:700, margin:"0 0 4px" }}>Administración</h2>
                  <p style={{ color:"#94a3b8", fontSize:12, margin:0 }}>Censo, criterios, mantenimiento, dashboard</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  type="password" value={pass}
                  onChange={e => { setPass(e.target.value); setPassErr(false); }}
                  onKeyDown={e => { if (e.key === "Enter") tryLogin(); }}
                  placeholder="Contraseña"
                  autoFocus
                  style={{ flex:1, padding:"12px 16px", background:"rgba(255,255,255,0.05)", border:`1.5px solid ${passErr ? "#ef4444" : "rgba(255,255,255,0.1)"}`, borderRadius:10, color:"#f1f5f9", fontSize:14, outline:"none", boxSizing:"border-box" }}
                />
                <button onClick={tryLogin} style={{ padding:"12px 20px", background:"linear-gradient(135deg,#006847,#004d38)", border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>Entrar</button>
              </div>
              {passErr && <p style={{ color:"#ef4444", fontSize:12, margin:"8px 0 0" }}>{typeof passErr === 'string' ? passErr : 'Contraseña incorrecta'}</p>}
            </div>
          </div>
        </div>
      );
    }

    // Pantalla principal: solo botón grande de Reportar Falla
    return (
      <div style={bgStyle}>
        <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", alignItems:"center" }}>
          {logoBlock}
          <div
            onClick={() => { setRole("user"); setMainTab("tickets"); }}
            style={{ width:"100%", background:"rgba(255,255,255,0.03)", backdropFilter:"blur(20px)", border:"2px solid rgba(220,38,38,0.3)", borderRadius:20, padding:"32px 36px", cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.08)"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)"; }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:18 }}>
              <div style={{ width:56, height:56, background:"linear-gradient(135deg,#dc2626,#b91c1c)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>🔧</div>
              <div>
                <h2 style={{ color:"#f1f5f9", fontSize:18, fontWeight:700, margin:"0 0 6px" }}>Reportar Falla de Equipo</h2>
                <p style={{ color:"#94a3b8", fontSize:13, margin:0 }}>Generar ticket de soporte técnico</p>
              </div>
              <span style={{ marginLeft:"auto", fontSize:24, color:"#64748b" }}>→</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = role === "admin";
  const isViewer = role === "viewer";
  const isAuth = isAdmin || isViewer;

  const COLS =[{key:"no",label:"#",w:40},{key:"area",label:"Área",w:200},{key:"alias",label:"Nombre",w:130},{key:"tipoEquipo",label:"Tipo",w:65},{key:"marca",label:"Marca",w:80},{key:"modelo",label:"Modelo",w:120},{key:"noSerie",label:"Serie",w:100},{key:"ip",label:"IP",w:105},{key:"so",label:"S.O.",w:90},{key:"nombres",label:"Responsable",w:110},{key:"validadoFecha",label:"Validado",w:85}];

  // ===== MAIN UI =====
  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"'Inter',-apple-system,sans-serif", color:"#f1f5f9", display:"flex", flexDirection:"column" }}>
      {/* NAVBAR */}
      <div style={{ background:"linear-gradient(90deg,#005c43,#004d38)", padding:"8px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8, boxShadow:"0 2px 12px rgba(0,0,0,0.3)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ background:"white", padding:4, borderRadius:8, display:"inline-flex", alignItems:"center" }}>
            <img src="/logo.svg" alt="Enterprise" style={{ height: 28 }} />
          </div>
          <div>
            <h1 style={{ fontSize:14, fontWeight:700, margin:0 }}>Sistema de Gestión — Main Warehouse</h1>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.6)", margin:0 }}>{saving ? "Guardando..." : lastSaved ? "Guardado " + lastSaved : "StockBase"}</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {isAdmin && <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)" }}>👤 Administrador</span>}
          {isViewer && <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)" }}>👁️ Solo lectura</span>}
          <button onClick={() => { sessionStorage.removeItem('authToken'); sessionStorage.removeItem('authRole'); setAuthToken(null); setRole(null); setPass(""); setMainTab("tickets"); }} style={{ padding:"5px 12px", borderRadius:6, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:11, cursor:"pointer" }}>
            {isAuth ? "Cerrar sesión" : "← Inicio"}
          </button>
        </div>
      </div>

      {/* TOP TABS */}
      <div style={{ display:"flex", gap:0, background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.08)", flexWrap:"wrap" }}>
        {isAuth && (
          <button onClick={() => { setMainTab("censo"); setSelectedId(null); }} style={{ padding:"12px 24px", border:"none", borderBottom:mainTab === "censo" ? "3px solid #005c43" : "3px solid transparent", background:mainTab === "censo" ? "rgba(0,92,67,0.1)" : "transparent", color:mainTab === "censo" ? "#22c55e" : "#64748b", fontSize:13, fontWeight:mainTab === "censo" ? 600 : 400, cursor:"pointer" }}>
            📋 {isViewer ? "Censo" : "Captura y Edición (Censo)"}
          </button>
        )}
        <button onClick={() => setMainTab("tickets")} style={{ padding:"12px 24px", border:"none", borderBottom:mainTab === "tickets" ? "3px solid #dc2626" : "3px solid transparent", background:mainTab === "tickets" ? "rgba(220,38,38,0.08)" : "transparent", color:mainTab === "tickets" ? "#f87171" : "#64748b", fontSize:13, fontWeight:mainTab === "tickets" ? 600 : 400, cursor:"pointer" }}>
          🔧 {isAuth ? "Tickets de Soporte" : "Reportar Falla"}
        </button>
        {isAuth && (
          <button onClick={() => setMainTab("criterios")} style={{ padding:"12px 24px", border:"none", borderBottom:mainTab === "criterios" ? "3px solid #f59e0b" : "3px solid transparent", background:mainTab === "criterios" ? "rgba(245,158,11,0.08)" : "transparent", color:mainTab === "criterios" ? "#f59e0b" : "#64748b", fontSize:13, fontWeight:mainTab === "criterios" ? 600 : 400, cursor:"pointer" }}>
            🔐 Criterios
          </button>
        )}
        {isAuth && (
          <button onClick={() => setMainTab("mantenimiento")} style={{ padding:"12px 24px", border:"none", borderBottom:mainTab === "mantenimiento" ? "3px solid #06b6d4" : "3px solid transparent", background:mainTab === "mantenimiento" ? "rgba(6,182,212,0.08)" : "transparent", color:mainTab === "mantenimiento" ? "#06b6d4" : "#64748b", fontSize:13, fontWeight:mainTab === "mantenimiento" ? 600 : 400, cursor:"pointer" }}>
            🔧 Mantenimiento
          </button>
        )}
        {isAuth && (
          <button onClick={() => setMainTab("dashboard")} style={{ padding:"12px 24px", border:"none", borderBottom:mainTab === "dashboard" ? "3px solid #006847" : "3px solid transparent", background:mainTab === "dashboard" ? "rgba(0,104,71,0.08)" : "transparent", color:mainTab === "dashboard" ? "#22c55e" : "#64748b", fontSize:13, fontWeight:mainTab === "dashboard" ? 600 : 400, cursor:"pointer" }}>
            📊 Dashboard
          </button>
        )}
        {isAuth && (
          <button onClick={() => setMainTab("registro")} style={{ padding:"12px 24px", border:"none", borderBottom:mainTab === "registro" ? "3px solid #a78bfa" : "3px solid transparent", background:mainTab === "registro" ? "rgba(167,139,250,0.08)" : "transparent", color:mainTab === "registro" ? "#a78bfa" : "#64748b", fontSize:13, fontWeight:mainTab === "registro" ? 600 : 400, cursor:"pointer" }}>
            📋 Registro
          </button>
        )}
      </div>

      {/* ======= DASHBOARD CENSO ======= */}
      {mainTab === "censo" && isAuth && (showStats || showChart) && (() => {
        const total = equipos.length;
        const pcs = equipos.filter(e => e.tipoEquipo === "PC").length;
        const laptops = equipos.filter(e => e.tipoEquipo === "LAPTOP").length;
        const impresoras = equipos.filter(e => e.tipoEquipo === "IMPRESORA").length;
        const validados = equipos.filter(e => e.validadoFecha).length;
        const win11 = equipos.filter(e => e.so === "WINDOWS 11").length;
        const obsoletos = equipos.filter(e => e.obsoleto === "SI").length;
        const statCard = (label, value, color, sub) => (
          <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${color}30`, borderRadius:10, padding:"10px 16px", minWidth:80, textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, color }}>{value}</div>
            <div style={{ fontSize:10, color:"#64748b", marginTop:2, fontWeight:600 }}>{label}</div>
            {sub && <div style={{ fontSize:9, color:"#475569", marginTop:1 }}>{sub}</div>}
          </div>
        );
        const catCount = {};
        if (filterUnidad) {
          // Con unidad seleccionada → agrupar por departamento dentro de esa unidad
          equipos.filter(e => (e.unidad||'') === filterUnidad)
            .forEach(e => { const c = getDeptCategory(e.area); catCount[c] = (catCount[c]||0)+1; });
        } else {
          // Sin filtro → agrupar por unidad
          equipos.forEach(e => { const u = e.unidad||'SIN UNIDAD'; catCount[u] = (catCount[u]||0)+1; });
        }
        const topCats = Object.entries(catCount).sort((a,b) => b[1]-a[1]).slice(0,8);
        const maxCount = topCats[0]?.[1] || 1;
        const barColors = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#a3a3a3"];
        return (
          <div style={{ padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
            {showStats && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom: showChart ? 10 : 0 }}>
                {statCard("TOTAL", total, "#60a5fa")}
                {statCard("PCs", pcs, "#3b82f6", `${total ? Math.round(pcs/total*100) : 0}%`)}
                {statCard("LAPTOPS", laptops, "#8b5cf6", `${total ? Math.round(laptops/total*100) : 0}%`)}
                {statCard("IMPRESORAS", impresoras, "#06b6d4", `${total ? Math.round(impresoras/total*100) : 0}%`)}
                {statCard("VALIDADOS", validados, "#22c55e", `${total ? Math.round(validados/total*100) : 0}%`)}
                {statCard("WIN 11", win11, "#a78bfa")}
                {statCard("OBSOLETOS", obsoletos, "#ef4444")}
              </div>
            )}
            {showChart && (
              <div>
                <div style={{ fontSize:10, color:"#475569", fontWeight:600, marginBottom:8, textTransform:"uppercase" }}>{filterUnidad ? `${filterUnidad} — por departamento` : "Equipos por unidad (top 8)"}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {topCats.map(([cat, cnt], i) => (
                    <div key={cat} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ fontSize:10, color:"#94a3b8", width:190, textAlign:"right", flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cat}</div>
                      <div style={{ flex:1, height:16, background:"rgba(255,255,255,0.04)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${cnt/maxCount*100}%`, background:barColors[i % barColors.length], borderRadius:4, display:"flex", alignItems:"center", paddingLeft:6 }}>
                          <span style={{ fontSize:9, color:"#fff", fontWeight:700 }}>{cnt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ======= DASHBOARD TICKETS ======= */}
      {mainTab === "tickets" && showStats && (() => {
        const total = tickets.length;
        const pendientes = tickets.filter(t => t.estado === "pendiente").length;
        const proceso = tickets.filter(t => t.estado === "proceso").length;
        const resueltos = tickets.filter(t => t.estado === "resuelto").length;
        const hoy = new Date().toISOString().split("T")[0];
        const hoyCount = tickets.filter(t => t.fecha === hoy).length;
        const statCard = (label, value, color, sub) => (
          <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${color}30`, borderRadius:10, padding:"10px 16px", minWidth:90, textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, color }}>{value}</div>
            <div style={{ fontSize:10, color:"#64748b", marginTop:2, fontWeight:600 }}>{label}</div>
            {sub && <div style={{ fontSize:9, color:"#475569", marginTop:1 }}>{sub}</div>}
          </div>
        );
        return (
          <div style={{ padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {statCard("TOTAL", total, "#60a5fa")}
              {statCard("PENDIENTES", pendientes, "#f59e0b", "sin atender")}
              {statCard("EN PROCESO", proceso, "#3b82f6", "en curso")}
              {statCard("RESUELTOS", resueltos, "#22c55e", `${total ? Math.round(resueltos/total*100) : 0}%`)}
              {statCard("HOY", hoyCount, "#a78bfa", new Date().toLocaleDateString("es-MX",{weekday:"short"}))}
            </div>
          </div>
        );
      })()}

      {/* ======= CENSO TAB ======= */}
      {mainTab === "censo" && isAuth && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Filters */}
          <div style={{ padding:"10px 16px", display:"flex", gap:8, flexWrap:"wrap", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar marca, modelo, serie, IP..." style={{ flex:1, minWidth:200, ...inputStyle }} />
            <select value={filterUnidad} onChange={e => { setFilterUnidad(e.target.value); setFilterCategory(""); }} style={{ ...inputStyle, width:"auto", color:"#94a3b8", maxWidth:160 }}>
              <option value="">Todas las unidades</option>
              {unidades.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...inputStyle, width:"auto", color:"#94a3b8", maxWidth:200 }}>
              <option value="">Todos los departamentos</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterTipoEquipo} onChange={e => setFilterTipoEquipo(e.target.value)} style={{ ...inputStyle, width:"auto", color:"#94a3b8", maxWidth:160 }}>
              <option value="">Todos los tipos</option>
              {["PC","LAPTOP","IMPRESORA","SERVIDOR","SWITCH","NO-BREAK","MONITOR","SCANNER","OTRO"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={() => setShowStats(v => !v)} style={{ ...btnStyle(showStats ? "#60a5fa" : "#475569"), background: showStats ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.04)" }}>📊 Stats</button>
            <button onClick={() => setShowChart(v => !v)} style={{ ...btnStyle(showChart ? "#8b5cf6" : "#475569"), background: showChart ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)" }}>📈 Gráfica</button>
            {isAdmin && <button onClick={importarCSV} style={btnStyle("#f59e0b")}>📂 Importar CSV</button>}
            <button onClick={exportarExcel} style={btnStyle("#10b981")}>📊 Exportar Excel</button>
            {isAdmin && <button onClick={() => setShowBulkModal(true)} style={btnStyle("#a855f7")}>👤 Cambiar Responsable</button>}
            <button onClick={generarReportePDF} style={btnStyle("#3b82f6")}>📄 Reporte PDF</button>
            <button onClick={() => setMainTab("dashboard")} style={btnStyle("#8b5cf6")}>📊 Dashboard</button>
            <label style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#94a3b8", cursor:"pointer", padding:"0 4px" }}>
              <input type="checkbox" checked={showBajas} onChange={e => setShowBajas(e.target.checked)} style={{ accentColor:"#ef4444" }} />
              Mostrar bajas
            </label>
            {isAdmin && <button onClick={() => { setNewEqDraft({ area: filterCategory || "", tipoEquipo:"", alias:"", unidad: filterUnidad || "" }); setShowNewEqModal(true); }} style={btnStyle("#22c55e")}>+ Nuevo Equipo</button>}
          </div>

          {/* ── Modal: Nuevo Equipo ── */}
          {showBulkModal && (() => {
            const areasOpts = [...new Set(
              equipos.filter(e => !bulkDraft.unidad || e.unidad === bulkDraft.unidad).map(e => e.area).filter(Boolean)
            )].sort();
            const previewCount = bulkDraft.area
              ? equipos.filter(e => e.area === bulkDraft.area && (!bulkDraft.unidad || e.unidad === bulkDraft.unidad)).length
              : 0;
            return (
              <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:28, width:500, maxWidth:"92vw", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.6)" }}>
                  <h3 style={{ margin:"0 0 20px", fontSize:16, fontWeight:700, color:"#f1f5f9" }}>👤 Cambiar Responsable por Área</h3>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                    <div>
                      <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>Unidad (opcional)</label>
                      <select value={bulkDraft.unidad} onChange={e => setBulkDraft(p => ({ ...p, unidad:e.target.value, area:"" }))} style={{ ...inputStyle, width:"100%" }}>
                        <option value="">— Todas —</option>
                        {unidades.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>Área / Departamento *</label>
                      <select value={bulkDraft.area} onChange={e => setBulkDraft(p => ({ ...p, area:e.target.value }))} style={{ ...inputStyle, width:"100%" }}>
                        <option value="">— Seleccionar —</option>
                        {areasOpts.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                  {bulkDraft.area && (
                    <div style={{ padding:"8px 12px", background:"rgba(168,85,247,0.1)", border:"1px solid rgba(168,85,247,0.25)", borderRadius:8, marginBottom:16, fontSize:12, color:"#c084fc" }}>
                      {previewCount} equipo(s) serán actualizados en "{bulkDraft.area}"
                    </div>
                  )}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                    {[
                      { key:"nombres", label:"Nombre(s)" },
                      { key:"apPaterno", label:"Ap. Paterno" },
                      { key:"apMaterno", label:"Ap. Materno" },
                      { key:"correo", label:"Correo" },
                      { key:"matricula", label:"Matrícula" },
                      { key:"puesto", label:"Puesto" },
                      { key:"claveOrg", label:"Clave Org." },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>{label}</label>
                        <input value={bulkDraft[key]} onChange={e => setBulkDraft(p => ({ ...p, [key]:e.target.value }))} placeholder={label} style={{ ...inputStyle, width:"100%", boxSizing:"border-box" }} />
                      </div>
                    ))}
                    <div>
                      <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>Tipo Contratación</label>
                      <select value={bulkDraft.tipoContratacion} onChange={e => setBulkDraft(p => ({ ...p, tipoContratacion:e.target.value }))} style={{ ...inputStyle, width:"100%" }}>
                        <option value="">— Sin cambio —</option>
                        {["BASE","CONFIANZA A","CONFIANZA B","EVENTUAL","HONORARIOS"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                    <button onClick={() => { setShowBulkModal(false); setBulkDraft({ unidad:"", area:"", nombres:"", apPaterno:"", apMaterno:"", correo:"", matricula:"", puesto:"", claveOrg:"", tipoContratacion:"" }); }} style={btnStyle("#94a3b8")}>Cancelar</button>
                    <button onClick={applyBulkResponsable} disabled={!bulkDraft.area} style={{ ...btnStyle("#a855f7"), opacity:bulkDraft.area ? 1 : 0.4 }}>✅ Aplicar cambios</button>
                  </div>
                </div>
              </div>
            );
          })()}
          {importModal && (
            <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:28, minWidth:380, maxWidth:"92vw", boxShadow:"0 24px 60px rgba(0,0,0,0.6)" }}>
                <h3 style={{ margin:"0 0 12px", color:"#f1f5f9" }}>Importar CSV</h3>
                <p style={{ color:"#cbd5e1", margin:"0 0 16px" }}>Se encontraron <b style={{ color:"#f1f5f9" }}>{importModal.importados.length}</b> equipos en el archivo.</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <button onClick={() => setImportModal(null)} style={{ ...btnStyle("#94a3b8"), width:"100%", textAlign:"left" }}>
                    Cancelar
                    <span style={{ display:"block", fontSize:11, opacity:0.7, fontWeight:400, marginTop:2 }}>No hacer nada</span>
                  </button>
                  <button onClick={() => ejecutarImportacion('agregar')} style={{ ...btnStyle("#3b82f6"), width:"100%", textAlign:"left" }}>
                    Agregar nuevos
                    <span style={{ display:"block", fontSize:11, opacity:0.7, fontWeight:400, marginTop:2 }}>Agrega los equipos del CSV sin verificar duplicados</span>
                  </button>
                  <button onClick={() => ejecutarUpsert()} style={{ ...btnStyle("#22c55e"), width:"100%", textAlign:"left" }}>
                    Actualizar inteligente
                    <span style={{ display:"block", fontSize:11, opacity:0.7, fontWeight:400, marginTop:2 }}>Actualiza existentes y agrega nuevos. No borra nada.</span>
                  </button>
                  <button onClick={() => ejecutarImportacion('reemplazar')} style={{ ...btnStyle("#ef4444"), width:"100%", textAlign:"left" }}>
                    Reemplazar todos
                    <span style={{ display:"block", fontSize:11, opacity:0.7, fontWeight:400, marginTop:2 }}>{"⚠️ Borra los " + equipos.length + " equipos actuales y mete solo los del CSV"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {showNewEqModal && (
            <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:28, width:420, maxWidth:"90vw", boxShadow:"0 24px 60px rgba(0,0,0,0.6)" }}>
                <h3 style={{ margin:"0 0 20px", fontSize:16, fontWeight:700, color:"#f1f5f9" }}>➕ Nuevo Equipo</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div>
                    <label style={{ display:"block", fontSize:11, color:"#64748b", marginBottom:5, fontWeight:600 }}>UNIDAD</label>
                    <select value={newEqDraft.unidad} onChange={e => setNewEqDraft(p => ({ ...p, unidad:e.target.value }))} style={{ ...inputStyle, cursor:"pointer" }}>
                      <option value="">— Seleccionar unidad —</option>
                      {unidades.map(u => <option key={u} value={u}>{u}</option>)}
                      <option value="_nueva">✏️ Otra...</option>
                    </select>
                    {newEqDraft.unidad === "_nueva" && (
                      <input autoFocus placeholder="Ej: Main Warehouse" style={{ ...inputStyle, marginTop:6 }}
                        onChange={e => setNewEqDraft(p => ({ ...p, unidad:e.target.value.toUpperCase() }))} />
                    )}
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, color:"#64748b", marginBottom:5, fontWeight:600 }}>ÁREA / UBICACIÓN <span style={{ color:"#ef4444" }}>*</span></label>
                    <DeptSelect value={newEqDraft.area} onChange={v => setNewEqDraft(p => ({ ...p, area:v }))} extraAreas={equipos.map(e => e.area).filter(Boolean)} />
                    <span style={{ fontSize:10, color:"#475569", marginTop:3, display:"block" }}>¿Dónde está físicamente el equipo? (ej. ALMACÉN A ESTANTE 3)</span>
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, color:"#64748b", marginBottom:5, fontWeight:600 }}>TIPO DE EQUIPO</label>
                    <select value={newEqDraft.tipoEquipo} onChange={e => setNewEqDraft(p => ({ ...p, tipoEquipo:e.target.value }))} style={{ ...inputStyle, cursor:"pointer" }}>
                      <option value="">— Seleccionar —</option>
                      {["PC","LAPTOP","IMPRESORA","SERVIDOR","SWITCH","NO-BREAK","MONITOR","SCANNER","OTRO"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, color:"#64748b", marginBottom:5, fontWeight:600 }}>NOMBRE / DESCRIPCIÓN</label>
                    <input value={newEqDraft.alias} onChange={e => setNewEqDraft(p => ({ ...p, alias:e.target.value }))} placeholder="Ej: PC recepción, Impresora almacén..." style={inputStyle} />
                    <span style={{ fontSize:10, color:"#475569", marginTop:3, display:"block" }}>Opcional — para identificar fácilmente el equipo</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:24 }}>
                  <button onClick={() => { setShowNewEqModal(false); setNewEqDraft({ area:"", tipoEquipo:"", alias:"", unidad:"" }); }} style={btnStyle("#94a3b8")}>Cancelar</button>
                  <button onClick={confirmAddEquipo} disabled={!newEqDraft.area} style={{ ...btnStyle("#22c55e"), opacity:newEqDraft.area ? 1 : 0.4 }}>✓ Crear Equipo</button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk delete bar */}
          {isAdmin && checkedIds.size > 0 && (
            <div style={{ padding:"6px 16px", background:"rgba(239,68,68,0.08)", borderBottom:"1px solid rgba(239,68,68,0.2)", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, color:"#fca5a5" }}>{checkedIds.size} equipo(s) seleccionado(s)</span>
              <button onClick={() => { if (!window.confirm(`¿Eliminar ${checkedIds.size} equipo(s)? Esta acción no se puede deshacer.`)) return; const ids = [...checkedIds]; Promise.all(ids.map(id => apiJson(`/api/equipos/${id}`, { method: 'DELETE' }))).then(() => { setEquipos(prev => prev.filter(e => !ids.includes(e.id))); if (ids.includes(selectedId)) setSelectedId(null); setCheckedIds(new Set()); }).catch(err => alert('Error al eliminar: ' + err.message)); }} style={btnStyle("#ef4444")}>🗑️ Eliminar seleccionados</button>
              <button onClick={() => setCheckedIds(new Set())} style={btnStyle("#94a3b8")}>✕ Cancelar selección</button>
            </div>
          )}

          {/* Table */}
          <div style={{ flex:selected ? undefined : 1, overflowX:"auto", maxHeight:selected ? "35vh" : undefined, minHeight:150, borderBottom:selected ? "2px solid rgba(59,130,246,0.3)" : undefined }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
              <thead><tr>
                <th style={{ padding:"8px 10px", background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"sticky", top:0, zIndex:1, width:32 }}>
                  <input type="checkbox" checked={sorted.length > 0 && sorted.every(e => checkedIds.has(e.id))} onChange={ev => { const next = new Set(checkedIds); sorted.forEach(e => ev.target.checked ? next.add(e.id) : next.delete(e.id)); setCheckedIds(next); }} style={{ cursor:"pointer" }} />
                </th>
                {COLS.map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} style={{ padding:"8px 10px", textAlign:"left", fontSize:10, fontWeight:600, color:"#64748b", background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)", cursor:"pointer", whiteSpace:"nowrap", position:"sticky", top:0, zIndex:1, textTransform:"uppercase", letterSpacing:"0.5px", userSelect:"none" }}>
                    {col.label} {sortCol === col.key && (sortDir === "asc" ? "▲" : "▼")}
                  </th>
                ))}
              </tr></thead>
              <tbody>{sorted.map(eq => {
                const isSel = eq.id === selectedId; const isChk = checkedIds.has(eq.id); const vb = valBadge(eq.validadoFecha); const isBaja = eq.activo === 0;
                return (
                  <tr key={eq.id} onClick={() => { setSelectedId(isSel ? null : eq.id); setActiveTab("hardware"); }} style={{ cursor:"pointer", background: isChk ? "rgba(239,68,68,0.07)" : isSel ? "rgba(59,130,246,0.12)" : "transparent", borderLeft: isChk ? "3px solid #ef4444" : isSel ? "3px solid #3b82f6" : "3px solid transparent", opacity: isBaja ? 0.5 : 1, textDecoration: isBaja ? "line-through" : "none" }}
                    onMouseEnter={e => { if (!isSel && !isChk) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={e => { if (!isSel && !isChk) e.currentTarget.style.background = "transparent"; }}>
                    <td onClick={e => e.stopPropagation()} style={{ padding:"7px 10px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <input type="checkbox" checked={isChk} onChange={() => { const next = new Set(checkedIds); isChk ? next.delete(eq.id) : next.add(eq.id); setCheckedIds(next); }} style={{ cursor:"pointer" }} />
                    </td>
                    {COLS.map(col => {
                      let val = eq[col.key]; const cs = { padding:"7px 10px", fontSize:12, color:"#cbd5e1", borderBottom:"1px solid rgba(255,255,255,0.04)", whiteSpace:"normal", wordBreak:"break-word", maxWidth:col.w };
                      if (col.key === "validadoFecha") return <td key={col.key} style={cs}><span style={{ fontSize:10, padding:"2px 8px", borderRadius:4, background:vb.bg, color:vb.c, fontWeight:600 }}>{vb.t}</span></td>;
                      if (col.key === "nombres") val = [eq.nombres, eq.apPaterno].filter(Boolean).join(" ");
                      if (col.key === "area") val = getDeptCategory(eq.area);
                      if (col.key === "alias") val = eq.alias || eq.tipoEquipo || getAreaSuffix(eq.area);
                      if (eq.obsoleto === "SI" && col.key === "modelo") return <td key={col.key} style={cs}>{val} <span style={{ fontSize:8, padding:"1px 4px", borderRadius:3, background:"rgba(239,68,68,0.15)", color:"#ef4444" }}>OBS</span></td>;
                      if (isBaja && col.key === "alias") return <td key={col.key} style={cs}>{val} <span style={{ fontSize:8, padding:"1px 4px", borderRadius:3, background:"rgba(239,68,68,0.2)", color:"#ef4444", fontWeight:700 }}>BAJA</span></td>;
                      return <td key={col.key} style={cs}>{val ?? ""}</td>;
                    })}
                  </tr>
                );
              })}{sorted.length === 0 && <tr><td colSpan={COLS.length + 1} style={{ padding:30, textAlign:"center", color:"#475569" }}>Sin resultados</td></tr>}</tbody>
            </table>
          </div>

          {/* Detail */}
          {selected && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ padding:"8px 16px", background:"rgba(255,255,255,0.03)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:200, flexWrap:"wrap" }}>
                  <h2 style={{ fontSize:14, fontWeight:700, margin:0 }}>#{selected.no} — {selected.alias || [selected.marca, selected.modelo].filter(Boolean).join(" ") || "Sin identificar"}</h2>
                  <span style={{ fontSize:11, color:"#64748b" }}>📍</span>
                  {isViewer
                    ? <span style={{ fontSize:12, color:"#60a5fa" }}>{selected.area || "—"}</span>
                    : <DeptSelect value={selected.area} onChange={v => updateEq(selected.id, "area", v)} style={{ width:250 }} extraAreas={equipos.map(e => e.area).filter(Boolean)} />}
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {isAdmin && <button onClick={() => updateEq(selected.id, "validadoFecha", selected.validadoFecha ? null : new Date().toISOString().split("T")[0])} style={btnStyle(selected.validadoFecha ? "#f59e0b" : "#22c55e")}>{selected.validadoFecha ? "↩ Desvalidar" : "✅ Validar"}</button>}
                  {isAdmin && (confirmBaja === selected.id ? <>
                    <span style={{ fontSize:11, color: selected.activo === 0 ? "#22c55e" : "#ef4444", alignSelf:"center" }}>{selected.activo === 0 ? "¿Reactivar?" : "¿Dar de baja? No aparecerá en el censo."}</span>
                    <button onClick={() => toggleBaja(selected.id)} style={btnStyle(selected.activo === 0 ? "#22c55e" : "#ef4444")}>Sí</button>
                    <button onClick={() => setConfirmBaja(null)} style={btnStyle("#94a3b8")}>No</button>
                  </> : <button onClick={() => setConfirmBaja(selected.id)} style={btnStyle(selected.activo === 0 ? "#22c55e" : "#ef4444")}>{selected.activo === 0 ? "Reactivar" : "Dar de baja"}</button>)}
                  {isAdmin && (confirmDelete === selected.id ? <>
                    <span style={{ fontSize:11, color:"#ef4444", alignSelf:"center" }}>¿Seguro?</span>
                    <button onClick={() => deleteEquipo(selected.id)} style={btnStyle("#ef4444")}>Sí</button>
                    <button onClick={() => setConfirmDelete(null)} style={btnStyle("#94a3b8")}>No</button>
                  </> : <button onClick={() => setConfirmDelete(selected.id)} style={btnStyle("#ef4444")}>🗑️</button>)}
                  <button onClick={() => setSelectedId(null)} style={btnStyle("#94a3b8")}>✕</button>
                </div>
              </div>
              <div style={{ display:"flex", gap:1, padding:"4px 16px 0", borderBottom:"1px solid rgba(255,255,255,0.06)", overflowX:"auto", flexShrink:0 }}>
                {TABS_EQUIPO.map(tab => { const a = tab.id === activeTab; return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding:"6px 10px", border:"none", borderBottom:a ? "2px solid " + tab.color : "2px solid transparent", background:a ? "rgba(255,255,255,0.05)" : "transparent", color:a ? tab.color : "#64748b", fontSize:11, fontWeight:a ? 600 : 400, cursor:"pointer", whiteSpace:"nowrap", borderRadius:"6px 6px 0 0" }}>
                    {tab.icon} {tab.label}
                  </button>
                ); })}
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"14px 20px" }}>
                {/* Sub-tab: Criterios de equipo */}
                {activeTab === "criteriosEq" && (
                  <CriteriosEquipoTab
                    equipo={selected}
                    criterios={criterios}
                    equipos={equipos}
                    onCrear={isAdmin ? crearCriterio : null}
                    onEliminar={isAdmin ? eliminarCriterio : null}
                  />
                )}

                {/* Sub-tab: Mantenimiento de equipo */}
                {activeTab === "mantenimientoEq" && (
                  <MantenimientoEquipoTab
                    equipo={selected}
                    mantenimientos={mantenimientos}
                    onCrear={isAdmin ? crearMantenimiento : null}
                    onEliminar={isAdmin ? eliminarMantenimiento : null}
                  />
                )}

                {activeTab !== "criteriosEq" && activeTab !== "mantenimientoEq" && TABS_EQUIPO.filter(t => t.id === activeTab).map(tab => {
                  const checks = tab.fields.filter(f => f.type === "check"); const data = tab.fields.filter(f => f.type !== "check");
                  if (checks.length > 0) { const total = checks.length; const done = checks.filter(f => selected[f.key]).length; const pct = Math.round(done / total * 100);
                    return (
                      <div key={tab.id}>
                        <div style={{ marginBottom:12, display:"flex", alignItems:"center", gap:12 }}>
                          <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}><div style={{ height:"100%", width:pct+"%", background:pct===100?"linear-gradient(90deg,#22c55e,#10b981)":`linear-gradient(90deg,${tab.color},${tab.color}88)`, borderRadius:3, transition:"width 0.3s" }} /></div>
                          <span style={{ fontSize:12, color:pct === 100 ? "#22c55e" : tab.color, fontWeight:600 }}>{done}/{total}</span>
                          {isAdmin && <button onClick={() => { const all = checks.every(f => selected[f.key]); checks.forEach(f => updateEq(selected.id, f.key, !all)); }} style={{ padding:"3px 10px", borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(59,130,246,0.1)", color:"#60a5fa", fontSize:10, cursor:"pointer" }}>{checks.every(f => selected[f.key]) ? "↩ Desmarcar" : "✓ Todo"}</button>}
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:4 }}>
                          {checks.map(f => (
                            <div key={f.key} onClick={() => { if (!isViewer) updateEq(selected.id, f.key, !selected[f.key]); }} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", background:selected[f.key] ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)", border:"1px solid " + (selected[f.key] ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"), borderRadius:8, cursor:isViewer ? "default" : "pointer", opacity:isViewer ? 0.7 : 1 }}>
                              <CheckBox checked={!!selected[f.key]} onChange={() => {}} size={20} />
                              <span style={{ fontSize:11, color:selected[f.key] ? "#86efac" : "#94a3b8" }}>{f.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ); }
                  return (
                    <div key={tab.id} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
                      {data.map(f => (
                        <div key={f.key} style={{ gridColumn:f.type === "textarea" ? "1/-1" : undefined }}>
                          <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3, fontWeight:500 }}>{f.label} {f.readonly && "🔒"}</label>
                          <FieldInput field={f} value={selected[f.key]} onChange={v => updateEq(selected.id, f.key, v)} disabled={isViewer} />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======= TICKETS TAB ======= */}
      {mainTab === "tickets" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"auto", padding:"16px 20px" }}>

          {/* ── Formulario nuevo ticket (compartido admin + user) ── */}
          {folioGenerado && !showTicketForm ? (
            <div style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:12, padding:24, marginBottom:20, textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
              <h3 style={{ color:"#22c55e", fontSize:18, fontWeight:700, margin:"0 0 8px" }}>Ticket generado exitosamente</h3>
              <p style={{ color:"#94a3b8", fontSize:13, margin:"0 0 16px" }}>Guarde este número para consultar el estado de su solicitud</p>
              <div style={{ display:"inline-block", background:"rgba(245,158,11,0.15)", border:"2px solid #f59e0b", borderRadius:12, padding:"12px 32px" }}>
                <p style={{ color:"#64748b", fontSize:11, margin:"0 0 2px" }}>Su número de folio es</p>
                <p style={{ color:"#f59e0b", fontSize:36, fontWeight:800, margin:0 }}>{folioGenerado}</p>
              </div>
              <div style={{ marginTop:20, display:"flex", gap:8, justifyContent:"center" }}>
                <button onClick={() => { setFolioGenerado(null); setShowTicketForm(true); }} style={btnStyle("#3b82f6")}>+ Nuevo Ticket</button>
                <button onClick={() => { setFolioConsulta(String(folioGenerado)); setFolioGenerado(null); }} style={btnStyle("#22c55e")}>Consultar este ticket</button>
              </div>
            </div>
          ) : !showTicketForm ? (
            <div style={{ marginBottom:16, display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              <button onClick={() => { setShowTicketForm(true); setFolioGenerado(null); }} style={{ padding:"10px 24px", background:"linear-gradient(135deg,#dc2626,#b91c1c)", border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", boxShadow:"0 4px 16px rgba(220,38,38,0.3)" }}>🔧 Generar Nuevo Ticket</button>
              {isAuth && <button onClick={() => setShowStats(v => !v)} style={{ ...btnStyle(showStats ? "#60a5fa" : "#475569"), background: showStats ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.04)" }}>📊 Stats</button>}
              {isAuth && <button onClick={generarReporteTicketsPDF} style={btnStyle("#3b82f6")}>📄 Reporte PDF</button>}
            </div>
          ) : (
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:20, marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>🔧 Nuevo Ticket de Soporte</h3>
                <span style={{ fontSize:12, color:"#64748b" }}>Folio: <strong style={{ color:"#f59e0b" }}>Automático</strong></span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
                <div>
                  <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>No. Serie del Equipo</label>
                  <div style={{ display:"flex", gap:6 }}>
                    <input value={newTicket.equipoSerie} onChange={e => setNewTicket(p => ({ ...p, equipoSerie:e.target.value }))} placeholder="Ej. MXL1491XYJ" style={inputStyle} />
                    <button onClick={() => lookupEquipo(newTicket.equipoSerie)} style={btnStyle("#3b82f6")} title="Buscar equipo">🔍</button>
                  </div>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>Equipo</label>
                  <input value={newTicket.equipoDesc} onChange={e => setNewTicket(p => ({ ...p, equipoDesc:e.target.value }))} placeholder="Marca y modelo" style={readonlyStyle} readOnly />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>Área</label>
                  <input value={newTicket.area} onChange={e => setNewTicket(p => ({ ...p, area:e.target.value }))} placeholder="Área" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>Solicitante</label>
                  <input value={newTicket.solicitante} onChange={e => setNewTicket(p => ({ ...p, solicitante:e.target.value }))} placeholder="Nombre completo" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>Matrícula</label>
                  <input value={newTicket.matricula} onChange={e => setNewTicket(p => ({ ...p, matricula:e.target.value }))} placeholder="Matrícula" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>Asignado a</label>
                  {(() => {
                    const h = new Date().getHours();
                    let responsable = "ALEX MARTINEZ GARCIA";
                    let label = "ALEX MARTINEZ GARCIA (Matutino)";
                    if (h >= 7 && h < 12) { responsable = "ALEX MARTINEZ GARCIA"; label = "ALEX MARTINEZ GARCIA (Matutino)"; }
                    else if (h >= 12 && h < 15) { responsable = "ALEX MARTINEZ GARCIA"; label = "ALEX MARTINEZ GARCIA / CARLOS RODRIGUEZ LOPEZ (Traslape)"; }
                    else if (h >= 15 && h < 20) { responsable = "CARLOS RODRIGUEZ LOPEZ"; label = "CARLOS RODRIGUEZ LOPEZ (Vespertino)"; }
                    else { responsable = "ALEX MARTINEZ GARCIA"; label = "ALEX MARTINEZ GARCIA (Turno nocturno)"; }
                    return (h >= 12 && h < 15) ? (
                      <select value={newTicket.responsable} onChange={e => setNewTicket(p => ({ ...p, responsable: e.target.value }))} style={inputStyle}>
                        <option value="ALEX MARTINEZ GARCIA">ALEX MARTINEZ GARCIA</option>
                        <option value="CARLOS RODRIGUEZ LOPEZ">CARLOS RODRIGUEZ LOPEZ</option>
                      </select>
                    ) : (
                      <input value={label} readOnly style={readonlyStyle} />
                    );
                  })()}
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ display:"block", fontSize:10, color:"#64748b", marginBottom:3 }}>Descripción de Falla / Solicitud</label>
                  <textarea value={newTicket.descripcion} onChange={e => setNewTicket(p => ({ ...p, descripcion:e.target.value }))} rows={3} placeholder="Describa el problema..." style={{ ...inputStyle, resize:"vertical" }} />
                </div>
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:14 }}>
                <button onClick={() => setShowTicketForm(false)} style={btnStyle("#94a3b8")}>Cancelar</button>
                <button onClick={submitTicket} disabled={!newTicket.descripcion} style={{ ...btnStyle("#ef4444", "linear-gradient(135deg,#dc2626,#b91c1c)"), color:"#fff", opacity:newTicket.descripcion ? 1 : 0.4 }}>📨 Generar Ticket</button>
              </div>
            </div>
          )}

          {/* ── Vista USUARIO: consulta por folio ── */}
          {!isAuth && !showTicketForm && (
            <div>
              <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                <input value={folioConsulta} onChange={e => { setFolioConsulta(e.target.value); setTicketConsultado(null); setFolioNoEncontrado(false); }} onKeyDown={e => e.key === "Enter" && buscarFolio()} placeholder="Ingrese su número de folio..." style={{ flex:1, ...inputStyle, fontSize:15 }} type="text" inputMode="numeric" pattern="[0-9]*" />
                <button onClick={buscarFolio} style={btnStyle("#3b82f6")}>Buscar</button>
              </div>
              {folioConsulta && buscandoFolio && (
                <div style={{ padding:30, textAlign:"center", color:"#64748b" }}>Buscando folio #{folioConsulta}…</div>
              )}
              {folioConsulta && ticketConsultado && (() => {
                const t = ticketConsultado;
                const eb = estadoBadge(t.estado);
                return (
                  <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:20 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
                      <div>
                        <span style={{ fontSize:11, color:"#64748b" }}>Folio </span>
                        <strong style={{ color:"#f59e0b", fontSize:20 }}>#{t.folio}</strong>
                        <span style={{ fontSize:11, color:"#475569", marginLeft:12 }}>{t.fecha}</span>
                      </div>
                      <span style={{ fontSize:12, padding:"4px 14px", borderRadius:8, background:eb.bg, color:eb.c, fontWeight:700 }}>{eb.t}</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, fontSize:12 }}>
                      <div><span style={{ color:"#64748b" }}>Equipo: </span><span style={{ color:"#cbd5e1" }}>{t.equipoDesc || "—"}</span></div>
                      <div><span style={{ color:"#64748b" }}>Serie: </span><span style={{ color:"#cbd5e1", fontFamily:"monospace" }}>{t.equipoSerie || "—"}</span></div>
                      <div><span style={{ color:"#64748b" }}>Área: </span><span style={{ color:"#cbd5e1" }}>{t.area || "—"}</span></div>
                      <div><span style={{ color:"#64748b" }}>Responsable: </span><span style={{ color:"#60a5fa" }}>{t.responsable || "—"}</span></div>
                    </div>
                    <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:8, fontSize:12, color:"#e2e8f0" }}>
                      <span style={{ color:"#64748b", fontSize:10 }}>Descripción: </span>{t.descripcion}
                    </div>
                    {t.respuesta && (
                      <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.15)", borderRadius:8, fontSize:12 }}>
                        <span style={{ color:"#22c55e", fontSize:10, fontWeight:600 }}>RESPUESTA DEL RESPONSABLE:</span>
                        <span style={{ color:"#86efac" }}>{t.respuesta}</span>
                        {t.fechaResolucion && <span style={{ color:"#475569", fontSize:10, marginLeft:8 }}>({t.fechaResolucion})</span>}
                      </div>
                    )}
                  </div>
                );
              })()}
              {folioConsulta && folioNoEncontrado && (
                <div style={{ padding:30, textAlign:"center", color:"#475569", background:"rgba(255,255,255,0.02)", borderRadius:10, border:"1px solid rgba(255,255,255,0.06)" }}>No se encontró el folio <strong style={{ color:"#f59e0b" }}>#{folioConsulta}</strong></div>
              )}
              {!folioConsulta && <div style={{ padding:30, textAlign:"center", color:"#475569", fontSize:13 }}>Ingrese su folio para consultar el estado de su solicitud</div>}
            </div>
          )}

          {/* ── Vista ADMIN/VIEWER: filtros + tabla completa ── */}
          {isAuth && (
            <>
              <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                <input value={ticketSearch} onChange={e => setTicketSearch(e.target.value)} placeholder="🔍 Buscar folio, serie, solicitante..." style={{ flex:1, minWidth:200, ...inputStyle }} />
                <select value={ticketFilter} onChange={e => setTicketFilter(e.target.value)} style={{ ...inputStyle, width:"auto", color:"#94a3b8" }}>
                  <option value="">Todos los estados</option>
                  <option value="pendiente">⏳ Pendientes</option>
                  <option value="proceso">🔄 En Proceso</option>
                  <option value="resuelto">✅ Resueltos</option>
                </select>
              </div>
              <div style={{ overflowX:"auto", background:"rgba(255,255,255,0.02)", borderRadius:10, border:"1px solid rgba(255,255,255,0.06)" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:750 }}>
                  <thead><tr>
                    {["Folio","Fecha","Serie","Equipo","Área","Solicitante","Falla / Solicitud","Asignado a","Estado","Acción"].map(h => (
                      <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:600, color:"#64748b", background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)", textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filteredTickets.map(t => {
                      const eb = estadoBadge(t.estado); const isEditing = editTicketId === t.id;
                      return (
                        <tr key={t.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding:"8px 12px", fontSize:13, fontWeight:700, color:"#f59e0b" }}>{t.folio}</td>
                          <td style={{ padding:"8px 12px", fontSize:12, color:"#94a3b8" }}>{t.fecha}</td>
                          <td style={{ padding:"8px 12px", fontSize:12, color:"#cbd5e1", fontFamily:"monospace" }}>{t.equipoSerie}</td>
                          <td style={{ padding:"8px 12px", fontSize:12, color:"#cbd5e1" }}>{t.equipoDesc}</td>
                          <td style={{ padding:"8px 12px", fontSize:12, color:"#94a3b8" }}>{t.area || "—"}</td>
                          <td style={{ padding:"8px 12px", fontSize:12, color:"#cbd5e1" }}>{t.solicitante}</td>
                          <td style={{ padding:"8px 12px", fontSize:12, color:"#e2e8f0", maxWidth:220, overflow:"hidden", textOverflow:"ellipsis" }}>
                            {t.descripcion}
                            {t.respuesta && <div style={{ fontSize:10, color:"#22c55e", marginTop:2 }}>↳ {t.respuesta}</div>}
                          </td>
                          <td style={{ padding:"8px 12px", fontSize:12, color:"#60a5fa", fontWeight:600 }}>{t.responsable || "—"}</td>
                          <td style={{ padding:"8px 12px" }}>
                            {isEditing ? (
                              <select value={t.estado} onChange={e => { const newEstado = e.target.value; const updates = { estado: newEstado }; if (newEstado === "resuelto") updates.fechaResolucion = new Date().toISOString().split("T")[0]; const next = tickets.map(tk => tk.id === t.id ? { ...tk, ...updates } : tk); setTickets(next); const updated = next.find(tk => tk.id === t.id); apiJson(`/api/tickets/${t.id}`, { method: 'PUT', body: JSON.stringify(updated) }).catch(err => console.error('Error guardando ticket:', err)); }}
                                style={{ ...inputStyle, width:120, fontSize:11 }}>
                                <option value="pendiente">Pendiente</option>
                                <option value="proceso">En Proceso</option>
                                <option value="resuelto">Resuelto</option>
                              </select>
                            ) : (
                              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:6, background:eb.bg, color:eb.c, fontWeight:600 }}>{eb.t}</span>
                            )}
                          </td>
                          <td style={{ padding:"8px 12px" }}>
                            {isAdmin && (isEditing ? (
                              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                                <input value={t.respuesta || ""} onChange={e => updateTicket(t.id, "respuesta", e.target.value)} placeholder="Respuesta..." style={{ ...inputStyle, fontSize:11 }} />
                                <div style={{ display:"flex", gap:4 }}>
                                  <button onClick={() => setEditTicketId(null)} style={{ ...btnStyle("#22c55e"), flex:1 }}>✓ Listo</button>
                                  <button onClick={() => deleteTicket(t.id)} style={btnStyle("#dc2626")} title="Eliminar ticket">🗑️</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setEditTicketId(t.id)} style={btnStyle("#3b82f6")}>✏️ Gestionar</button>
                            ))}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTickets.length === 0 && <tr><td colSpan={10} style={{ padding:30, textAlign:"center", color:"#475569" }}>No hay tickets</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {!isAuth && <p style={{ textAlign:"center", color:"#1e293b", fontSize:9, marginTop:"auto", paddingTop:16 }}>v1.0</p>}
        </div>
      )}

      {/* ======= CRITERIOS TAB ======= */}
      {mainTab === "criterios" && isAuth && (
        <CriteriosMainTab
          criterios={criterios}
          equipos={equipos}
          onCrear={isAdmin ? crearCriterio : null}
          onEliminar={isAdmin ? eliminarCriterio : null}
          readOnly={isViewer}
        />
      )}

      {/* ======= MANTENIMIENTO TAB ======= */}
      {mainTab === "mantenimiento" && isAuth && (
        <MantenimientoMainTab
          mantenimientos={mantenimientos}
          equipos={equipos}
          onCrear={isAdmin ? crearMantenimiento : null}
          onEliminar={isAdmin ? eliminarMantenimiento : null}
          readOnly={isViewer}
        />
      )}

      {/* ======= DASHBOARD TAB ======= */}
      {mainTab === "dashboard" && isAuth && (
        <DashboardPanel equipos={equipos.filter(e => showBajas || e.activo !== 0)} criterios={criterios} mantenimientos={mantenimientos} tickets={tickets} />
      )}

      {/* ======= REGISTRO (AUDIT LOG) TAB ======= */}
      {mainTab === "registro" && isAuth && (
        <AuditLogTab />
      )}
    </div>
  );
}
