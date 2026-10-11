<template>
  <div class="admin-container animate-fade">
    
    <!-- Top Nav Bar -->
    <nav class="admin-nav">
      <div class="nav-brand">
        <span class="nav-icon">📊</span>
        <div>
          <h2>Dasbor Kontrol Peneliti</h2>
          <p>Maulana Yusuf Angkasa &bull; FKUI 2026</p>
        </div>
      </div>
      <div class="nav-actions">
        <!-- Export Buttons in Header -->
        <button @click="downloadExcel" class="btn btn-primary btn-sm" :disabled="exporting" style="box-shadow: none;">
          📥 {{ exporting ? 'Proses...' : 'Ekspor Excel (SPSS)' }}
        </button>
        <button @click="downloadCSV" class="btn btn-secondary btn-sm" :disabled="exporting">
          📄 Ekspor CSV Mentah
        </button>
        <router-link to="/" class="btn btn-secondary btn-sm">Ke Kuesioner</router-link>
        <button @click="handleLogout" class="btn btn-danger btn-sm">Keluar</button>
      </div>
    </nav>

    <div class="admin-content">
      
      <!-- LOADING & ERROR STATES -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat data dasbor...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p>⚠️ {{ error }}</p>
        <button @click="fetchData" class="btn btn-primary btn-sm">Coba Lagi</button>
      </div>

      <div v-else>
        <!-- STATS OVERVIEW CARDS -->
        <div class="stats-grid">
          <!-- Progress Tracker Card -->
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">Target Responden</span>
              <span class="stat-icon">🎯</span>
            </div>
            <div class="stat-value">{{ stats.totalLolos }} / {{ stats.targetTotal }}</div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: Math.min((stats.totalLolos / stats.targetTotal) * 100, 100) + '%' }"></div>
            </div>
            <span class="stat-desc">{{ ((stats.totalLolos / stats.targetTotal) * 100).toFixed(1) }}% Tercapai (Lolos Skrining)</span>
          </div>

          <!-- Prevalence Card -->
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">Prevalensi Back Pain</span>
              <span class="stat-icon">🤕</span>
            </div>
            <div class="stat-value">{{ prevalencePercent }}</div>
            <div class="prevalence-pie-bar">
              <div class="pie-fill ya" :style="{ width: prevalencePctRaw + '%' }"></div>
              <div class="pie-fill tidak" :style="{ width: (100 - prevalencePctRaw) + '%' }"></div>
            </div>
            <span class="stat-desc">Ya: {{ stats.prevalence.ya }} siswa | Tidak: {{ stats.prevalence.tidak }} siswa</span>
          </div>

          <!-- Eliminated Card -->
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">Responden Tereliminasi</span>
              <span class="stat-icon">❌</span>
            </div>
            <div class="stat-value">{{ stats.totalTereliminasi }}</div>
            <div class="eliminated-indicator">
              <span class="badge badge-red">Exclusion Rate: {{ exclusionRate }}</span>
            </div>
            <span class="stat-desc">Siswa yang tidak lolos skrining usia/studi</span>
          </div>
        </div>

        <!-- TABS NAV -->
        <div class="tab-header">
          <button 
            @click="activeTab = 'dashboard'" 
            class="tab-btn" 
            :class="{ active: activeTab === 'dashboard' }"
          >
            📊 Visual Dashboard Statistik
          </button>
          <button 
            @click="activeTab = 'tables'" 
            class="tab-btn" 
            :class="{ active: activeTab === 'tables' }"
          >
            📋 Tabel Dummy Bab 4 Skripsi (Live)
          </button>
          <button 
            @click="activeTab = 'database'" 
            class="tab-btn" 
            :class="{ active: activeTab === 'database' }"
          >
            🗂️ Data Mentah Responden
          </button>
        </div>

        <!-- TAB CONTENT 0: VISUAL DASHBOARD -->
        <div v-if="activeTab === 'dashboard'" class="tab-panel animate-fade">
          <div class="panel-header">
            <h3>Visual Dashboard Statistik (Responden Lolos Skrining)</h3>
            <p>Representasi grafis data kuesioner medis untuk mempermudah visualisasi tren.</p>
          </div>

          <div v-if="loadingDashboard" class="loading-state" style="padding: 40px 20px;">
            <div class="spinner"></div>
            <p>Memproses visualisasi...</p>
          </div>

          <div v-else-if="!dashboardStats" class="error-state">
            <p>Gagal memuat visualisasi statistik.</p>
          </div>

          <div v-else class="dashboard-visual-grid">
            <!-- SECTION 1: DEMOGRAFI -->
            <div class="dashboard-section-card">
              <h4 class="section-title">👥 Karakteristik Demografi (N = {{ dbTotalEligible }})</h4>
              
              <div class="widgets-container">
                <!-- Gender Card (Donut Chart SVG) -->
                <div class="widget-item">
                  <span class="widget-subtitle">Distribusi Jenis Kelamin</span>
                  <div class="donut-chart-wrapper">
                    <svg width="120" height="120" viewBox="0 0 120 120" class="donut-chart">
                      <!-- Pink for Perempuan -->
                      <circle cx="60" cy="60" r="45" fill="transparent" stroke="#ff8a80" stroke-width="12" />
                      <!-- Blue for Laki-laki -->
                      <circle cx="60" cy="60" r="45" fill="transparent" 
                              stroke="#58a6ff" stroke-width="12"
                              stroke-dasharray="282.7" 
                              :stroke-dashoffset="282.7 - (282.7 * dbGenderLakiPct) / 100" 
                              stroke-linecap="round"
                              transform="rotate(-90 60 60)" />
                    </svg>
                    <div class="donut-center-text">
                      <span class="center-value">{{ dbGenderLakiPct.toFixed(1) }}%</span>
                      <span class="center-desc">Laki-laki</span>
                    </div>
                  </div>
                  <div class="chart-legend">
                    <span class="legend-dot blue"></span> Laki-laki: {{ dashboardStats.gender.laki }} siswa ({{ dbGenderLakiPct.toFixed(1) }}%)
                    <br>
                    <span class="legend-dot pink"></span> Perempuan: {{ dashboardStats.gender.perempuan }} siswa ({{ dbGenderPerempuanPct.toFixed(1) }}%)
                  </div>
                </div>

                <!-- Age & Class Grade Distributions (Horizontal Bars) -->
                <div class="widget-item">
                  <span class="widget-subtitle">Distribusi Usia Responden</span>
                  <div class="bar-chart-group">
                    <div class="bar-chart-row">
                      <span class="bar-label">16 Tahun</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbAge16Pct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.age.age16 }} ({{ dbAge16Pct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label">17 Tahun</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbAge17Pct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.age.age17 }} ({{ dbAge17Pct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label">18 Tahun</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbAge18Pct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.age.age18 }} ({{ dbAge18Pct.toFixed(1) }}%)</span>
                    </div>
                  </div>

                  <span class="widget-subtitle" style="margin-top: 24px;">Distribusi Tingkat Kelas</span>
                  <div class="bar-chart-group">
                    <div class="bar-chart-row">
                      <span class="bar-label">Kelas 10</span>
                      <div class="bar-track">
                        <div class="bar-fill green" :style="{ width: dbClass10Pct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.classGrade.class10 }} ({{ dbClass10Pct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label">Kelas 11</span>
                      <div class="bar-track">
                        <div class="bar-fill green" :style="{ width: dbClass11Pct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.classGrade.class11 }} ({{ dbClass11Pct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label">Kelas 12</span>
                      <div class="bar-track">
                        <div class="bar-fill green" :style="{ width: dbClass12Pct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.classGrade.class12 }} ({{ dbClass12Pct.toFixed(1) }}%)</span>
                    </div>
                  </div>
                </div>

                <!-- Top Schools Distribution (List + Bar) -->
                <div class="widget-item">
                  <span class="widget-subtitle">Sebaran Sekolah Teratas</span>
                  <div class="schools-ranking-list">
                    <div v-for="(item, idx) in dashboardStats.schools.slice(0, 5)" :key="idx" class="school-rank-row">
                      <div class="school-info">
                        <span class="school-num">#{{ idx + 1 }}</span>
                        <span class="school-name" :title="item.school">{{ item.school }}</span>
                      </div>
                      <div class="school-bar-wrapper">
                        <div class="school-bar-fill" :style="{ width: ((item.count / (dashboardStats.schools[0]?.count || 1)) * 100) + '%' }"></div>
                      </div>
                      <span class="school-count">{{ item.count }} Siswa</span>
                    </div>
                    <div v-if="dashboardStats.schools.length === 0" class="no-data-msg">
                      Belum ada data sekolah terdaftar.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 2: BACK PAIN PREVALENCE & SEVERITY -->
            <div class="dashboard-section-card" style="margin-top: 24px;">
              <h4 class="section-title">🤕 Keluhan Back Pain & Skala Tingkat Keparahan</h4>
              
              <div class="widgets-container">
                <!-- Prevalence Donut Chart -->
                <div class="widget-item">
                  <span class="widget-subtitle">Prevalensi Keluhan</span>
                  <div class="donut-chart-wrapper">
                    <svg width="120" height="120" viewBox="0 0 120 120" class="donut-chart">
                      <!-- Green for Tidak -->
                      <circle cx="60" cy="60" r="45" fill="transparent" stroke="#66bb6a" stroke-width="12" />
                      <!-- Red for Ya -->
                      <circle cx="60" cy="60" r="45" fill="transparent" 
                              stroke="#ef5350" stroke-width="12"
                              stroke-dasharray="282.7" 
                              :stroke-dashoffset="282.7 - (282.7 * dbPrevalenceYaPct) / 100" 
                              stroke-linecap="round"
                              transform="rotate(-90 60 60)" />
                    </svg>
                    <div class="donut-center-text">
                      <span class="center-value yellow">{{ dbPrevalenceYaPct.toFixed(1) }}%</span>
                      <span class="center-desc">Pernah Back Pain</span>
                    </div>
                  </div>
                  <div class="chart-legend">
                    <span class="legend-dot red"></span> Ya (Pernah): {{ dashboardStats.prevalence.ya }} siswa ({{ dbPrevalenceYaPct.toFixed(1) }}%)
                    <br>
                    <span class="legend-dot green"></span> Tidak: {{ dashboardStats.prevalence.tidak }} siswa ({{ dbPrevalenceTidakPct.toFixed(1) }}%)
                  </div>
                </div>

                <!-- NRS Score & Kategori -->
                <div class="widget-item">
                  <span class="widget-subtitle">Skala Keparahan Nyeri (NRS)</span>
                  <div class="nrs-score-display">
                    <div class="nrs-big-score">{{ dbSeverityAvgScore }}</div>
                    <div class="nrs-score-desc">
                      <span>Rata-Rata Skor NRS</span>
                      <span class="nrs-badge" :class="{ 
                        'nrs-badge-mild': dbSeverityAvgScore > 0 && dbSeverityAvgScore <= 3,
                        'nrs-badge-mod': dbSeverityAvgScore > 3 && dbSeverityAvgScore <= 6,
                        'nrs-badge-sev': dbSeverityAvgScore > 6
                      }">
                        {{ dbSeverityAvgScore === 0 ? 'Tidak Sakit' : dbSeverityAvgScore <= 3 ? 'Nyeri Ringan' : dbSeverityAvgScore <= 6 ? 'Nyeri Sedang' : 'Nyeri Berat' }}
                      </span>
                    </div>
                  </div>

                  <div class="bar-chart-group" style="margin-top: 16px;">
                    <div class="bar-chart-row">
                      <span class="bar-label">Ringan (1-3)</span>
                      <div class="bar-track">
                        <div class="bar-fill green" :style="{ width: dbSeverityCat1Pct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.severity.cat1 }} ({{ dbSeverityCat1Pct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label">Sedang (4-6)</span>
                      <div class="bar-track">
                        <div class="bar-fill orange" :style="{ width: dbSeverityCat2Pct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.severity.cat2 }} ({{ dbSeverityCat2Pct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label">Berat (7-10)</span>
                      <div class="bar-track">
                        <div class="bar-fill red" :style="{ width: dbSeverityCat3Pct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.severity.cat3 }} ({{ dbSeverityCat3Pct.toFixed(1) }}%)</span>
                    </div>
                  </div>
                </div>

                <!-- Durasi Gejala -->
                <div class="widget-item">
                  <span class="widget-subtitle">Durasi Nyeri (12 Bulan Terakhir)</span>
                  <div class="bar-chart-group" style="margin-top: 8px;">
                    <div class="bar-chart-row">
                      <span class="bar-label">Akut (&lt;6 mgg)</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbDurationAcutePct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.duration.acute }} ({{ dbDurationAcutePct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label">Subakut (6-12 mgg)</span>
                      <div class="bar-track">
                        <div class="bar-fill orange" :style="{ width: dbDurationSubacutePct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.duration.subacute }} ({{ dbDurationSubacutePct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label">Kronik (&gt;12 mgg)</span>
                      <div class="bar-track">
                        <div class="bar-fill red" :style="{ width: dbDurationChronicPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.duration.chronic }} ({{ dbDurationChronicPct.toFixed(1) }}%)</span>
                    </div>
                  </div>
                  <div class="duration-footer-info" style="margin-top: 12px; font-size: 0.8rem; color: var(--text-muted);">
                    * Persentase dihitung dari siswa yang mengalami back pain (N = {{ dbTotalPain }}).
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 3: ETIOLOGI, LOKASI, & MANAJEMEN -->
            <div class="dashboard-section-card" style="margin-top: 24px;" v-if="dbTotalPain > 0">
              <h4 class="section-title">🔍 Faktor Penyebab, Lokasi Vertebra, & Tata Laksana</h4>
              
              <div class="widgets-container">
                <!-- Etiologi / Penyebab -->
                <div class="widget-item">
                  <span class="widget-subtitle">Faktor Penyebab (Etiologi) *</span>
                  <div class="bar-chart-group">
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Cedera Otot/Saraf/Ligamen">Cedera</span>
                      <div class="bar-track">
                        <div class="bar-fill red" :style="{ width: dbCauseCederaPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.causes.cedera }} ({{ dbCauseCederaPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Duduk lebih dari 8 jam sehari">Duduk Lama</span>
                      <div class="bar-track">
                        <div class="bar-fill red" :style="{ width: dbCauseDudukPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.causes.dudukLama }} ({{ dbCauseDudukPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Skoliosis">Skoliosis</span>
                      <div class="bar-track">
                        <div class="bar-fill red" :style="{ width: dbCauseSkoliosisPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.causes.skoliosis }} ({{ dbCauseSkoliosisPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Tumor">Tumor</span>
                      <div class="bar-track">
                        <div class="bar-fill red" :style="{ width: dbCauseTumorPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.causes.tumor }} ({{ dbCauseTumorPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Diagnosis Dokter">Diagnosis Dr</span>
                      <div class="bar-track">
                        <div class="bar-fill red" :style="{ width: dbCauseDokterPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.causes.dokter }} ({{ dbCauseDokterPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Lainnya">Lainnya</span>
                      <div class="bar-track">
                        <div class="bar-fill red" :style="{ width: dbCauseLainnyaPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.causes.lainnya }} ({{ dbCauseLainnyaPct.toFixed(1) }}%)</span>
                    </div>
                  </div>
                </div>

                <!-- Anatomi / Lokasi Nyeri -->
                <div class="widget-item">
                  <span class="widget-subtitle">Area Vertebra (Lokasi Nyeri) *</span>
                  <div class="bar-chart-group">
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Cervical (Leher)">Cervical (Leher)</span>
                      <div class="bar-track">
                        <div class="bar-fill orange" :style="{ width: dbAreaCervicalPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.areas.cervical }} ({{ dbAreaCervicalPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Thoracal (Punggung Dada)">Thoracal (Dada)</span>
                      <div class="bar-track">
                        <div class="bar-fill orange" :style="{ width: dbAreaThoracalPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.areas.thoracal }} ({{ dbAreaThoracalPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Lumbal (Pinggang)">Lumbal (Pinggang)</span>
                      <div class="bar-track">
                        <div class="bar-fill orange" :style="{ width: dbAreaLumbalPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.areas.lumbal }} ({{ dbAreaLumbalPct.toFixed(1) }}%)</span>
                    </div>
                  </div>
                </div>

                <!-- Tata Laksana / Penanganan -->
                <div class="widget-item">
                  <span class="widget-subtitle">Tata Laksana Mandiri / Pengobatan *</span>
                  <div class="bar-chart-group">
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Obat bebas mandiri">Obat Bebas</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbActionObatBebasPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.actions.obatBebas }} ({{ dbActionObatBebasPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Dokter tanpa obat">Dr Tanpa Obat</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbActionDrTanpaPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.actions.drTanpaObat }} ({{ dbActionDrTanpaPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Dokter dengan obat">Dr Dengan Obat</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbActionDrDenganPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.actions.drDenganObat }} ({{ dbActionDrDenganPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Pijat tradisional / urut">Pijat / Urut</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbActionPijatPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.actions.pijat }} ({{ dbActionPijatPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Terapi chiropractor">Chiropractor</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbActionChiroPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.actions.chiro }} ({{ dbActionChiroPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Tindakan operasi">Tindakan Operasi</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbActionOperasiPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.actions.operasi }} ({{ dbActionOperasiPct.toFixed(1) }}%)</span>
                    </div>
                    <div class="bar-chart-row">
                      <span class="bar-label-wide" title="Lainnya">Lainnya</span>
                      <div class="bar-track">
                        <div class="bar-fill blue" :style="{ width: dbActionLainnyaPct + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ dashboardStats.actions.lainnya }} ({{ dbActionLainnyaPct.toFixed(1) }}%)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="duration-footer-info" style="margin-top: 12px; font-size: 0.8rem; color: var(--text-muted);">
                * Variabel merupakan pilihan ganda. Total persentase sub-bagian bisa melebihi 100%.
              </div>
            </div>

            <!-- Placeholder if no one has back pain yet -->
            <div class="dashboard-section-card no-data-box" style="margin-top: 24px; text-align: center; padding: 40px; color: var(--text-muted);" v-else>
              ℹ️ Belum ada responden lolos skrining yang memiliki keluhan back pain untuk dianalisis faktor etiologi & tata laksananya.
            </div>
          </div>
        </div>

        <!-- TAB CONTENT 1: DUMMY TABLES -->
        <div v-if="activeTab === 'tables'" class="tab-panel animate-fade">
          <div class="panel-header">
            <h3>Live Dummy Tables (Hasil Perhitungan Kumulatif)</h3>
            <p>Tabel ini terisi otomatis untuk disalin langsung ke Bab 4 Skripsi Anda.</p>
          </div>

          <!-- TABLE 1: CROSS-TABULATION -->
          <div class="table-card">
            <div class="table-card-header">
              <h4>Tabel 1: Karakteristik Responden Berdasarkan Demografi & Keluhan Back Pain</h4>
              <span class="n-total-badge">N Lolos = {{ dummyData.totals?.all || 0 }}</span>
            </div>
            <div class="table-responsive">
              <table class="medical-table">
                <thead>
                  <tr>
                    <th>Variabel</th>
                    <th>Laki-laki (n)</th>
                    <th>Laki-laki (%)</th>
                    <th>Perempuan (n)</th>
                    <th>Perempuan (%)</th>
                    <th>Total (N)</th>
                    <th>Total (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Totals row -->
                  <tr class="row-highlight">
                    <td><strong>Total Responden Lolos Skrining</strong></td>
                    <td><strong>{{ dummyData.totals?.laki }}</strong></td>
                    <td><strong>100.0%</strong></td>
                    <td><strong>{{ dummyData.totals?.perempuan }}</strong></td>
                    <td><strong>100.0%</strong></td>
                    <td><strong>{{ dummyData.totals?.all }}</strong></td>
                    <td><strong>100.0%</strong></td>
                  </tr>
                  
                  <!-- UMUR SECTION -->
                  <tr class="row-section"><td colspan="7">Umur Responden</td></tr>
                  <tr>
                    <td>&bull; 16 Tahun</td>
                    <td>{{ dummyData.table1?.age_16.lakiN }}</td>
                    <td>{{ dummyData.table1?.age_16.lakiPct }}</td>
                    <td>{{ dummyData.table1?.age_16.perempuanN }}</td>
                    <td>{{ dummyData.table1?.age_16.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.age_16.totalN }}</td>
                    <td>{{ dummyData.table1?.age_16.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; 17 Tahun</td>
                    <td>{{ dummyData.table1?.age_17.lakiN }}</td>
                    <td>{{ dummyData.table1?.age_17.lakiPct }}</td>
                    <td>{{ dummyData.table1?.age_17.perempuanN }}</td>
                    <td>{{ dummyData.table1?.age_17.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.age_17.totalN }}</td>
                    <td>{{ dummyData.table1?.age_17.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; 18 Tahun</td>
                    <td>{{ dummyData.table1?.age_18.lakiN }}</td>
                    <td>{{ dummyData.table1?.age_18.lakiPct }}</td>
                    <td>{{ dummyData.table1?.age_18.perempuanN }}</td>
                    <td>{{ dummyData.table1?.age_18.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.age_18.totalN }}</td>
                    <td>{{ dummyData.table1?.age_18.totalPct }}</td>
                  </tr>

                  <!-- HAS BACK PAIN SECTION -->
                  <tr class="row-section"><td colspan="7">Apakah Pernah Mengalami Back Pain?</td></tr>
                  <tr>
                    <td>&bull; Ya</td>
                    <td>{{ dummyData.table1?.pain_ya.lakiN }}</td>
                    <td>{{ dummyData.table1?.pain_ya.lakiPct }}</td>
                    <td>{{ dummyData.table1?.pain_ya.perempuanN }}</td>
                    <td>{{ dummyData.table1?.pain_ya.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.pain_ya.totalN }}</td>
                    <td>{{ dummyData.table1?.pain_ya.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Tidak</td>
                    <td>{{ dummyData.table1?.pain_tidak.lakiN }}</td>
                    <td>{{ dummyData.table1?.pain_tidak.lakiPct }}</td>
                    <td>{{ dummyData.table1?.pain_tidak.perempuanN }}</td>
                    <td>{{ dummyData.table1?.pain_tidak.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.pain_tidak.totalN }}</td>
                    <td>{{ dummyData.table1?.pain_tidak.totalPct }}</td>
                  </tr>

                  <!-- PAIN DURATION SECTION -->
                  <tr class="row-section"><td colspan="7">Durasi Gejala Back Pain (12 Bulan Terakhir)</td></tr>
                  <tr>
                    <td>&bull; &lt; 6 minggu (Akut)</td>
                    <td>{{ dummyData.table1?.duration_acute.lakiN }}</td>
                    <td>{{ dummyData.table1?.duration_acute.lakiPct }}</td>
                    <td>{{ dummyData.table1?.duration_acute.perempuanN }}</td>
                    <td>{{ dummyData.table1?.duration_acute.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.duration_acute.totalN }}</td>
                    <td>{{ dummyData.table1?.duration_acute.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; 6-12 minggu (Subakut)</td>
                    <td>{{ dummyData.table1?.duration_subacute.lakiN }}</td>
                    <td>{{ dummyData.table1?.duration_subacute.lakiPct }}</td>
                    <td>{{ dummyData.table1?.duration_subacute.perempuanN }}</td>
                    <td>{{ dummyData.table1?.duration_subacute.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.duration_subacute.totalN }}</td>
                    <td>{{ dummyData.table1?.duration_subacute.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; &gt; 12 minggu (Kronik)</td>
                    <td>{{ dummyData.table1?.duration_chronic.lakiN }}</td>
                    <td>{{ dummyData.table1?.duration_chronic.lakiPct }}</td>
                    <td>{{ dummyData.table1?.duration_chronic.perempuanN }}</td>
                    <td>{{ dummyData.table1?.duration_chronic.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.duration_chronic.totalN }}</td>
                    <td>{{ dummyData.table1?.duration_chronic.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Tidak pernah nyeri dalam 12 bulan terakhir</td>
                    <td>{{ dummyData.table1?.duration_none.lakiN }}</td>
                    <td>{{ dummyData.table1?.duration_none.lakiPct }}</td>
                    <td>{{ dummyData.table1?.duration_none.perempuanN }}</td>
                    <td>{{ dummyData.table1?.duration_none.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.duration_none.totalN }}</td>
                    <td>{{ dummyData.table1?.duration_none.totalPct }}</td>
                  </tr>

                  <!-- CAUSES SECTION (Etiologi) -->
                  <tr class="row-section"><td colspan="7">Faktor Penyebab Back Pain (Etiologi) *</td></tr>
                  <tr>
                    <td>&bull; Cedera (Otot/Saraf/Ligamen)</td>
                    <td>{{ dummyData.table1?.cause_cedera.lakiN }}</td>
                    <td>{{ dummyData.table1?.cause_cedera.lakiPct }}</td>
                    <td>{{ dummyData.table1?.cause_cedera.perempuanN }}</td>
                    <td>{{ dummyData.table1?.cause_cedera.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.cause_cedera.totalN }}</td>
                    <td>{{ dummyData.table1?.cause_cedera.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Duduk lebih dari 8 jam sehari</td>
                    <td>{{ dummyData.table1?.cause_duduk.lakiN }}</td>
                    <td>{{ dummyData.table1?.cause_duduk.lakiPct }}</td>
                    <td>{{ dummyData.table1?.cause_duduk.perempuanN }}</td>
                    <td>{{ dummyData.table1?.cause_duduk.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.cause_duduk.totalN }}</td>
                    <td>{{ dummyData.table1?.cause_duduk.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Skoliosis</td>
                    <td>{{ dummyData.table1?.cause_skoliosis.lakiN }}</td>
                    <td>{{ dummyData.table1?.cause_skoliosis.lakiPct }}</td>
                    <td>{{ dummyData.table1?.cause_skoliosis.perempuanN }}</td>
                    <td>{{ dummyData.table1?.cause_skoliosis.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.cause_skoliosis.totalN }}</td>
                    <td>{{ dummyData.table1?.cause_skoliosis.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Tumor</td>
                    <td>{{ dummyData.table1?.cause_tumor.lakiN }}</td>
                    <td>{{ dummyData.table1?.cause_tumor.lakiPct }}</td>
                    <td>{{ dummyData.table1?.cause_tumor.perempuanN }}</td>
                    <td>{{ dummyData.table1?.cause_tumor.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.cause_tumor.totalN }}</td>
                    <td>{{ dummyData.table1?.cause_tumor.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Diagnosis dokter spesifik</td>
                    <td>{{ dummyData.table1?.cause_dokter.lakiN }}</td>
                    <td>{{ dummyData.table1?.cause_dokter.lakiPct }}</td>
                    <td>{{ dummyData.table1?.cause_dokter.perempuanN }}</td>
                    <td>{{ dummyData.table1?.cause_dokter.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.cause_dokter.totalN }}</td>
                    <td>{{ dummyData.table1?.cause_dokter.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Lainnya</td>
                    <td>{{ dummyData.table1?.cause_lainnya.lakiN }}</td>
                    <td>{{ dummyData.table1?.cause_lainnya.lakiPct }}</td>
                    <td>{{ dummyData.table1?.cause_lainnya.perempuanN }}</td>
                    <td>{{ dummyData.table1?.cause_lainnya.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.cause_lainnya.totalN }}</td>
                    <td>{{ dummyData.table1?.cause_lainnya.totalPct }}</td>
                  </tr>

                  <!-- AREAS SECTION (Anatomy) -->
                  <tr class="row-section"><td colspan="7">Area Vertebra (Lokasi Nyeri) *</td></tr>
                  <tr>
                    <td>&bull; Cervical (Leher)</td>
                    <td>{{ dummyData.table1?.area_cervical.lakiN }}</td>
                    <td>{{ dummyData.table1?.area_cervical.lakiPct }}</td>
                    <td>{{ dummyData.table1?.area_cervical.perempuanN }}</td>
                    <td>{{ dummyData.table1?.area_cervical.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.area_cervical.totalN }}</td>
                    <td>{{ dummyData.table1?.area_cervical.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Thoracal (Punggung Dada)</td>
                    <td>{{ dummyData.table1?.area_thoracal.lakiN }}</td>
                    <td>{{ dummyData.table1?.area_thoracal.lakiPct }}</td>
                    <td>{{ dummyData.table1?.area_thoracal.perempuanN }}</td>
                    <td>{{ dummyData.table1?.area_thoracal.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.area_thoracal.totalN }}</td>
                    <td>{{ dummyData.table1?.area_thoracal.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Lumbal (Pinggang / Lower Back)</td>
                    <td>{{ dummyData.table1?.area_lumbal.lakiN }}</td>
                    <td>{{ dummyData.table1?.area_lumbal.lakiPct }}</td>
                    <td>{{ dummyData.table1?.area_lumbal.perempuanN }}</td>
                    <td>{{ dummyData.table1?.area_lumbal.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.area_lumbal.totalN }}</td>
                    <td>{{ dummyData.table1?.area_lumbal.totalPct }}</td>
                  </tr>

                  <!-- ACTIONS SECTION (Tata laksana) -->
                  <tr class="row-section"><td colspan="7">Tata Laksana Mandiri / Pengobatan *</td></tr>
                  <tr>
                    <td>&bull; Obat bebas mandiri</td>
                    <td>{{ dummyData.table1?.action_obat_bebas.lakiN }}</td>
                    <td>{{ dummyData.table1?.action_obat_bebas.lakiPct }}</td>
                    <td>{{ dummyData.table1?.action_obat_bebas.perempuanN }}</td>
                    <td>{{ dummyData.table1?.action_obat_bebas.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.action_obat_bebas.totalN }}</td>
                    <td>{{ dummyData.table1?.action_obat_bebas.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Dokter tanpa obat</td>
                    <td>{{ dummyData.table1?.action_dr_tanpa.lakiN }}</td>
                    <td>{{ dummyData.table1?.action_dr_tanpa.lakiPct }}</td>
                    <td>{{ dummyData.table1?.action_dr_tanpa.perempuanN }}</td>
                    <td>{{ dummyData.table1?.action_dr_tanpa.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.action_dr_tanpa.totalN }}</td>
                    <td>{{ dummyData.table1?.action_dr_tanpa.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Dokter dengan obat</td>
                    <td>{{ dummyData.table1?.action_dr_dengan.lakiN }}</td>
                    <td>{{ dummyData.table1?.action_dr_dengan.lakiPct }}</td>
                    <td>{{ dummyData.table1?.action_dr_dengan.perempuanN }}</td>
                    <td>{{ dummyData.table1?.action_dr_dengan.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.action_dr_dengan.totalN }}</td>
                    <td>{{ dummyData.table1?.action_dr_dengan.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Pijat tradisional / urut</td>
                    <td>{{ dummyData.table1?.action_pijat.lakiN }}</td>
                    <td>{{ dummyData.table1?.action_pijat.lakiPct }}</td>
                    <td>{{ dummyData.table1?.action_pijat.perempuanN }}</td>
                    <td>{{ dummyData.table1?.action_pijat.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.action_pijat.totalN }}</td>
                    <td>{{ dummyData.table1?.action_pijat.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Terapi chiropractor</td>
                    <td>{{ dummyData.table1?.action_chiro.lakiN }}</td>
                    <td>{{ dummyData.table1?.action_chiro.lakiPct }}</td>
                    <td>{{ dummyData.table1?.action_chiro.perempuanN }}</td>
                    <td>{{ dummyData.table1?.action_chiro.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.action_chiro.totalN }}</td>
                    <td>{{ dummyData.table1?.action_chiro.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Tindakan operasi</td>
                    <td>{{ dummyData.table1?.action_operasi.lakiN }}</td>
                    <td>{{ dummyData.table1?.action_operasi.lakiPct }}</td>
                    <td>{{ dummyData.table1?.action_operasi.perempuanN }}</td>
                    <td>{{ dummyData.table1?.action_operasi.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.action_operasi.totalN }}</td>
                    <td>{{ dummyData.table1?.action_operasi.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; Lainnya</td>
                    <td>{{ dummyData.table1?.action_lainnya.lakiN }}</td>
                    <td>{{ dummyData.table1?.action_lainnya.lakiPct }}</td>
                    <td>{{ dummyData.table1?.action_lainnya.perempuanN }}</td>
                    <td>{{ dummyData.table1?.action_lainnya.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.action_lainnya.totalN }}</td>
                    <td>{{ dummyData.table1?.action_lainnya.totalPct }}</td>
                  </tr>

                  <!-- SEVERITY SECTION (Skala NRS) -->
                  <tr class="row-section"><td colspan="7">Tingkat Keparahan Nyeri (Skala NRS)</td></tr>
                  <tr>
                    <td>&bull; 0 (Tidak Sakit)</td>
                    <td>{{ dummyData.table1?.severity_0.lakiN }}</td>
                    <td>{{ dummyData.table1?.severity_0.lakiPct }}</td>
                    <td>{{ dummyData.table1?.severity_0.perempuanN }}</td>
                    <td>{{ dummyData.table1?.severity_0.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.severity_0.totalN }}</td>
                    <td>{{ dummyData.table1?.severity_0.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; 1–3 (Nyeri Ringan)</td>
                    <td>{{ dummyData.table1?.severity_1_3.lakiN }}</td>
                    <td>{{ dummyData.table1?.severity_1_3.lakiPct }}</td>
                    <td>{{ dummyData.table1?.severity_1_3.perempuanN }}</td>
                    <td>{{ dummyData.table1?.severity_1_3.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.severity_1_3.totalN }}</td>
                    <td>{{ dummyData.table1?.severity_1_3.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; 4–6 (Nyeri Sedang)</td>
                    <td>{{ dummyData.table1?.severity_4_6.lakiN }}</td>
                    <td>{{ dummyData.table1?.severity_4_6.lakiPct }}</td>
                    <td>{{ dummyData.table1?.severity_4_6.perempuanN }}</td>
                    <td>{{ dummyData.table1?.severity_4_6.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.severity_4_6.totalN }}</td>
                    <td>{{ dummyData.table1?.severity_4_6.totalPct }}</td>
                  </tr>
                  <tr>
                    <td>&bull; 7–10 (Nyeri Berat / Sangat Sakit)</td>
                    <td>{{ dummyData.table1?.severity_7_10.lakiN }}</td>
                    <td>{{ dummyData.table1?.severity_7_10.lakiPct }}</td>
                    <td>{{ dummyData.table1?.severity_7_10.perempuanN }}</td>
                    <td>{{ dummyData.table1?.severity_7_10.perempuanPct }}</td>
                    <td>{{ dummyData.table1?.severity_7_10.totalN }}</td>
                    <td>{{ dummyData.table1?.severity_7_10.totalPct }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="table-footnote">* Variabel merupakan pilihan ganda. Total persentase sub-bagian bisa melebihi 100%.</p>
          </div>

          <!-- TABLE 2: PARAMETRIC AGE STATISTICS -->
          <div class="table-card" style="margin-top: 24px;">
            <div class="table-card-header">
              <h4>Tabel 2: Analisis Deskriptif Variabel Numerik Umur Responden (Lolos Skrining)</h4>
            </div>
            <div class="table-responsive">
              <table class="medical-table">
                <thead>
                  <tr>
                    <th>Variabel</th>
                    <th>Mean &plusmn; Standard Deviation (SD)</th>
                    <th>Median (Min &ndash; Max)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Umur Responden (Tahun)</strong></td>
                    <td>{{ dummyData.table2?.mean }} &plusmn; {{ dummyData.table2?.sd }}</td>
                    <td>{{ dummyData.table2?.median }} ({{ dummyData.table2?.min }} &ndash; {{ dummyData.table2?.max }})</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB CONTENT 2: DATABASE GRID -->
        <div v-if="activeTab === 'database'" class="tab-panel animate-fade">
          <div class="grid-toolbar">
            <!-- Search & Filters -->
            <div class="search-box-wrapper">
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control form-control-sm" 
                placeholder="Cari nama siswa, orang tua, atau SMA..."
                @input="debouncedFetchResponses"
              />
            </div>
            
            <div class="filter-box-wrapper">
              <select v-model="filterEligible" @change="fetchResponses" class="form-control form-control-sm">
                <option value="1">Lolos Skrining Saja</option>
                <option value="0">Tereliminasi Saja</option>
                <option value="all">Tampilkan Semua</option>
              </select>
            </div>

            <!-- Export Buttons -->
            <button @click="downloadExcel" class="btn btn-primary btn-sm btn-export" :disabled="exporting">
              📥 {{ exporting ? 'Memproses...' : 'Unduh Data SPSS (Excel)' }}
            </button>
            <button @click="downloadCSV" class="btn btn-secondary btn-sm btn-export" :disabled="exporting" style="margin-left: 8px;">
              📄 Unduh CSV Mentah
            </button>
          </div>

          <!-- Signature Status Summary Bar -->
          <div class="sig-summary-bar">
            <span>📝 <strong>Keterangan Tanda Tangan:</strong></span>
            <span class="badge badge-green">Lengkap (Ortu & Siswa): {{ sigStats.both }}</span>
            <span v-if="sigStats.parentOnly > 0" class="badge badge-yellow">Hanya Ortu: {{ sigStats.parentOnly }}</span>
            <span v-if="sigStats.studentOnly > 0" class="badge badge-yellow">Hanya Siswa: {{ sigStats.studentOnly }}</span>
            <span v-if="sigStats.none > 0" class="badge badge-red">Belum Ada TTD: {{ sigStats.none }}</span>
          </div>

          <!-- RESPONDENTS DATA GRID -->
          <div class="table-card data-grid-card">
            <div v-if="responses.length === 0" class="empty-grid">
              Tidak ada data responden yang cocok.
            </div>
            <div v-else class="table-responsive">
              <table class="grid-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama Siswa</th>
                    <th>Nama Ortu / Wali</th>
                    <th>Gender</th>
                    <th>Umur</th>
                    <th>SMA</th>
                    <th>Kelas</th>
                    <th>Pindahan?</th>
                    <th>Back Pain?</th>
                    <th>NRS</th>
                    <th>Skrining</th>
                    <th>Status Tanda Tangan</th>
                    <th>Waktu Masuk</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="res in responses" :key="res.id" :class="{ 'row-disqualified': res.is_eligible === 0 }">
                    <td>{{ res.id }}</td>
                    <td class="col-name">
                      <strong>{{ res.student_name }}</strong>
                    </td>
                    <td class="col-name">
                      <div>{{ res.parent_name || '-' }}</div>
                      <small v-if="res.parent_student_name && res.parent_student_name !== res.student_name" class="sub-name" title="Nama anak di lembar orang tua">
                        (Anak: {{ res.parent_student_name }})
                      </small>
                    </td>
                    <td>{{ res.gender === 1 ? 'Laki-laki' : 'Perempuan' }}</td>
                    <td>
                      <span v-if="res.is_eligible === 0 && res.age !== 16 && res.age !== 17 && res.age !== 18" class="badge badge-red-highlight" title="Tereliminasi karena usia di luar target 16-18 tahun">
                        {{ res.age === 99 ? 'Lainnya' : res.age }}
                      </span>
                      <span v-else>
                        {{ res.age === 99 ? 'Lainnya' : res.age }}
                      </span>
                    </td>
                    <td>{{ res.school }}</td>
                    <td>Kelas {{ res.class_grade + 9 }}</td>
                    <td>
                      <span v-if="res.is_eligible === 0 && res.is_transfer === 1 && (res.transfer_duration === null || res.transfer_duration < 0.5)" class="badge badge-red-highlight" title="Tereliminasi karena lama bersekolah siswa pindahan < 6 bulan">
                        Ya ({{ res.transfer_duration !== null ? res.transfer_duration : 0 }}th)
                      </span>
                      <span v-else>
                        {{ res.is_transfer === 1 ? `Ya (${res.transfer_duration}th)` : 'Tidak' }}
                      </span>
                    </td>
                    <td>
                      <span v-if="res.has_back_pain === 1" class="badge badge-red">Ya</span>
                      <span v-else-if="res.has_back_pain === 0" class="badge badge-green">Tidak</span>
                      <span v-else class="badge badge-gray">-</span>
                    </td>
                    <td>{{ res.pain_severity !== null ? res.pain_severity : '-' }}</td>
                    <td>
                      <span v-if="res.is_eligible === 1" class="badge badge-green">Lolos</span>
                      <span v-else class="badge badge-red">Eliminasi</span>
                    </td>
                    <td>
                      <div class="sig-status-cell">
                        <div class="sig-pills">
                          <span 
                            class="sig-pill" 
                            :class="res.parent_signature ? 'sig-pill-yes' : 'sig-pill-no'"
                            :title="res.parent_signature ? 'Tanda tangan orang tua tersedia' : 'Belum ada tanda tangan orang tua'"
                          >
                            Ortu: {{ res.parent_signature ? '✓ Ada' : '✗ Belum' }}
                          </span>
                          <span 
                            class="sig-pill" 
                            :class="res.student_signature ? 'sig-pill-yes' : 'sig-pill-no'"
                            :title="res.student_signature ? 'Tanda tangan siswa tersedia' : 'Belum ada tanda tangan siswa'"
                          >
                            Siswa: {{ res.student_signature ? '✓ Ada' : '✗ Belum' }}
                          </span>
                        </div>
                        <button 
                          v-if="res.parent_signature || res.student_signature"
                          @click="openSignatureModal(res)" 
                          class="btn-sig-action"
                          title="Buka pratinjau tanda tangan digital"
                        >
                          👁️ Lihat TTD
                        </button>
                      </div>
                    </td>
                    <td class="col-date">{{ formatDate(res.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PREVIEW TANDA TANGAN DIGITAL -->
    <div v-if="selectedSigRespondent" class="sig-modal-backdrop" @click.self="closeSignatureModal">
      <div class="sig-modal-box animate-fade">
        <div class="sig-modal-header">
          <div class="sig-modal-title-group">
            <h3>✍️ Pratinjau Tanda Tangan Digital</h3>
            <p>Responden #{{ selectedSigRespondent.id }} &bull; {{ selectedSigRespondent.student_name }} &bull; {{ selectedSigRespondent.school }}</p>
          </div>
          <button class="sig-modal-close-btn" @click="closeSignatureModal" title="Tutup">&times;</button>
        </div>

        <div class="sig-modal-body">
          <!-- Card TTD Orang Tua -->
          <div class="sig-preview-card">
            <div class="sig-preview-header">
              <span class="sig-badge or-badge">Informed Consent</span>
              <h4>Tanda Tangan Orang Tua / Wali</h4>
              <div class="sig-meta">
                <div>Nama Ortu: <strong>{{ selectedSigRespondent.parent_name || '-' }}</strong></div>
                <div>Nama Anak: <strong>{{ selectedSigRespondent.parent_student_name || '-' }}</strong></div>
              </div>
            </div>
            <div class="sig-canvas-display">
              <img 
                v-if="selectedSigRespondent.parent_signature" 
                :src="selectedSigRespondent.parent_signature" 
                alt="Tanda Tangan Orang Tua" 
              />
              <div v-else class="sig-empty-notice">Tidak ada tanda tangan</div>
            </div>
            <div class="sig-preview-footer">
              <button 
                v-if="selectedSigRespondent.parent_signature" 
                @click="downloadSignature(selectedSigRespondent.parent_signature, `TTD_Ortu_Responden_${selectedSigRespondent.id}_${selectedSigRespondent.student_name}.png`)" 
                class="btn btn-secondary btn-sm"
              >
                💾 Unduh PNG
              </button>
            </div>
          </div>

          <!-- Card TTD Siswa -->
          <div class="sig-preview-card">
            <div class="sig-preview-header">
              <span class="sig-badge siswa-badge">Informed Assent</span>
              <h4>Tanda Tangan Siswa (Responden)</h4>
              <div class="sig-meta">
                <div>Nama Siswa: <strong>{{ selectedSigRespondent.student_name || '-' }}</strong></div>
                <div>Usia & Kelas: <strong>{{ selectedSigRespondent.age }} Thn &bull; Kelas {{ selectedSigRespondent.class_grade + 9 }}</strong></div>
              </div>
            </div>
            <div class="sig-canvas-display">
              <img 
                v-if="selectedSigRespondent.student_signature" 
                :src="selectedSigRespondent.student_signature" 
                alt="Tanda Tangan Siswa" 
              />
              <div v-else class="sig-empty-notice">Tidak ada tanda tangan</div>
            </div>
            <div class="sig-preview-footer">
              <button 
                v-if="selectedSigRespondent.student_signature" 
                @click="downloadSignature(selectedSigRespondent.student_signature, `TTD_Siswa_Responden_${selectedSigRespondent.id}_${selectedSigRespondent.student_name}.png`)" 
                class="btn btn-secondary btn-sm"
              >
                💾 Unduh PNG
              </button>
            </div>
          </div>
        </div>

        <div class="sig-modal-footer">
          <button 
            @click="printConsentSheet(selectedSigRespondent)" 
            class="btn btn-secondary btn-sm"
          >
            🖨️ Cetak / Print Lembar Persetujuan
          </button>
          <button @click="closeSignatureModal" class="btn btn-primary btn-sm">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const error = ref('');
const activeTab = ref('dashboard'); // Default to dashboard view

const stats = ref({
  targetTotal: 120,
  totalLolos: 0,
  totalTereliminasi: 0,
  prevalence: { ya: 0, tidak: 0 }
});

const dummyData = ref({});
const responses = ref([]);
const searchQuery = ref('');
const filterEligible = ref('1');
const exporting = ref(false);
const selectedSigRespondent = ref(null);

// Signature statistics across loaded responses
const sigStats = computed(() => {
  const total = responses.value.length;
  const both = responses.value.filter(r => r.parent_signature && r.student_signature).length;
  const parentOnly = responses.value.filter(r => r.parent_signature && !r.student_signature).length;
  const studentOnly = responses.value.filter(r => !r.parent_signature && r.student_signature).length;
  const none = responses.value.filter(r => !r.parent_signature && !r.student_signature).length;
  return { total, both, parentOnly, studentOnly, none };
});

const dashboardStats = ref(null);
const loadingDashboard = ref(true);

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5005/api' 
  : '/api';

// Compute stat percentages for overview cards
const prevalencePctRaw = computed(() => {
  const total = stats.value.prevalence.ya + stats.value.prevalence.tidak;
  if (total === 0) return 0;
  return (stats.value.prevalence.ya / total) * 100;
});

const prevalencePercent = computed(() => {
  const pct = prevalencePctRaw.value;
  return pct === 0 ? '0.0%' : pct.toFixed(1) + '%';
});

const exclusionRate = computed(() => {
  const total = stats.value.totalLolos + stats.value.totalTereliminasi;
  if (total === 0) return '0.0%';
  return ((stats.value.totalTereliminasi / total) * 100).toFixed(1) + '%';
});

// Dashboard Computeds
const dbTotalEligible = computed(() => dashboardStats.value?.overview?.eligible || 0);

const dbGenderLakiPct = computed(() => {
  const total = dbTotalEligible.value;
  if (total === 0) return 0;
  return ((dashboardStats.value?.gender?.laki || 0) / total) * 100;
});

const dbGenderPerempuanPct = computed(() => {
  const total = dbTotalEligible.value;
  if (total === 0) return 0;
  return ((dashboardStats.value?.gender?.perempuan || 0) / total) * 100;
});

const dbAge16Pct = computed(() => {
  const total = dbTotalEligible.value;
  if (total === 0) return 0;
  return ((dashboardStats.value?.age?.age16 || 0) / total) * 100;
});

const dbAge17Pct = computed(() => {
  const total = dbTotalEligible.value;
  if (total === 0) return 0;
  return ((dashboardStats.value?.age?.age17 || 0) / total) * 100;
});

const dbAge18Pct = computed(() => {
  const total = dbTotalEligible.value;
  if (total === 0) return 0;
  return ((dashboardStats.value?.age?.age18 || 0) / total) * 100;
});

const dbClass10Pct = computed(() => {
  const total = dbTotalEligible.value;
  if (total === 0) return 0;
  return ((dashboardStats.value?.classGrade?.class10 || 0) / total) * 100;
});

const dbClass11Pct = computed(() => {
  const total = dbTotalEligible.value;
  if (total === 0) return 0;
  return ((dashboardStats.value?.classGrade?.class11 || 0) / total) * 100;
});

const dbClass12Pct = computed(() => {
  const total = dbTotalEligible.value;
  if (total === 0) return 0;
  return ((dashboardStats.value?.classGrade?.class12 || 0) / total) * 100;
});

const dbPrevalenceYaPct = computed(() => {
  const total = dbTotalEligible.value;
  if (total === 0) return 0;
  return ((dashboardStats.value?.prevalence?.ya || 0) / total) * 100;
});

const dbPrevalenceTidakPct = computed(() => {
  const total = dbTotalEligible.value;
  if (total === 0) return 0;
  return ((dashboardStats.value?.prevalence?.tidak || 0) / total) * 100;
});

// Pain Details Computeds (relative to those who HAVE back pain)
const dbTotalPain = computed(() => dashboardStats.value?.prevalence?.ya || 0);

const getPainPct = (val) => {
  const total = dbTotalPain.value;
  if (total === 0) return 0;
  return ((val || 0) / total) * 100;
};

const dbDurationAcutePct = computed(() => getPainPct(dashboardStats.value?.duration?.acute));
const dbDurationSubacutePct = computed(() => getPainPct(dashboardStats.value?.duration?.subacute));
const dbDurationChronicPct = computed(() => getPainPct(dashboardStats.value?.duration?.chronic));

const dbSeverityAvgScore = computed(() => dashboardStats.value?.severity?.avgScore || 0);
const dbSeverityCat0Pct = computed(() => getPainPct(dashboardStats.value?.severity?.cat0));
const dbSeverityCat1Pct = computed(() => getPainPct(dashboardStats.value?.severity?.cat1));
const dbSeverityCat2Pct = computed(() => getPainPct(dashboardStats.value?.severity?.cat2));
const dbSeverityCat3Pct = computed(() => getPainPct(dashboardStats.value?.severity?.cat3));

const dbCauseCederaPct = computed(() => getPainPct(dashboardStats.value?.causes?.cedera));
const dbCauseDudukPct = computed(() => getPainPct(dashboardStats.value?.causes?.dudukLama));
const dbCauseSkoliosisPct = computed(() => getPainPct(dashboardStats.value?.causes?.skoliosis));
const dbCauseTumorPct = computed(() => getPainPct(dashboardStats.value?.causes?.tumor));
const dbCauseDokterPct = computed(() => getPainPct(dashboardStats.value?.causes?.dokter));
const dbCauseLainnyaPct = computed(() => getPainPct(dashboardStats.value?.causes?.lainnya));

const dbAreaCervicalPct = computed(() => getPainPct(dashboardStats.value?.areas?.cervical));
const dbAreaThoracalPct = computed(() => getPainPct(dashboardStats.value?.areas?.thoracal));
const dbAreaLumbalPct = computed(() => getPainPct(dashboardStats.value?.areas?.lumbal));

const dbActionObatBebasPct = computed(() => getPainPct(dashboardStats.value?.actions?.obatBebas));
const dbActionDrTanpaPct = computed(() => getPainPct(dashboardStats.value?.actions?.drTanpaObat));
const dbActionDrDenganPct = computed(() => getPainPct(dashboardStats.value?.actions?.drDenganObat));
const dbActionPijatPct = computed(() => getPainPct(dashboardStats.value?.actions?.pijat));
const dbActionChiroPct = computed(() => getPainPct(dashboardStats.value?.actions?.chiro));
const dbActionOperasiPct = computed(() => getPainPct(dashboardStats.value?.actions?.operasi));
const dbActionLainnyaPct = computed(() => getPainPct(dashboardStats.value?.actions?.lainnya));

// Helper for dates
const formatDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fetch Dashboard Metrics & Live Dummy Tables
const fetchStatsAndTables = async () => {
  const token = localStorage.getItem('admin_token');
  try {
    // Fetch stats
    const statsRes = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!statsRes.ok) throw new Error('Gagal memuat statistik overview');
    stats.value = await statsRes.json();

    // Fetch live tables
    const tablesRes = await fetch(`${API_BASE}/admin/dummy-tables`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!tablesRes.ok) throw new Error('Gagal memuat data live table skripsi');
    dummyData.value = await tablesRes.json();

  } catch (err) {
    console.error(err);
    error.value = err.message;
  }
};

// Fetch Detailed Dashboard Stats
const fetchDashboardStats = async () => {
  const token = localStorage.getItem('admin_token');
  try {
    loadingDashboard.value = true;
    const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Gagal memuat statistik visual dasbor');
    dashboardStats.value = await res.json();
  } catch (err) {
    console.error(err);
    error.value = err.message;
  } finally {
    loadingDashboard.value = false;
  }
};

// Fetch Responses Grid
const fetchResponses = async () => {
  const token = localStorage.getItem('admin_token');
  try {
    const query = new URLSearchParams({
      search: searchQuery.value,
      eligible: filterEligible.value
    }).toString();

    const response = await fetch(`${API_BASE}/admin/responses?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Gagal memuat list responden');
    responses.value = await response.json();
  } catch (err) {
    console.error(err);
    error.value = err.message;
  }
};

// Main fetch aggregator
const fetchData = async () => {
  loading.value = true;
  error.value = '';
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    router.push('/admin-survei-login');
    return;
  }

  try {
    // Verify token validity
    const verifyRes = await fetch(`${API_BASE}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!verifyRes.ok) {
      localStorage.removeItem('admin_token');
      router.push('/admin-survei-login');
      return;
    }

    await Promise.all([
      fetchStatsAndTables(),
      fetchResponses(),
      fetchDashboardStats()
    ]);
  } catch (err) {
    error.value = 'Koneksi ke backend server gagal.';
  } finally {
    loading.value = false;
  }
};

// Debounce helper for instant typing search
let searchTimeout = null;
const debouncedFetchResponses = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchResponses();
  }, 350);
};

// Download Excel File directly from browser
const downloadExcel = () => {
  exporting.value = true;
  const token = localStorage.getItem('admin_token');
  
  // Directly download file using anchor tag with token query parameter
  const downloadUrl = `${API_BASE}/admin/export?token=${token}`;
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'Data_Kuesioner_SPSS_Maulana.xlsx');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => {
    exporting.value = false;
  }, 1000);
};

// Download CSV File directly from browser
const downloadCSV = () => {
  exporting.value = true;
  const token = localStorage.getItem('admin_token');
  
  // Directly download file using anchor tag with token query parameter
  const downloadUrl = `${API_BASE}/admin/export-csv?token=${token}`;
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'Data_Kuesioner_SPSS_Maulana.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => {
    exporting.value = false;
  }, 1000);
};

// Signature Modal Handlers
const openSignatureModal = (res) => {
  selectedSigRespondent.value = res;
};

const closeSignatureModal = () => {
  selectedSigRespondent.value = null;
};

const downloadSignature = (dataUrl, filename) => {
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const printConsentSheet = (res) => {
  if (!res) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const createdDate = res.created_at ? new Date(res.created_at).toLocaleString('id-ID') : '-';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lembar Persetujuan - Responden #${res.id}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: #111; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px; }
        .header h2 { margin: 0; font-size: 15pt; font-weight: bold; text-transform: uppercase; }
        .header p { margin: 4px 0 0; font-size: 11pt; }
        .doc-title { text-align: center; font-size: 13pt; font-weight: bold; margin: 20px 0; text-decoration: underline; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 11pt; }
        .info-table td { padding: 6px 4px; vertical-align: top; }
        .info-table td:first-child { width: 230px; font-weight: bold; }
        .sig-grid { display: flex; justify-content: space-between; margin-top: 36px; gap: 24px; }
        .sig-box { width: 48%; text-align: center; border: 1px solid #ccc; padding: 16px; border-radius: 6px; }
        .sig-box h4 { margin: 0 0 12px; font-size: 11pt; font-weight: bold; }
        .sig-img { max-height: 130px; max-width: 100%; object-fit: contain; }
        .sig-name { margin-top: 14px; font-weight: bold; border-top: 1px solid #333; padding-top: 8px; font-size: 11pt; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Fakultas Kedokteran Universitas Indonesia</h2>
        <p>Penelitian Skripsi: Prevalensi Back Pain pada Remaja SMA dan Faktor Penyebabnya</p>
        <p>Peneliti: Maulana Yusuf Angkasa &bull; Pembimbing: Dr. dr. Mohamad Saekhu, Sp.BS</p>
      </div>

      <div class="doc-title">LEMBAR PERSETUJUAN PENELITIAN (INFORMED CONSENT & ASSENT)</div>
      
      <table class="info-table">
        <tr><td>Nomor Responden</td><td>: #${res.id}</td></tr>
        <tr><td>Nama Lengkap Siswa</td><td>: ${res.student_name || '-'}</td></tr>
        <tr><td>Sekolah / Kelas</td><td>: ${res.school || '-'} / Kelas ${res.class_grade ? res.class_grade + 9 : '-'}</td></tr>
        <tr><td>Usia / Jenis Kelamin</td><td>: ${res.age || '-'} Tahun / ${res.gender === 1 ? 'Laki-laki' : 'Perempuan'}</td></tr>
        <tr><td>Nama Orang Tua / Wali</td><td>: ${res.parent_name || '-'}</td></tr>
        <tr><td>Waktu Pengisian Kuesioner</td><td>: ${createdDate}</td></tr>
      </table>

      <div class="sig-grid">
        <div class="sig-box">
          <h4>Informed Consent (Orang Tua / Wali)</h4>
          ${res.parent_signature ? `<img src="${res.parent_signature}" class="sig-img" alt="TTD Ortu" />` : '<p style="color:#888;">(Tidak ada tanda tangan)</p>'}
          <div class="sig-name">${res.parent_name || '(Nama Orang Tua/Wali)'}</div>
        </div>
        <div class="sig-box">
          <h4>Informed Assent (Siswa Responden)</h4>
          ${res.student_signature ? `<img src="${res.student_signature}" class="sig-img" alt="TTD Siswa" />` : '<p style="color:#888;">(Tidak ada tanda tangan)</p>'}
          <div class="sig-name">${res.student_name || '(Nama Siswa)'}</div>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); };
      <\/script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Logout handler
const handleLogout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_username');
  router.push('/admin-survei-login');
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Nav Bar Layout */
.admin-nav {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-icon {
  font-size: 2.2rem;
}

.nav-brand h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-dark);
}

.nav-brand p {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.nav-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.85rem;
  border-radius: var(--radius-sm);
}

.btn-danger {
  background-color: var(--pastel-red);
  color: var(--pastel-red-accent);
  border: 1px solid #ffccd2;
}

.btn-danger:hover {
  background-color: #ffccd2;
}

/* Main content wrapper */
.admin-content {
  flex-grow: 1;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* Stats Cards Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 12px;
}

.stat-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Custom CSS Chart progress indicators */
.progress-bar-container {
  height: 8px;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--sky-blue);
  border-radius: 4px;
  transition: width 0.5s ease-out;
}

.prevalence-pie-bar {
  height: 8px;
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.pie-fill {
  height: 100%;
}

.pie-fill.ya {
  background-color: #ef5350; /* Red for Back Pain */
}

.pie-fill.tidak {
  background-color: #66bb6a; /* Green for no pain */
}

.eliminated-indicator {
  margin-bottom: 8px;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 12px;
}

.badge-red {
  background-color: var(--pastel-red);
  color: var(--pastel-red-accent);
}

.badge-red-highlight {
  background-color: #fee2e2;
  color: #ef4444;
  border: 1px solid #fca5a5;
}

.badge-green {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.badge-gray {
  background-color: #f1f5f9;
  color: #475569;
}

/* Tabs Navigation Layout */
.tab-header {
  display: flex;
  gap: 12px;
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 24px;
}

.tab-btn {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  padding: 12px 20px;
  cursor: pointer;
  position: relative;
  transition: var(--transition-smooth);
}

.tab-btn:hover {
  color: var(--text-dark);
}

.tab-btn.active {
  color: var(--sky-blue-hover);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--sky-blue);
  border-radius: 3px 3px 0 0;
}

.tab-panel {
  animation: fadeIn 0.3s ease-out;
}

.panel-header {
  margin-bottom: 20px;
}

.panel-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-dark);
}

.panel-header p {
  font-size: 0.88rem;
  color: var(--text-muted);
}

/* Live Dummy Table Card layouts */
.table-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.table-card-header h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-dark);
}

.n-total-badge {
  background-color: var(--bg-secondary);
  color: var(--text-dark);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
}

/* Medical and Academic Tables Style */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.medical-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.medical-table th, .medical-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.medical-table th {
  background-color: #f8fafc;
  color: var(--text-dark);
  font-weight: 700;
  font-size: 0.88rem;
}

.medical-table tbody tr:hover {
  background-color: #fbfcfd;
}

.row-highlight {
  background-color: #f1f8ff !important;
}

.row-section {
  background-color: #f8fafc;
  font-weight: 700;
  color: var(--text-dark);
}

.row-section td {
  padding: 8px 16px;
  border-top: 1px solid #cbd5e1;
  border-bottom: 1.5px solid #cbd5e1;
}

.table-footnote {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 12px;
  font-style: italic;
}

/* Grid View Toolbar */
.grid-toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.search-box-wrapper {
  flex-grow: 1;
}

.filter-box-wrapper {
  width: 200px;
}

.btn-export {
  flex-shrink: 0;
  padding: 10px 20px;
  font-size: 0.9rem;
}

.form-control-sm {
  padding: 10px 14px;
  font-size: 0.88rem;
  border-radius: var(--radius-sm);
}

/* Respondents grid table */
.grid-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.grid-table th, .grid-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
}

.grid-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: var(--text-dark);
}

.grid-table tbody tr:hover {
  background-color: #fafbfc;
}

.row-disqualified {
  background-color: #fff8f8;
  opacity: 0.85;
}

.col-name {
  font-weight: 600;
  text-align: left !important;
  color: var(--text-dark);
}

.col-date {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.empty-grid {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* Loading & Error States Layouts */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--sky-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .grid-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .filter-box-wrapper {
    width: 100%;
  }

  .admin-nav {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .admin-content {
    padding: 12px;
  }
}

/* Visual Dashboard Specific Styles */
.dashboard-visual-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-section-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 20px;
  border-bottom: 1.5px solid var(--bg-secondary);
  padding-bottom: 10px;
}

.widgets-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.widget-item {
  background-color: #fcfdfe;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-sm);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.widget-subtitle {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 16px;
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Donut Chart SVG Styles */
.donut-chart-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 10px auto 20px auto;
}

.donut-chart circle {
  transition: stroke-dashoffset 0.6s ease-out;
}

.donut-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
}

.center-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--sky-blue-hover);
  line-height: 1;
}

.center-value.yellow {
  color: #ef5350;
}

.center-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: 2px;
}

.chart-legend {
  font-size: 0.85rem;
  color: var(--text-dark);
  line-height: 1.6;
  text-align: center;
  margin-top: 8px;
  background-color: var(--bg-primary);
  padding: 8px;
  border-radius: var(--radius-sm);
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
}

.legend-dot.blue { background-color: #58a6ff; }
.legend-dot.pink { background-color: #ff8a80; }
.legend-dot.green { background-color: #66bb6a; }
.legend-dot.red { background-color: #ef5350; }

/* Horizontal Bar Chart Styles */
.bar-chart-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.bar-chart-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  font-size: 0.86rem;
}

.bar-label {
  width: 70px;
  font-weight: 500;
  color: var(--text-dark);
  text-align: left;
}

.bar-label-wide {
  width: 100px;
  font-weight: 500;
  color: var(--text-dark);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  flex-grow: 1;
  height: 10px;
  background-color: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.6s ease-out;
}

.bar-fill.blue { background-color: #58a6ff; }
.bar-fill.green { background-color: #66bb6a; }
.bar-fill.orange { background-color: #ffa726; }
.bar-fill.red { background-color: #ef5350; }

.bar-value {
  width: 75px;
  text-align: right;
  font-weight: 600;
  color: var(--text-dark);
}

/* Schools Ranking List styles */
.schools-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.school-rank-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  background-color: var(--bg-primary);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.school-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.school-num {
  font-weight: 700;
  color: var(--sky-blue-hover);
  background-color: var(--sky-blue-light);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.76rem;
}

.school-name {
  font-weight: 600;
  color: var(--text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

.school-bar-wrapper {
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  width: 100%;
  margin: 2px 0;
}

.school-bar-fill {
  height: 100%;
  background-color: var(--sky-blue);
  border-radius: 3px;
  transition: width 0.6s ease-out;
}

.school-count {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: right;
  font-weight: 500;
}

.no-data-msg {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  font-style: italic;
}

/* NRS Score Card Styles */
.nrs-score-display {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: var(--bg-primary);
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-color);
}

.nrs-big-score {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ef5350;
  line-height: 1;
  background-color: #ffebee;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1.5px solid #ffccd2;
}

.nrs-score-desc {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nrs-score-desc span:first-child {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.nrs-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  width: max-content;
}

.nrs-badge-mild { background-color: #e8f5e9; color: #2e7d32; }
.nrs-badge-mod { background-color: #fff3e0; color: #e65100; }
.nrs-badge-sev { background-color: #ffebee; color: #c62828; }

.no-data-box {
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  font-weight: 500;
}

/* Action button for signature preview */
.btn-sig-action {
  background-color: var(--sky-blue-light);
  color: var(--sky-blue-hover);
  border: 1px solid #bfdbfe;
  padding: 5px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-smooth);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-sig-action:hover {
  background-color: var(--sky-blue);
  color: #ffffff;
  border-color: var(--sky-blue);
}

/* Signature Preview Modal Styles */
.sig-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.sig-modal-box {
  background-color: #ffffff;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-width: 840px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScale {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.sig-modal-header {
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafbfc;
}

.sig-modal-title-group h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 3px;
}

.sig-modal-title-group p {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.sig-modal-close-btn {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  transition: var(--transition-smooth);
}

.sig-modal-close-btn:hover {
  background-color: #f1f5f9;
  color: var(--text-dark);
}

.sig-modal-body {
  padding: 24px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .sig-modal-body {
    grid-template-columns: 1fr;
  }
}

.sig-preview-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sig-preview-header {
  padding: 14px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
}

.sig-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
  margin-bottom: 6px;
}

.or-badge {
  background-color: #e0f2fe;
  color: #0284c7;
}

.siswa-badge {
  background-color: #f0fdf4;
  color: #16a34a;
}

.sig-preview-header h4 {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.sig-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sig-meta strong {
  color: var(--text-dark);
}

.sig-canvas-display {
  padding: 16px;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
}

.sig-canvas-display img {
  max-width: 100%;
  max-height: 140px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.06));
}

.sig-empty-notice {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

.sig-preview-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  background-color: #f8fafc;
}

.sig-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafbfc;
}

/* Signature Status Summary Bar & Pills */
.sig-summary-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
  font-size: 0.85rem;
  flex-wrap: wrap;
  box-shadow: var(--shadow-sm);
}

.badge-yellow {
  background-color: var(--pastel-yellow);
  color: var(--pastel-yellow-accent);
  border: 1px solid #fff59d;
}

.sub-name {
  display: block;
  font-size: 0.73rem;
  color: var(--text-muted);
  line-height: 1.2;
  margin-top: 2px;
}

.sig-status-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.sig-pills {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.sig-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  white-space: nowrap;
  line-height: 1.3;
}

.sig-pill-yes {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.sig-pill-no {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}
</style>
