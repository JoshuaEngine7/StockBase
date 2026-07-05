import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const db = new Database(join(__dirname, 'stockbase.db'));

// ── Autenticación ───────────────────────────────────────────────────────────
if (!process.env.ADMIN_PASS) {
  console.error('❌ ERROR: Variable ADMIN_PASS no definida.');
  console.error('   Crea un archivo .env con: ADMIN_PASS=tu_contrasena');
  process.exit(1);
}

const sessions = new Map();
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 horas en milisegundos

function requireAuth(req, res, next) {
  const token = req.headers['x-session-token'];
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const session = sessions.get(token);

  // Verificar expiración
  if (Date.now() - session.created > SESSION_TTL) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Sesión expirada. Inicie sesión nuevamente.' });
  }

  // Registrar última actividad
  session.lastActivity = Date.now();
  req.user = session;
  next();
}

function requireEditor(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso de solo lectura. Se requiere rol de administrador.' });
  }
  next();
}

// Limpiar sesiones expiradas cada hora
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [token, session] of sessions) {
    if (now - session.created > SESSION_TTL) {
      sessions.delete(token);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`🧹 ${cleaned} sesión(es) expirada(s) eliminada(s)`);
  }
}, 60 * 60 * 1000); // cada hora

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
  ]
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting: máximo 5 intentos de login cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de login. Espere 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

// Rate limiting general: máximo 500 requests por minuto por IP
// Rutas exentas: login, importar, equipos, tickets por folio, y todas las DELETE
// (las DELETE ya están protegidas por requireAuth)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  message: { error: 'Demasiadas peticiones. Intente en un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  skip: (req) => {
    if (req.method === 'DELETE') return true;
    if (req.method === 'POST' && (req.path === '/api/login' || req.path === '/api/importar')) return true;
    if (req.method === 'GET' && (req.path === '/api/equipos' || req.path.startsWith('/api/tickets/folio/'))) return true;
    return false;
  },
});

app.use('/api/', apiLimiter);
app.use(express.static(join(__dirname, 'dist')));

// ── Campos booleanos (checkboxes) almacenados como INTEGER 0/1 en SQLite ──
const CHECKBOX_COLS = new Set([
  'app_nitroPdf','app_adobeReader','app_java','app_ie11','app_chrome','app_firefox',
  'app_edge','app_office','app_openOffice','app_teams','app_vnc','app_forefront',
  'app_webex','app_nero','app_scanner','app_dvd','app_zoom',
  'sys_erp','sys_planning','sys_payroll','sys_crm','sys_directory','sys_hrms','sys_helpdesk',
  'sys_inventory','sys_benefits','sys_billing','sys_tax','sys_datahub','sys_finance',
  'sys_dms','sys_workflow','sys_database','sys_analytics','sys_quality',
  'sys_leave','sys_reporting','sys_compliance','sys_audit',
  'sys_retail','sys_logistics','sys_facilities','sys_frontdesk','sys_catering',
  'sys_procurement','sys_grants','sys_finance_app','sys_compliance_app',
  'sys_fileserver','sys_operations','sys_verify','sys_reporting_app',
  'sys_recruiting','sys_facilities_app','sys_itsm','sys_vendors',
]);

// ── Crear tablas si no existen ─────────────────────────────────────────────
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
    notas TEXT, validadoFecha TEXT
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    folio INTEGER,
    fecha TEXT,
    equipoSerie TEXT, equipoDesc TEXT, area TEXT,
    solicitante TEXT, matricula TEXT, descripcion TEXT,
    responsable TEXT, estado TEXT, respuesta TEXT, fechaResolucion TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT,
    usuario TEXT,
    accion TEXT,
    tipo TEXT,
    detalle TEXT,
    ip TEXT
  );
