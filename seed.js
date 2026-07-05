import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'stockbase.db'));

console.log('🌱 Seeding StockBase database...\n');

// ── Schema (mirrors server.js, so seeding works before first server start) ──
db.exec(`
  CREATE TABLE IF NOT EXISTS equipos (
    id TEXT PRIMARY KEY,
    no INTEGER,
    area TEXT,
    -- Hardware
    alias TEXT, tipoEquipo TEXT, marca TEXT, modelo TEXT,
    noSerie TEXT, noInventario TEXT, anioAdq REAL, procedencia TEXT,
    tipoProcesador TEXT, velocidadProc TEXT, discoDuro REAL, ram REAL,
    garantia TEXT, vigenciaGarantia REAL, centroCostos TEXT,
    -- Red
    nombreUsuario TEXT, hostname TEXT, redLAN TEXT, ip TEXT,
    mac TEXT, mascara TEXT, estaticaDinamica TEXT, onDomain TEXT, internet TEXT,
    -- Resguardo
    nombres TEXT, apPaterno TEXT, apMaterno TEXT, correo TEXT,
    matricula TEXT, puesto TEXT, claveOrg TEXT, nombreAdscripcion TEXT,
    claveAdscripcion TEXT, tipoContratacion TEXT,
    -- Ubicacion
    entidad TEXT, unidad TEXT, subTipo TEXT, catalogada TEXT,
    nombreUnidad TEXT, calle TEXT, numero TEXT, nivel TEXT,
    colonia TEXT, municipio TEXT, cp TEXT, idRed TEXT,
    noInmueble TEXT, delegacion TEXT, ciudad TEXT, geoLat TEXT, geoLon TEXT,
    -- Licencias
    so TEXT, servicePack TEXT, tipoSistema TEXT, ofimatica TEXT, obsoleto TEXT,
    project TEXT, visio TEXT, otro TEXT,
    -- Apps (checkboxes)
    app_nitroPdf INTEGER DEFAULT 0, app_adobeReader INTEGER DEFAULT 0,
    app_java INTEGER DEFAULT 0, app_ie11 INTEGER DEFAULT 0,
    app_chrome INTEGER DEFAULT 0, app_firefox INTEGER DEFAULT 0,
    app_edge INTEGER DEFAULT 0, app_office INTEGER DEFAULT 0,
    app_openOffice INTEGER DEFAULT 0, app_teams INTEGER DEFAULT 0,
    app_vnc INTEGER DEFAULT 0, app_forefront INTEGER DEFAULT 0,
    app_webex INTEGER DEFAULT 0, app_nero INTEGER DEFAULT 0,
    app_scanner INTEGER DEFAULT 0, app_dvd INTEGER DEFAULT 0,
    app_zoom INTEGER DEFAULT 0,
    -- Enterprise Systems (checkboxes)
    sys_erp INTEGER DEFAULT 0, sys_planning INTEGER DEFAULT 0,
    sys_payroll INTEGER DEFAULT 0, sys_crm INTEGER DEFAULT 0,
    sys_directory INTEGER DEFAULT 0, sys_hrms INTEGER DEFAULT 0,
    sys_helpdesk INTEGER DEFAULT 0, sys_inventory INTEGER DEFAULT 0,
    sys_benefits INTEGER DEFAULT 0, sys_billing INTEGER DEFAULT 0,
    sys_tax INTEGER DEFAULT 0, sys_datahub INTEGER DEFAULT 0,
    sys_finance INTEGER DEFAULT 0, sys_dms INTEGER DEFAULT 0,
    sys_workflow INTEGER DEFAULT 0, sys_database INTEGER DEFAULT 0,
    sys_analytics INTEGER DEFAULT 0, sys_quality INTEGER DEFAULT 0,
    sys_leave INTEGER DEFAULT 0, sys_reporting INTEGER DEFAULT 0,
    sys_compliance INTEGER DEFAULT 0, sys_audit INTEGER DEFAULT 0,
    sys_retail INTEGER DEFAULT 0, sys_logistics INTEGER DEFAULT 0,
    sys_facilities INTEGER DEFAULT 0, sys_frontdesk INTEGER DEFAULT 0,
    sys_catering INTEGER DEFAULT 0, sys_procurement INTEGER DEFAULT 0,
    sys_grants INTEGER DEFAULT 0, sys_finance_app INTEGER DEFAULT 0,
    sys_compliance_app INTEGER DEFAULT 0, sys_fileserver INTEGER DEFAULT 0,
    sys_operations INTEGER DEFAULT 0, sys_verify INTEGER DEFAULT 0,
    sys_reporting_app INTEGER DEFAULT 0, sys_recruiting INTEGER DEFAULT 0,
    sys_facilities_app INTEGER DEFAULT 0, sys_itsm INTEGER DEFAULT 0,
    sys_vendors INTEGER DEFAULT 0,
    -- Notas y estado
    notas TEXT, validadoFecha TEXT,
    activo INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    folio INTEGER,
    fecha TEXT,
    equipoSerie TEXT, equipoDesc TEXT, area TEXT,
    solicitante TEXT, matricula TEXT, descripcion TEXT,
    responsable TEXT, estado TEXT, respuesta TEXT, fechaResolucion TEXT
  );
`);

