const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { dbRun, dbAll, dbGet } = require('./database');
const { exportResponsesToExcel } = require('./data-export');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 signatures

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ---------------- AUTH ROUTES ----------------

// Admin Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'maulanafkui2026';

  if (username === adminUsername && password === adminPassword) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, username });
  } else {
    return res.status(401).json({ message: 'Kombinasi username atau password salah' });
  }
});

// Verify Token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, username: req.user.username });
});

// ---------------- PUBLIC SURVEY SUBMISSION ----------------

// Submit Questionnaire
app.post('/api/kuesioner', async (req, res) => {
  try {
    const data = req.body;

    // Validate required screening and consent fields
    const requiredFields = [
      'parent_name', 'parent_student_name', 'parent_signature',
      'student_name', 'student_signature', 'gender', 'age', 'school',
      'is_transfer', 'class_grade'
    ];

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        return res.status(400).json({ message: `Field ${field} wajib diisi` });
      }
    }

    // Check Eligibility (Screening Step 3)
    const ageNum = parseInt(data.age, 10);
    const isTransferNum = parseInt(data.is_transfer, 10);
    const transferDuration = data.transfer_duration !== undefined && data.transfer_duration !== null
      ? parseFloat(data.transfer_duration)
      : null;

    let isEligible = 1;
    if (ageNum !== 16 && ageNum !== 17 && ageNum !== 18) {
      isEligible = 0;
    }
    if (isTransferNum === 1 && (transferDuration === null || transferDuration < 0.5)) {
      isEligible = 0;
    }

    // Map questionnaire answers based on eligibility
    let hasBackPain = null;
    let painDuration = null;
    let causeCedera = 0, causeDudukLama = 0, causeSkoliosis = 0, causeTumor = 0, causeDokter = 0;
    let causeDokterDetail = null;
    let causeLainnya = 0;
    let causeLainnyaDetail = null;
    let areaCervical = 0, areaThoracal = 0, areaLumbal = 0;
    let actionObatBebas = 0, actionDrTanpaObat = 0, actionDrDengan_obat = 0, actionPijat = 0, actionChiro = 0, actionOperasi = 0, actionLainnya = 0;
    let actionLainnyaDetail = null;
    let painSeverity = null;
    let painSeverityCat = -1;

    if (isEligible === 1) {
      hasBackPain = parseInt(data.has_back_pain, 10);

      // If they have back pain, map details
      if (hasBackPain === 1) {
        painDuration = parseInt(data.pain_duration, 10);
        
        // Causes (Etiology)
        if (data.pain_causes) {
          causeCedera = data.pain_causes.cedera ? 1 : 0;
          causeDudukLama = data.pain_causes.duduk_lama ? 1 : 0;
          causeSkoliosis = data.pain_causes.skoliosis ? 1 : 0;
          causeTumor = data.pain_causes.tumor ? 1 : 0;
          causeDokter = data.pain_causes.dokter_diagnosa ? 1 : 0;
          causeDokterDetail = data.pain_causes.dokter_diagnosa_detail || null;
          causeLainnya = data.pain_causes.lainnya ? 1 : 0;
          causeLainnyaDetail = data.pain_causes.pain_causes_other_detail || null;
        }

        // Areas (Anatomy)
        if (data.pain_areas) {
          areaCervical = data.pain_areas.leher ? 1 : 0;
          areaThoracal = data.pain_areas.dada ? 1 : 0;
          areaLumbal = data.pain_areas.pinggang ? 1 : 0;
        }

        // Actions (Management)
        if (data.pain_actions) {
          actionObatBebas = data.pain_actions.obat_bebas ? 1 : 0;
          actionDrTanpaObat = data.pain_actions.dokter_tanpa_obat ? 1 : 0;
          actionDrDengan_obat = data.pain_actions.dokter_dengan_obat ? 1 : 0;
          actionPijat = data.pain_actions.pijat ? 1 : 0;
          actionChiro = data.pain_actions.chiropractor ? 1 : 0;
          actionOperasi = data.pain_actions.operasi ? 1 : 0;
          actionLainnya = data.pain_actions.lainnya ? 1 : 0;
          actionLainnyaDetail = data.pain_actions.action_lainnya_detail || null;
        }

        // Severity Scale
        if (data.pain_severity !== undefined && data.pain_severity !== null) {
          painSeverity = parseInt(data.pain_severity, 10);
          if (painSeverity === 0) {
            painSeverityCat = 0; // Tidak sakit
          } else if (painSeverity >= 1 && painSeverity <= 3) {
            painSeverityCat = 1; // Ringan
          } else if (painSeverity >= 4 && painSeverity <= 6) {
            painSeverityCat = 2; // Sedang
          } else if (painSeverity >= 7 && painSeverity <= 10) {
            painSeverityCat = 3; // Berat
          }
        }
      } else if (hasBackPain === 0) {
        painDuration = 4; // Tidak pernah nyeri
        painSeverityCat = -1; // Null for no pain
      }
    }

    // Insert response into DB
    const sql = `
      INSERT INTO responses (
        parent_name, parent_student_name, parent_signature,
        student_name, student_signature, gender, age, school,
        is_transfer, transfer_duration, class_grade,
        has_back_pain, pain_duration,
        cause_cedera, cause_duduk_lama, cause_skoliosis, cause_tumor, cause_dokter, cause_dokter_detail, cause_lainnya, cause_lainnya_detail,
        area_cervical, area_thoracal, area_lumbal,
        action_obat_bebas, action_dr_tanpa_obat, action_dr_dengan_obat, action_pijat, action_chiro, action_operasi, action_lainnya, action_lainnya_detail,
        pain_severity, pain_severity_cat, is_eligible
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.parent_name, data.parent_student_name, data.parent_signature,
      data.student_name, data.student_signature, parseInt(data.gender, 10), ageNum, data.school,
      isTransferNum, transferDuration, parseInt(data.class_grade, 10),
      hasBackPain, painDuration,
      causeCedera, causeDudukLama, causeSkoliosis, causeTumor, causeDokter, causeDokterDetail, causeLainnya, causeLainnyaDetail,
      areaCervical, areaThoracal, areaLumbal,
      actionObatBebas, actionDrTanpaObat, actionDrDengan_obat, actionPijat, actionChiro, actionOperasi, actionLainnya, actionLainnyaDetail,
      painSeverity, painSeverityCat, isEligible
    ];

    await dbRun(sql, params);

    return res.status(201).json({
      success: true,
      isEligible: isEligible === 1,
      message: isEligible === 1
        ? 'Kuesioner berhasil dikirim dan lolos skrining.'
        : 'Kuesioner disimpan. Anda tidak memenuhi kriteria inklusi penelitian (Tereliminasi).'
    });

  } catch (error) {
    console.error('Error submitting survey:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengirim data' });
  }
});

// ---------------- SECURE ADMIN ROUTES ----------------

// Get Dashboard Overview Metrics
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    const totalLolos = await dbGet('SELECT COUNT(*) as count FROM responses WHERE is_eligible = 1');
    const totalTereliminasi = await dbGet('SELECT COUNT(*) as count FROM responses WHERE is_eligible = 0');
    const painYa = await dbGet('SELECT COUNT(*) as count FROM responses WHERE is_eligible = 1 AND has_back_pain = 1');
    const painTidak = await dbGet('SELECT COUNT(*) as count FROM responses WHERE is_eligible = 1 AND has_back_pain = 0');

    res.json({
      targetTotal: 120,
      totalLolos: totalLolos.count,
      totalTereliminasi: totalTereliminasi.count,
      prevalence: {
        ya: painYa.count,
        tidak: painTidak.count
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Get Survey Responses (Data Table)
app.get('/api/admin/responses', authenticateToken, async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const filterEligible = req.query.eligible || '1'; // Default: only show eligible

    let sql = 'SELECT * FROM responses';
    const params = [];

    const conditions = [];
    if (filterEligible !== 'all') {
      conditions.push('is_eligible = ?');
      params.push(parseInt(filterEligible, 10));
    }

    if (searchQuery) {
      conditions.push('(student_name LIKE ? OR school LIKE ?)');
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const responses = await dbAll(sql, params);
    res.json(responses);
  } catch (error) {
    console.error('Error fetching responses table:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Helper for live dummy table percentages
function calcPct(n, total) {
  if (total === 0) return '0.0%';
  return ((n / total) * 100).toFixed(1) + '%';
}

// Get Live Dummy Tables Data (Table 1 & Table 2)
app.get('/api/admin/dummy-tables', authenticateToken, async (req, res) => {
  try {
    // Table 1 data: Cross-tab of variables by Gender (1 = Laki-laki, 2 = Perempuan)
    const eligibleRows = await dbAll('SELECT * FROM responses WHERE is_eligible = 1');
    
    // Group totals
    const totalLaki = eligibleRows.filter(r => r.gender === 1).length;
    const totalPerempuan = eligibleRows.filter(r => r.gender === 2).length;
    const totalAll = eligibleRows.length;

    // Helper to calculate variables
    const getVarDistribution = (filterFn) => {
      const nLaki = eligibleRows.filter(r => r.gender === 1 && filterFn(r)).length;
      const nPerempuan = eligibleRows.filter(r => r.gender === 2 && filterFn(r)).length;
      const nTotal = eligibleRows.filter(filterFn).length;
      
      return {
        lakiN: nLaki,
        lakiPct: calcPct(nLaki, totalLaki),
        perempuanN: nPerempuan,
        perempuanPct: calcPct(nPerempuan, totalPerempuan),
        totalN: nTotal,
        totalPct: calcPct(nTotal, totalAll)
      };
    };

    // Calculate Table 1 rows
    const table1 = {
      age_16: getVarDistribution(r => r.age === 16),
      age_17: getVarDistribution(r => r.age === 17),
      age_18: getVarDistribution(r => r.age === 18),
      
      pain_ya: getVarDistribution(r => r.has_back_pain === 1),
      pain_tidak: getVarDistribution(r => r.has_back_pain === 0),
      
      duration_acute: getVarDistribution(r => r.has_back_pain === 1 && r.pain_duration === 1),
      duration_subacute: getVarDistribution(r => r.has_back_pain === 1 && r.pain_duration === 2),
      duration_chronic: getVarDistribution(r => r.has_back_pain === 1 && r.pain_duration === 3),
      duration_none: getVarDistribution(r => r.pain_duration === 4),

      cause_cedera: getVarDistribution(r => r.has_back_pain === 1 && r.cause_cedera === 1),
      cause_duduk: getVarDistribution(r => r.has_back_pain === 1 && r.cause_duduk_lama === 1),
      cause_skoliosis: getVarDistribution(r => r.has_back_pain === 1 && r.cause_skoliosis === 1),
      cause_tumor: getVarDistribution(r => r.has_back_pain === 1 && r.cause_tumor === 1),
      cause_dokter: getVarDistribution(r => r.has_back_pain === 1 && r.cause_dokter === 1),
      cause_lainnya: getVarDistribution(r => r.has_back_pain === 1 && r.cause_lainnya === 1),

      area_cervical: getVarDistribution(r => r.has_back_pain === 1 && r.area_cervical === 1),
      area_thoracal: getVarDistribution(r => r.has_back_pain === 1 && r.area_thoracal === 1),
      area_lumbal: getVarDistribution(r => r.has_back_pain === 1 && r.area_lumbal === 1),

      action_obat_bebas: getVarDistribution(r => r.has_back_pain === 1 && r.action_obat_bebas === 1),
      action_dr_tanpa: getVarDistribution(r => r.has_back_pain === 1 && r.action_dr_tanpa_obat === 1),
      action_dr_dengan: getVarDistribution(r => r.has_back_pain === 1 && r.action_dr_dengan_obat === 1),
      action_pijat: getVarDistribution(r => r.has_back_pain === 1 && r.action_pijat === 1),
      action_chiro: getVarDistribution(r => r.has_back_pain === 1 && r.action_chiro === 1),
      action_operasi: getVarDistribution(r => r.has_back_pain === 1 && r.action_operasi === 1),
      action_lainnya: getVarDistribution(r => r.has_back_pain === 1 && r.action_lainnya === 1),

      severity_0: getVarDistribution(r => r.has_back_pain === 1 && r.pain_severity_cat === 0),
      severity_1_3: getVarDistribution(r => r.has_back_pain === 1 && r.pain_severity_cat === 1),
      severity_4_6: getVarDistribution(r => r.has_back_pain === 1 && r.pain_severity_cat === 2),
      severity_7_10: getVarDistribution(r => r.has_back_pain === 1 && r.pain_severity_cat === 3),
    };

    // Calculate Table 2: Descriptives for age of eligible respondents
    const ages = eligibleRows.map(r => r.age).filter(a => typeof a === 'number');
    
    let mean = 0;
    let sd = 0;
    let median = 0;
    let min = 0;
    let max = 0;

    if (ages.length > 0) {
      // Mean
      const sum = ages.reduce((a, b) => a + b, 0);
      mean = sum / ages.length;

      // SD
      if (ages.length > 1) {
        const variance = ages.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (ages.length - 1);
        sd = Math.sqrt(variance);
      } else {
        sd = 0;
      }

      // Median
      const sortedAges = [...ages].sort((a, b) => a - b);
      const mid = Math.floor(sortedAges.length / 2);
      median = sortedAges.length % 2 !== 0 
        ? sortedAges[mid] 
        : (sortedAges[mid - 1] + sortedAges[mid]) / 2;

      // Min/Max
      min = Math.min(...ages);
      max = Math.max(...ages);
    }

    res.json({
      totals: { laki: totalLaki, perempuan: totalPerempuan, all: totalAll },
      table1,
      table2: {
        mean: mean.toFixed(2),
        sd: sd.toFixed(2),
        median: median,
        min: min,
        max: max
      }
    });

  } catch (error) {
    console.error('Error building dummy tables:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Get Detailed Dashboard Statistics
app.get('/api/admin/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const overview = await dbGet(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_eligible = 1 THEN 1 ELSE 0 END) as eligible,
        SUM(CASE WHEN is_eligible = 0 THEN 1 ELSE 0 END) as excluded
      FROM responses
    `);

    const eligibleCount = overview.eligible || 0;

    const genderData = await dbAll(`
      SELECT gender, COUNT(*) as count 
      FROM responses 
      WHERE is_eligible = 1 
      GROUP BY gender
    `);

    const ageData = await dbAll(`
      SELECT age, COUNT(*) as count 
      FROM responses 
      WHERE is_eligible = 1 
      GROUP BY age 
      ORDER BY age ASC
    `);

    const classData = await dbAll(`
      SELECT class_grade, COUNT(*) as count 
      FROM responses 
      WHERE is_eligible = 1 
      GROUP BY class_grade 
      ORDER BY class_grade ASC
    `);

    const schoolData = await dbAll(`
      SELECT school, COUNT(*) as count 
      FROM responses 
      WHERE is_eligible = 1 
      GROUP BY school 
      ORDER BY count DESC
    `);

    const prevalenceData = await dbAll(`
      SELECT has_back_pain, COUNT(*) as count 
      FROM responses 
      WHERE is_eligible = 1 
      GROUP BY has_back_pain
    `);

    const severityCatData = await dbAll(`
      SELECT pain_severity_cat, COUNT(*) as count 
      FROM responses 
      WHERE is_eligible = 1 AND has_back_pain = 1 
      GROUP BY pain_severity_cat 
      ORDER BY pain_severity_cat ASC
    `);

    const avgSeverity = await dbGet(`
      SELECT AVG(pain_severity) as avg_score 
      FROM responses 
      WHERE is_eligible = 1 AND has_back_pain = 1 AND pain_severity IS NOT NULL
    `);

    const durationData = await dbAll(`
      SELECT pain_duration, COUNT(*) as count 
      FROM responses 
      WHERE is_eligible = 1 AND has_back_pain = 1 
      GROUP BY pain_duration 
      ORDER BY pain_duration ASC
    `);

    const causesData = await dbGet(`
      SELECT 
        SUM(cause_cedera) as cedera,
        SUM(cause_duduk_lama) as duduk_lama,
        SUM(cause_skoliosis) as skoliosis,
        SUM(cause_tumor) as tumor,
        SUM(cause_dokter) as dokter,
        SUM(cause_lainnya) as lainnya
      FROM responses
      WHERE is_eligible = 1 AND has_back_pain = 1
    `);

    const areasData = await dbGet(`
      SELECT 
        SUM(area_cervical) as cervical,
        SUM(area_thoracal) as thoracal,
        SUM(area_lumbal) as lumbal
      FROM responses
      WHERE is_eligible = 1 AND has_back_pain = 1
    `);

    const actionsData = await dbGet(`
      SELECT 
        SUM(action_obat_bebas) as obat_bebas,
        SUM(action_dr_tanpa_obat) as dr_tanpa_obat,
        SUM(action_dr_dengan_obat) as dr_dengan_obat,
        SUM(action_pijat) as pijat,
        SUM(action_chiro) as chiro,
        SUM(action_operasi) as operasi,
        SUM(action_lainnya) as lainnya
      FROM responses
      WHERE is_eligible = 1 AND has_back_pain = 1
    `);

    res.json({
      overview: {
        total: overview.total || 0,
        eligible: eligibleCount,
        excluded: overview.excluded || 0,
        targetTotal: 120
      },
      gender: {
        laki: genderData.find(g => g.gender === 1)?.count || 0,
        perempuan: genderData.find(g => g.gender === 2)?.count || 0
      },
      age: {
        age16: ageData.find(a => a.age === 16)?.count || 0,
        age17: ageData.find(a => a.age === 17)?.count || 0,
        age18: ageData.find(a => a.age === 18)?.count || 0
      },
      classGrade: {
        class10: classData.find(c => c.class_grade === 1)?.count || 0,
        class11: classData.find(c => c.class_grade === 2)?.count || 0,
        class12: classData.find(c => c.class_grade === 3)?.count || 0
      },
      schools: schoolData.map(s => ({ school: s.school, count: s.count })),
      prevalence: {
        ya: prevalenceData.find(p => p.has_back_pain === 1)?.count || 0,
        tidak: prevalenceData.find(p => p.has_back_pain === 0)?.count || 0
      },
      severity: {
        avgScore: avgSeverity?.avg_score ? parseFloat(avgSeverity.avg_score.toFixed(2)) : 0,
        cat0: severityCatData.find(s => s.pain_severity_cat === 0)?.count || 0,
        cat1: severityCatData.find(s => s.pain_severity_cat === 1)?.count || 0,
        cat2: severityCatData.find(s => s.pain_severity_cat === 2)?.count || 0,
        cat3: severityCatData.find(s => s.pain_severity_cat === 3)?.count || 0
      },
      duration: {
        acute: durationData.find(d => d.pain_duration === 1)?.count || 0,
        subacute: durationData.find(d => d.pain_duration === 2)?.count || 0,
        chronic: durationData.find(d => d.pain_duration === 3)?.count || 0,
        none: durationData.find(d => d.pain_duration === 4)?.count || 0
      },
      causes: {
        cedera: causesData?.cedera || 0,
        dudukLama: causesData?.duduk_lama || 0,
        skoliosis: causesData?.skoliosis || 0,
        tumor: causesData?.tumor || 0,
        dokter: causesData?.dokter || 0,
        lainnya: causesData?.lainnya || 0
      },
      areas: {
        cervical: areasData?.cervical || 0,
        thoracal: areasData?.thoracal || 0,
        lumbal: areasData?.lumbal || 0
      },
      actions: {
        obatBebas: actionsData?.obat_bebas || 0,
        drTanpaObat: actionsData?.dr_tanpa_obat || 0,
        drDenganObat: actionsData?.dr_dengan_obat || 0,
        pijat: actionsData?.pijat || 0,
        chiro: actionsData?.chiro || 0,
        operasi: actionsData?.operasi || 0,
        lainnya: actionsData?.lainnya || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Export responses to XLSX Excel file
app.get('/api/admin/export', async (req, res) => {
  // Support either authorization header or token query parameter for easy anchor downloads
  const token = req.query.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (!token) {
    return res.status(401).json({ message: 'Token otorisasi diperlukan' });
  }

  jwt.verify(token, JWT_SECRET, async (err) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid' });
    }

    try {
      // Fetch only eligible ones or all? The PRD says "ekspor otomatis seluruh baris database"
      // We will export all rows, let Maulana filter if needed, but we keep it clear
      const rows = await dbAll('SELECT * FROM responses ORDER BY created_at ASC');
      const excelBuffer = exportResponsesToExcel(rows);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Data_Kuesioner_SPSS_Maulana.xlsx');
      res.send(excelBuffer);
    } catch (error) {
      console.error('Error generating Excel download:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat memproses ekspor Excel' });
    }
  });
});

// Export responses to CSV text file
app.get('/api/admin/export-csv', async (req, res) => {
  const token = req.query.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (!token) {
    return res.status(401).json({ message: 'Token otorisasi diperlukan' });
  }

  jwt.verify(token, JWT_SECRET, async (err) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid' });
    }

    try {
      const rows = await dbAll('SELECT * FROM responses ORDER BY created_at ASC');
      if (rows.length === 0) {
        return res.status(404).send('No data to export');
      }

      // Generate CSV string
      const headers = Object.keys(rows[0]);
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const row of rows) {
        const values = headers.map(header => {
          const val = row[header];
          if (val === null || val === undefined) return '';
          // Escape quotes and commas
          const valStr = String(val).replace(/"/g, '""');
          return valStr.includes(',') || valStr.includes('\n') || valStr.includes('"')
            ? `"${valStr}"`
            : valStr;
        });
        csvRows.push(values.join(','));
      }

      const csvContent = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=Data_Kuesioner_SPSS_Maulana.csv');
      res.send(csvContent);
    } catch (error) {
      console.error('Error generating CSV download:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat memproses ekspor CSV' });
    }
  });
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