`);

const logStmt = db.prepare('INSERT INTO audit_log (fecha, usuario, accion, tipo, detalle, ip) VALUES (?, ?, ?, ?, ?, ?)');
function logAction(req, accion, tipo, detalle) {
  const usuario = req.user?.role || 'anon';
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  logStmt.run(new Date().toISOString(), usuario, accion, tipo, detalle || '', ip);
}

// ── Migración: columna unidad (para DBs creadas antes de agregar la columna) ─
try { db.exec('ALTER TABLE equipos ADD COLUMN unidad TEXT'); } catch {}
try { db.exec("ALTER TABLE mantenimientos ADD COLUMN matriculaResponsable TEXT DEFAULT ''"); } catch {}
try { db.exec('ALTER TABLE equipos ADD COLUMN activo INTEGER DEFAULT 1'); } catch {}

// ── Helpers ────────────────────────────────────────────────────────────────
// Convierte un objeto JS → row para SQLite (booleans → 0/1)
function toRow(obj) {
  const row = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'boolean') {
      row[k] = v ? 1 : 0;
    } else {
      row[k] = v ?? null;
    }
  }
  return row;
}

// Convierte una row de SQLite → objeto JS (0/1 → booleans)
function fromRow(row) {
  if (!row) return null;
  const obj = { ...row };
  for (const col of CHECKBOX_COLS) {
    if (col in obj) obj[col] = obj[col] === 1;
  }
  return obj;
}

// Columnas conocidas de la tabla equipos (para upsert dinámico)
const EQUIPO_COLS = db.prepare("PRAGMA table_info(equipos)").all().map(c => c.name);

// SEGURIDAD: Regex para validar nombres de columna — previene inyección SQL
const SAFE_COL_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function upsertEquipo(equipo) {
  const row = toRow(equipo);
  // SEGURIDAD: Solo permitir columnas que EXISTEN en la tabla
  // Esto previene inyección SQL en nombres de columna
  const cols = EQUIPO_COLS.filter(c => c in row);

  // Validación adicional: cada nombre de columna debe ser alfanumérico + guión bajo
  const safeCols = cols.filter(c => SAFE_COL_REGEX.test(c));

  if (safeCols.length === 0) return;

  const placeholders = safeCols.map(c => `@${c}`).join(', ');
  const colsList = safeCols.join(', ');

  // Construir objeto limpio solo con las columnas seguras
  const safeRow = {};
  for (const c of safeCols) {
    safeRow[c] = row[c];
  }

  const stmt = db.prepare(
    `INSERT OR REPLACE INTO equipos (${colsList}) VALUES (${placeholders})`
  );
  stmt.run(safeRow);
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
app.post('/api/login', loginLimiter, (req, res) => {
  const password = req.body.password || '';

  // Intentar login como admin
  let role = null;
  const adminHash = process.env.ADMIN_HASH;
  const viewerHash = process.env.VIEWER_HASH;

  if (adminHash && adminHash.startsWith('$2b$')) {
    if (bcrypt.compareSync(password, adminHash)) role = 'admin';
  } else {
    if (password === process.env.ADMIN_PASS) {
      role = 'admin';
      console.warn('⚠️  ADMIN_HASH no configurado. Genera con: node generate-hash.js');
    }
  }

  // Si no es admin, intentar como viewer
  if (!role) {
    if (viewerHash && viewerHash.startsWith('$2b$')) {
      if (bcrypt.compareSync(password, viewerHash)) role = 'viewer';
    } else {
      if (process.env.VIEWER_PASS && password === process.env.VIEWER_PASS) role = 'viewer';
    }
  }

  if (!role) return res.status(401).json({ error: 'Contraseña incorrecta' });

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { created: Date.now(), lastActivity: Date.now(), role });
  res.json({ token, role });
});

// ── EQUIPOS ────────────────────────────────────────────────────────────────
app.get('/api/equipos', (req, res) => {
  const incluirBajas = req.query.incluirBajas === 'true';
  const sql = incluirBajas
    ? 'SELECT * FROM equipos ORDER BY no ASC'
    : 'SELECT * FROM equipos WHERE (activo = 1 OR activo IS NULL) ORDER BY no ASC';
  const rows = db.prepare(sql).all();
  res.json(rows.map(fromRow));
});

app.post('/api/equipos', requireAuth, requireEditor, (req, res) => {
  const equipo = req.body;
  upsertEquipo(equipo);
  const created = fromRow(db.prepare('SELECT * FROM equipos WHERE id = ?').get(equipo.id));
  logAction(req, 'crear', 'equipo', `Serie: ${equipo.noSerie || '—'}, Área: ${equipo.area || '—'}`);
  res.status(201).json(created);
});

app.put('/api/equipos/bulk-responsable', requireAuth, requireEditor, (req, res) => {
  const { area, unidad, campos } = req.body;
  if (!area) return res.status(400).json({ error: 'area requerida' });
  const { nombres, apPaterno, apMaterno, correo, matricula, puesto, claveOrg, tipoContratacion } = campos;
  let sql = `UPDATE equipos SET nombres=@nombres, apPaterno=@apPaterno, apMaterno=@apMaterno,
    correo=@correo, matricula=@matricula, puesto=@puesto, claveOrg=@claveOrg,
    tipoContratacion=@tipoContratacion WHERE area=@area`;
  if (unidad) sql += ` AND unidad=@unidad`;
  const result = db.prepare(sql).run({ nombres, apPaterno, apMaterno, correo, matricula, puesto, claveOrg, tipoContratacion, area, unidad: unidad || null });
  logAction(req, 'editar', 'equipo', `Bulk responsable: ${area}${unidad ? ' / ' + unidad : ''} (${result.changes} equipos)`);
  res.json({ updated: result.changes });
});

app.put('/api/equipos/:id', requireAuth, requireEditor, (req, res) => {
  const equipo = { ...req.body, id: req.params.id };
  upsertEquipo(equipo);
  const updated = fromRow(db.prepare('SELECT * FROM equipos WHERE id = ?').get(req.params.id));
  logAction(req, 'editar', 'equipo', `ID: ${req.params.id}, Serie: ${equipo.noSerie || '—'}`);
  res.json(updated);
});

app.put('/api/equipos/:id/baja', requireAuth, requireEditor, (req, res) => {
  const row = db.prepare('SELECT activo, noSerie, alias FROM equipos WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Equipo no encontrado' });
  const nuevoEstado = (row.activo === 0) ? 1 : 0;
  db.prepare('UPDATE equipos SET activo = ? WHERE id = ?').run(nuevoEstado, req.params.id);
  const accion = nuevoEstado === 0 ? 'baja' : 'reactivar';
  const desc = row.alias || row.noSerie || req.params.id;
  logAction(req, accion, 'equipo', `Equipo ${desc} ${nuevoEstado === 0 ? 'dado de baja' : 'reactivado'}`);
  const updated = fromRow(db.prepare('SELECT * FROM equipos WHERE id = ?').get(req.params.id));
  res.json(updated);
});

app.post('/api/equipos/upsert', requireAuth, requireEditor, (req, res) => {
  const lista = req.body;
  if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba un array' });

  try {
    const result = { insertados: 0, actualizados: 0, sinCambios: 0 };

    const upsertCSV = db.transaction((items) => {
      for (const raw of items) {
        const row = toRow(raw);

        // Buscar match por noSerie (no vacío) o por (alias + area)
        let existing = null;
        if (row.noSerie && String(row.noSerie).trim()) {
          existing = db.prepare('SELECT * FROM equipos WHERE noSerie = ? COLLATE NOCASE').get(String(row.noSerie).trim());
        }
        if (!existing && row.alias && row.area) {
          existing = db.prepare('SELECT * FROM equipos WHERE alias = ? COLLATE NOCASE AND area = ? COLLATE NOCASE').get(row.alias, row.area);
        }

        if (existing) {
          // UPDATE solo campos con valor (no sobreescribir con vacío/null)
          const updates = [];
          const values = {};
          for (const col of EQUIPO_COLS) {
            if (col === 'id') continue;
            if (!(col in row)) continue;
            const val = row[col];
            if (val === null || val === undefined || val === '') continue;
            if (!SAFE_COL_REGEX.test(col)) continue;
            updates.push(`${col} = @${col}`);
            values[col] = val;
          }
          if (updates.length > 0) {
            values.id = existing.id;
            db.prepare(`UPDATE equipos SET ${updates.join(', ')} WHERE id = @id`).run(values);
            result.actualizados++;
          } else {
            result.sinCambios++;
          }
        } else {
          // INSERT nuevo
          if (!row.id) row.id = 'eq_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
          if (row.activo === undefined || row.activo === null) row.activo = 1;
          upsertEquipo(row);
          result.insertados++;
        }
      }
    });

    upsertCSV(lista);
    logAction(req, 'upsert', 'equipo', `Upsert CSV: ${result.insertados} insertados, ${result.actualizados} actualizados`);

    const rows = db.prepare('SELECT * FROM equipos ORDER BY no ASC').all();
    res.json({ ...result, equipos: rows.map(fromRow) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/equipos/:id', requireAuth, requireEditor, (req, res) => {
  db.prepare('DELETE FROM equipos WHERE id = ?').run(req.params.id);
  logAction(req, 'eliminar', 'equipo', `ID: ${req.params.id}`);
  res.json({ ok: true });
});

app.get('/api/equipos/serie/:serie', (req, res) => {
  const row = db.prepare('SELECT * FROM equipos WHERE noSerie = ? COLLATE NOCASE').get(req.params.serie);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  const eq = fromRow(row);
  res.json({
    noSerie: eq.noSerie || '',
    marca: eq.marca || '',
    modelo: eq.modelo || '',
    area: eq.area || '',
    nombres: eq.nombres || '',
    apPaterno: eq.apPaterno || '',
    matricula: eq.matricula || '',
  });
});

// ── EQUIPOS CON ESTADO (para Mapa) ─────────────────────────────────────────
const MANT_INTERVAL_MONTHS = 6;

app.get('/api/equipos/con-estado', requireAuth, (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT e.*,
        (SELECT COUNT(*) FROM tickets t
         WHERE t.equipoSerie = e.noSerie
           AND e.noSerie IS NOT NULL AND e.noSerie != ''
           AND t.estado != 'resuelto') as openTickets,
        (SELECT MAX(m.fecha) FROM mantenimientos m
         WHERE m.equipoId = e.id) as ultimoMantenimiento
      FROM equipos e
      WHERE (e.activo = 1 OR e.activo IS NULL)
      ORDER BY e.no ASC
    `).all();

    const hoy = new Date();
    const en15dias = new Date(hoy);
    en15dias.setDate(en15dias.getDate() + 15);

    const result = rows.map(row => {
      const eq = fromRow(row);

      if (row.openTickets > 0) {
        eq.estadoMapa = 'error';
      } else if (row.ultimoMantenimiento) {
        const ultimo = new Date(row.ultimoMantenimiento);
        const proximo = new Date(ultimo);
        proximo.setMonth(proximo.getMonth() + MANT_INTERVAL_MONTHS);
        eq.estadoMapa = proximo <= en15dias ? 'warn' : 'ok';
      } else {
        eq.estadoMapa = 'warn';
      }

      eq.ultimoMantenimiento = row.ultimoMantenimiento || null;
      delete eq.openTickets;
      return eq;
    });

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── TICKETS ────────────────────────────────────────────────────────────────
app.get('/api/tickets', requireAuth, (_req, res) => {
  const rows = db.prepare('SELECT * FROM tickets ORDER BY folio DESC').all();
  res.json(rows);
});