// ── Areas and departments ──────────────────────────────────────────
const areas = [
  'IT Department', 'Accounting', 'Human Resources', 'Reception',
  'Warehouse A', 'Warehouse B', 'Management', 'Customer Service',
  'Quality Control', 'Shipping', 'Maintenance', 'Training Room',
  'Conference Room', 'Sales Floor', 'Break Room'
];

// Must match the app's tipoEquipo catalog (App.jsx FIELD_GROUPS options).
// Weighted so PCs and printers dominate, like a real office inventory.
const types = ['PC', 'PC', 'PC', 'PC', 'LAPTOP', 'LAPTOP', 'IMPRESORA', 'IMPRESORA', 'IMPRESORA', 'MONITOR', 'SCANNER', 'SERVIDOR', 'SWITCH', 'NO-BREAK'];
const brandsByType = {
  'PC': ['Dell', 'HP', 'Lenovo', 'Acer', 'ASUS'],
  'LAPTOP': ['Dell', 'HP', 'Lenovo', 'Acer', 'ASUS'],
  'IMPRESORA': ['HP', 'Brother', 'Epson', 'Canon'],
  'MONITOR': ['Dell', 'HP', 'Samsung', 'LG', 'BenQ'],
  'SCANNER': ['Epson', 'Canon', 'HP'],
  'SERVIDOR': ['Dell', 'HP', 'Lenovo'],
  'SWITCH': ['Cisco', 'TP-Link', 'HP'],
  'NO-BREAK': ['APC', 'Tripp Lite', 'CyberPower'],
};
const processors = ['Intel Core i5-12400', 'Intel Core i7-13700', 'AMD Ryzen 5 5600', 'AMD Ryzen 7 7700', 'Intel Core i3-12100'];
const os = ['Windows 11 Pro', 'Windows 10 Pro', 'Ubuntu 22.04'];
const serverOS = ['Windows Server 2022', 'Ubuntu 22.04'];
const cap = s => s.charAt(0) + s.slice(1).toLowerCase();
const people = [
  { nombres: 'Maria', apPaterno: 'Gonzalez', apMaterno: 'Rivera', correo: 'maria.gonzalez@stockbase.com', matricula: 'EMP-001', puesto: 'Analyst' },
  { nombres: 'Juan', apPaterno: 'Lopez', apMaterno: 'Torres', correo: 'juan.lopez@stockbase.com', matricula: 'EMP-002', puesto: 'Manager' },
  { nombres: 'Ana', apPaterno: 'Martinez', apMaterno: 'Diaz', correo: 'ana.martinez@stockbase.com', matricula: 'EMP-003', puesto: 'Technician' },
  { nombres: 'Carlos', apPaterno: 'Rodriguez', apMaterno: 'Herrera', correo: 'carlos.rodriguez@stockbase.com', matricula: 'EMP-004', puesto: 'Supervisor' },
  { nombres: 'Laura', apPaterno: 'Sanchez', apMaterno: 'Morales', correo: 'laura.sanchez@stockbase.com', matricula: 'EMP-005', puesto: 'Director' },
  { nombres: 'Pedro', apPaterno: 'Ramirez', apMaterno: 'Flores', correo: 'pedro.ramirez@stockbase.com', matricula: 'EMP-006', puesto: 'Assistant' },
  { nombres: 'Sofia', apPaterno: 'Hernandez', apMaterno: 'Castro', correo: 'sofia.hernandez@stockbase.com', matricula: 'EMP-007', puesto: 'Coordinator' },
  { nombres: 'Diego', apPaterno: 'Vargas', apMaterno: 'Ruiz', correo: 'diego.vargas@stockbase.com', matricula: 'EMP-008', puesto: 'Engineer' },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randIP() { return `192.168.1.${Math.floor(Math.random() * 254) + 1}`; }
function randMAC() { return 'AA:BB:CC:' + [1,2,3].map(() => Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()).join(':'); }
function randSerial() { return 'SN-' + Math.random().toString(36).slice(2,10).toUpperCase(); }
function randInv() { return 'INV-' + String(Math.floor(Math.random() * 99999)).padStart(5, '0'); }
function randYear() { return 2018 + Math.floor(Math.random() * 7); }

// ── Seed equipment ─────────────────────────────────────────────────
const insertEquipo = db.prepare(`
  INSERT OR REPLACE INTO equipos (
    id, no, area, alias, tipoEquipo, marca, modelo, noSerie, noInventario,
    anioAdq, tipoProcesador, discoDuro, ram, ip, mac, mascara, hostname,
    so, nombres, apPaterno, apMaterno, correo, matricula, puesto,
    entidad, municipio, activo
  ) VALUES (
    @id, @no, @area, @alias, @tipoEquipo, @marca, @modelo, @noSerie, @noInventario,
    @anioAdq, @tipoProcesador, @discoDuro, @ram, @ip, @mac, @mascara, @hostname,
    @so, @nombres, @apPaterno, @apMaterno, @correo, @matricula, @puesto,
    @entidad, @municipio, @activo
  )
`);

const equipos = db.transaction(() => {
  for (let i = 1; i <= 60; i++) {
    const person = pick(people);
    const type = pick(types);
    const brand = pick(brandsByType[type]);
    insertEquipo.run({
      id: `eq_${String(i).padStart(4, '0')}`,
      no: i,
      area: pick(areas),
      alias: `${type}-${String(i).padStart(3, '0')}`,
      tipoEquipo: type,
      marca: brand,
      modelo: `${type.length <= 3 ? type : cap(type)} ${2020 + Math.floor(Math.random() * 5)}`,
      noSerie: randSerial(),
      noInventario: randInv(),
      anioAdq: randYear(),
      tipoProcesador: ['PC', 'LAPTOP', 'SERVIDOR'].includes(type) ? pick(processors) : null,
      discoDuro: [256, 512, 1000, 2000][Math.floor(Math.random() * 4)],
      ram: [4, 8, 16, 32][Math.floor(Math.random() * 4)],
      ip: randIP(),
      mac: randMAC(),
      mascara: '255.255.255.0',
      hostname: `SB-${type.replace(/[^A-Z]/g, '').slice(0,3)}-${String(i).padStart(3,'0')}`,
      so: type === 'SERVIDOR' ? pick(serverOS) : (['PC', 'LAPTOP'].includes(type) ? pick(os) : null),
      nombres: person.nombres,
      apPaterno: person.apPaterno,
      apMaterno: person.apMaterno,
      correo: person.correo,
      matricula: person.matricula,
      puesto: person.puesto,
      entidad: 'MAIN',
      municipio: 'CENTRAL',
      activo: 1,
    });
  }
});
equipos();
console.log('  ✓ 60 equipment records created');

// ── Seed tickets ───────────────────────────────────────────────────
// Failure descriptions that plausibly match each equipment type
const descsByType = {
  'PC': ['Computer won\'t turn on', 'Blue screen on startup', 'Software installation request', 'Keyboard not responding', 'Need password reset', 'USB port not working', 'Slow performance'],
  'LAPTOP': ['Battery drains too fast', 'Won\'t connect to Wi-Fi', 'Software installation request', 'Screen flickering', 'Need password reset'],
  'IMPRESORA': ['Printer paper jam', 'Print quality issues', 'Printer offline', 'Toner replacement needed'],
  'MONITOR': ['Monitor flickering', 'No signal', 'Dead pixels'],
  'SCANNER': ['Scanner driver issue', 'Scans come out blank'],
  'SERVIDOR': ['Shared folder not accessible', 'Service not responding'],
  'SWITCH': ['Slow internet connection', 'Network cable replacement', 'Port not working'],
  'NO-BREAK': ['Battery replacement needed', 'Beeping constantly'],
};
const estados = ['pendiente', 'en proceso', 'resuelto'];

const insertTicket = db.prepare(`
  INSERT OR REPLACE INTO tickets (id, folio, fecha, equipoDesc, area, solicitante, descripcion, responsable, estado)
  VALUES (@id, @folio, @fecha, @equipoDesc, @area, @solicitante, @descripcion, @responsable, @estado)
`);

const tickets = db.transaction(() => {
  for (let i = 1; i <= 15; i++) {
    const d = new Date(2025, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1);
    const equipoTipo = pick(types);
    insertTicket.run({
      id: `tkt_${String(i).padStart(4, '0')}`,
      folio: 100000 + Math.floor(Math.random() * 900000),
      fecha: d.toISOString().split('T')[0],
      equipoDesc: equipoTipo,
      area: pick(areas),
      solicitante: pick(people).nombres + ' ' + pick(people).apPaterno,
      descripcion: pick(descsByType[equipoTipo]),
      responsable: 'ALEX MARTINEZ GARCIA',
      estado: pick(estados),
    });
  }
});
tickets();
console.log('  ✓ 15 support tickets created');

console.log('\n✅ Database seeded successfully: stockbase.db\n');
db.close();