app.get('/api/tickets/folio/:folio', (req, res) => {
  const row = db.prepare('SELECT * FROM tickets WHERE folio = ?').get(Number(req.params.folio));
  if (!row) return res.status(404).json({ error: 'Folio no encontrado' });
  res.json(row);
});

app.post('/api/tickets', (req, res) => {
  const t = req.body;
  let folio;
  do {
    folio = Math.floor(100000 + Math.random() * 900000);
  } while (db.prepare('SELECT 1 FROM tickets WHERE folio = ?').get(folio));
  db.prepare(`
    INSERT OR REPLACE INTO tickets
      (id, folio, fecha, equipoSerie, equipoDesc, area, solicitante,
       matricula, descripcion, responsable, estado, respuesta, fechaResolucion)
    VALUES
      (@id, @folio, @fecha, @equipoSerie, @equipoDesc, @area, @solicitante,
       @matricula, @descripcion, @responsable, @estado, @respuesta, @fechaResolucion)
  `).run({
    id: t.id, folio, fecha: t.fecha,
    equipoSerie: t.equipoSerie ?? null, equipoDesc: t.equipoDesc ?? null,
    area: t.area ?? null, solicitante: t.solicitante ?? null,
    matricula: t.matricula ?? null, descripcion: t.descripcion ?? null,
    responsable: t.responsable ?? null, estado: t.estado ?? 'pendiente',
    respuesta: t.respuesta ?? null, fechaResolucion: t.fechaResolucion ?? null,
  });
  const created = db.prepare('SELECT * FROM tickets WHERE id = ?').get(t.id);
  logAction(req, 'crear', 'ticket', `Folio: ${folio}, Área: ${t.area || '—'}`);
  res.status(201).json(created);
});

app.put('/api/tickets/:id', requireAuth, requireEditor, (req, res) => {
  const t = { ...req.body, id: req.params.id };
  db.prepare(`
    INSERT OR REPLACE INTO tickets
      (id, folio, fecha, equipoSerie, equipoDesc, area, solicitante,
       matricula, descripcion, responsable, estado, respuesta, fechaResolucion)
    VALUES
      (@id, @folio, @fecha, @equipoSerie, @equipoDesc, @area, @solicitante,
       @matricula, @descripcion, @responsable, @estado, @respuesta, @fechaResolucion)
  `).run({
    id: t.id, folio: t.folio ?? null, fecha: t.fecha ?? null,
    equipoSerie: t.equipoSerie ?? null, equipoDesc: t.equipoDesc ?? null,
    area: t.area ?? null, solicitante: t.solicitante ?? null,
    matricula: t.matricula ?? null, descripcion: t.descripcion ?? null,
    responsable: t.responsable ?? null, estado: t.estado ?? 'pendiente',
    respuesta: t.respuesta ?? null, fechaResolucion: t.fechaResolucion ?? null,
  });
  const updated = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  logAction(req, 'editar', 'ticket', `ID: ${req.params.id}, Folio: ${t.folio || '—'}`);
  res.json(updated);
});

app.delete('/api/tickets/:id', requireAuth, requireEditor, (req, res) => {
  db.prepare('DELETE FROM tickets WHERE id = ?').run(req.params.id);
  logAction(req, 'eliminar', 'ticket', `ID: ${req.params.id}`);
  res.json({ ok: true });
});

// ── IMPORTAR (reemplaza todos los equipos) ─────────────────────────────────
app.post('/api/importar', requireAuth, requireEditor, (req, res) => {
  const equipos = req.body;
  if (!Array.isArray(equipos)) return res.status(400).json({ error: 'Se esperaba un array' });

  const importar = db.transaction((lista) => {
    db.prepare('DELETE FROM equipos').run();
    for (const eq of lista) upsertEquipo(eq);
  });
  importar(equipos);
  logAction(req, 'importar', 'equipo', `${equipos.length} equipos importados`);

  const rows = db.prepare('SELECT * FROM equipos ORDER BY no ASC').all();
  res.json(rows.map(fromRow));
});

// ── TABLA: criterios ────────────────────────────────────────────────────────
db.exec(`CREATE TABLE IF NOT EXISTS criterios (
  id TEXT PRIMARY KEY,
  equipoId TEXT,
  folio INTEGER,
  fecha TEXT,
  evaluador TEXT,
  matriculaEval TEXT,
  noSerie TEXT,
  area TEXT,
  usuario TEXT,
  cuenta TEXT,
  marca TEXT,
  modelo TEXT,
  hostname TEXT,
  ip TEXT,
  inventario TEXT,
  crit_contraseniaVisible INTEGER DEFAULT 0,
  crit_responsableCuentaGenerica INTEGER DEFAULT 0,
  crit_actualizacionesSO INTEGER DEFAULT 0,
  crit_borradoSeguro INTEGER DEFAULT 0,
  crit_equiposBloqueados INTEGER DEFAULT 0,
  crit_contraseniaEstandares INTEGER DEFAULT 0,
  crit_correoElectronico INTEGER DEFAULT 0,
  crit_respaldoCorreoPST INTEGER DEFAULT 0,
  crit_noProxyHistorial INTEGER DEFAULT 0,
  crit_noP2P INTEGER DEFAULT 0,
  crit_modemsNoAutorizados INTEGER DEFAULT 0,
  crit_carpetaDescargas INTEGER DEFAULT 0,
  crit_agenteSystemCenter INTEGER DEFAULT 0,
  crit_panelControlBloqueado INTEGER DEFAULT 0,
  crit_imagenInstitucional INTEGER DEFAULT 0,
  crit_softwareNoInstitucional INTEGER DEFAULT 0,
  crit_escritorioLimpio INTEGER DEFAULT 0,
  crit_equipoEnDominio INTEGER DEFAULT 0,
  crit_agenteActualizaciones INTEGER DEFAULT 0,
  crit_bloqueoAdmin INTEGER DEFAULT 0,
  crit_carpetasCompartidas INTEGER DEFAULT 0,
  crit_licenciamientoVigente INTEGER DEFAULT 0,
  calificacion REAL DEFAULT 0,
  soporte TEXT DEFAULT '',
  observaciones TEXT DEFAULT '',
  matriculaUsuario TEXT DEFAULT ''
)`);

// ── TABLA: mantenimientos ───────────────────────────────────────────────────
db.exec(`CREATE TABLE IF NOT EXISTS mantenimientos (
  id TEXT PRIMARY KEY,
  equipoId TEXT,
  tipo TEXT,
  folio INTEGER,
  fecha TEXT,
  sede TEXT DEFAULT 'Main Warehouse',
  lugar TEXT DEFAULT '',
  responsable TEXT DEFAULT '',
  noSerie TEXT DEFAULT '',
  area TEXT DEFAULT '',
  fueraServicio INTEGER DEFAULT 0,
  mant_limpCarcasa INTEGER DEFAULT 0,
  mant_limpPanel INTEGER DEFAULT 0,
  mant_limpTerminales INTEGER DEFAULT 0,
  mant_limpPuertaPapel INTEGER DEFAULT 0,
  mant_extResiduo INTEGER DEFAULT 0,
  mant_extResiduoTinta INTEGER DEFAULT 0,
  mant_sopleteo INTEGER DEFAULT 0,
  mant_limpFuente INTEGER DEFAULT 0,
  mant_limpCharola INTEGER DEFAULT 0,
  mant_revConexiones INTEGER DEFAULT 0,
  mant_revDisipador INTEGER DEFAULT 0,
  mant_revFusor INTEGER DEFAULT 0,
  mant_revSensores INTEGER DEFAULT 0,
  mant_revDanios INTEGER DEFAULT 0,
  mant_fotoEvidencia INTEGER DEFAULT 0,
  mant_revPerifericos INTEGER DEFAULT 0,
  mant_nivelToner INTEGER DEFAULT 0,
  mant_unidadImagen INTEGER DEFAULT 0,
  mant_kitMantenimiento INTEGER DEFAULT 0,
  mant_bioTapabocas INTEGER DEFAULT 0,
  mant_bioGuantes INTEGER DEFAULT 0,
  mant_bioImpermeable INTEGER DEFAULT 0,
  mant_bioProteccionVisual INTEGER DEFAULT 0,
  hora TEXT DEFAULT '',
  nombreUsuario TEXT DEFAULT '',
  matriculaUsuario TEXT DEFAULT '',
  nombreResponsable TEXT DEFAULT '',
  condiciones TEXT DEFAULT '',
  fotos TEXT DEFAULT '[]',
  firmaUsuario TEXT DEFAULT ''
)`);
const CRITERIOS_COLS = new Set(db.prepare("PRAGMA table_info(criterios)").all().map(c => c.name));
const MANTENIMIENTOS_COLS = new Set(db.prepare("PRAGMA table_info(mantenimientos)").all().map(c => c.name));

// ── Helpers INTEGER ↔ boolean ───────────────────────────────────────────────
function parseCritBools(row) {
  if (!row) return row;
  const r = { ...row };
  Object.keys(r).forEach(k => { if (k.startsWith('crit_')) r[k] = !!r[k]; });
  return r;
}

function parseMantBools(row) {
  if (!row) return row;
  const r = { ...row };
  Object.keys(r).forEach(k => {
    if (k.startsWith('mant_')) r[k] = !!r[k];
    if (k === 'fueraServicio') r[k] = !!r[k];
  });
  if (typeof r.fotos === 'string') { try { r.fotos = JSON.parse(r.fotos); } catch { r.fotos = []; } }
  return r;
}

// ── RUTAS: Criterios ────────────────────────────────────────────────────────
app.get('/api/criterios', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM criterios ORDER BY fecha DESC, folio DESC').all();
    res.json(rows.map(parseCritBools));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/criterios/equipo/:equipoId', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM criterios WHERE equipoId = ? ORDER BY fecha DESC').all(req.params.equipoId);
    res.json(rows.map(parseCritBools));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/criterios', requireAuth, requireEditor, (req, res) => {
  try {
    const c = req.body;
    if (!c.id) c.id = 'crit_' + Date.now();
    if (!c.folio) {
      const max = db.prepare('SELECT MAX(folio) as m FROM criterios').get();
      c.folio = (max?.m || 0) + 1;
    }
    const cols = Object.keys(c).filter(k => CRITERIOS_COLS.has(k));
    const safeCols = cols.filter(k => SAFE_COL_REGEX.test(k));
    const vals = safeCols.map(k => typeof c[k] === 'boolean' ? (c[k] ? 1 : 0) : c[k]);
    db.prepare(`INSERT OR REPLACE INTO criterios (${safeCols.join(',')}) VALUES (${safeCols.map(() => '?').join(',')})`).run(...vals);
    logAction(req, 'crear', 'criterio', `Folio: ${c.folio}, Serie: ${c.noSerie || '—'}`);
    res.json(parseCritBools(db.prepare('SELECT * FROM criterios WHERE id = ?').get(c.id)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/criterios/:id', requireAuth, requireEditor, (req, res) => {
  try {
    db.prepare('DELETE FROM criterios WHERE id = ?').run(req.params.id);
    logAction(req, 'eliminar', 'criterio', `ID: ${req.params.id}`);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── RUTAS: Mantenimientos ───────────────────────────────────────────────────
app.get('/api/mantenimientos', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM mantenimientos ORDER BY fecha DESC, folio DESC').all();
    res.json(rows.map(parseMantBools));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/mantenimientos/equipo/:equipoId', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM mantenimientos WHERE equipoId = ? ORDER BY fecha DESC').all(req.params.equipoId);
    res.json(rows.map(parseMantBools));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/mantenimientos', requireAuth, requireEditor, (req, res) => {
  try {
    const m = req.body;
    if (!m.id) m.id = 'mant_' + Date.now();
    if (!m.folio) {
      const max = db.prepare('SELECT MAX(folio) as m FROM mantenimientos').get();
      m.folio = (max?.m || 0) + 1;
    }
    const cols = Object.keys(m).filter(k => MANTENIMIENTOS_COLS.has(k));
    const safeCols = cols.filter(k => SAFE_COL_REGEX.test(k));
    const vals = safeCols.map(k => {
      if (typeof m[k] === 'boolean') return m[k] ? 1 : 0;
      if (typeof m[k] === 'object') return JSON.stringify(m[k]);
      return m[k];
    });
    db.prepare(`INSERT OR REPLACE INTO mantenimientos (${safeCols.join(',')}) VALUES (${safeCols.map(() => '?').join(',')})`).run(...vals);
    logAction(req, 'crear', 'mantenimiento', `Folio: ${m.folio}, Serie: ${m.noSerie || '—'}`);
    res.json(parseMantBools(db.prepare('SELECT * FROM mantenimientos WHERE id = ?').get(m.id)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/mantenimientos/:id', requireAuth, requireEditor, (req, res) => {
  try {
    db.prepare('DELETE FROM mantenimientos WHERE id = ?').run(req.params.id);
    logAction(req, 'eliminar', 'mantenimiento', `ID: ${req.params.id}`);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── AUDIT LOG ──────────────────────────────────────────────────────────────
app.get('/api/audit-log', requireAuth, (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT 500').all();
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── BACKUP ────────────────────────────────────────────────────────────────
const BACKUP_DIR = join(__dirname, 'backups');
const BACKUP_RED = process.env.BACKUP_RED || '';
const BACKUP_MAX_DAYS = 30;

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

function hacerBackup() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
  const nombre = `stockbase_${stamp}.db`;
  const destLocal = join(BACKUP_DIR, nombre);
  const srcPath = join(__dirname, 'stockbase.db');

  try {
    // Copiar base de datos
    if (typeof db.backup === 'function') {
      db.backup(destLocal);
    } else {
      fs.copyFileSync(srcPath, destLocal);
    }
    console.log(`💾 Backup completado: ${nombre}`);
  } catch (e) {
    console.error('❌ Error en backup local:', e.message);
    return { ok: false, error: e.message };
  }

  // Copiar a ruta de red si está configurada
  if (BACKUP_RED) {
    try {
      const destRed = join(BACKUP_RED, nombre);
      fs.copyFileSync(destLocal, destRed);
      console.log(`📡 Backup en red: ${destRed}`);
    } catch (e) {
      console.warn(`⚠️  No se pudo copiar a red (${BACKUP_RED}): ${e.message}`);
    }
  }

  // Limpiar backups locales de más de 30 días
  try {
    const limite = Date.now() - BACKUP_MAX_DAYS * 24 * 60 * 60 * 1000;
    for (const file of fs.readdirSync(BACKUP_DIR)) {
      const filePath = join(BACKUP_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < limite) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Backup antiguo eliminado: ${file}`);
      }
    }
  } catch (e) {
    console.warn('⚠️  Error limpiando backups antiguos:', e.message);
  }

  return { ok: true, archivo: nombre };
}

// Backup al arrancar y cada 6 horas
hacerBackup();
setInterval(hacerBackup, 24 * 60 * 60 * 1000);

app.post('/api/backup', requireAuth, requireEditor, (_req, res) => {
  const result = hacerBackup();
  if (result.ok) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// ── SPA fallback ───────────────────────────────────────────────────────────
app.get('/{*splat}', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ── Error handler global (Express 5 devuelve HTML por defecto; esto fuerza JSON) ──
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[server error]', err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
