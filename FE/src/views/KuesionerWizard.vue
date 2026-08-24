<template>
  <div class="container animate-fade">
    <!-- Header Penelitian -->
    <header class="survey-header">
      <div class="header-logo-section">
        <span class="fkui-badge">FKUI 2026</span>
        <span class="research-tag">Penelitian Kedokteran</span>
      </div>
      <h2>Kuesioner Penelitian Medis</h2>
      <h1>Prevalensi Back Pain pada Anak SMA dan Faktor Penyebabnya</h1>
      <div class="supervisor-info">
        <p><strong>Peneliti:</strong> Maulana Yusuf Angkasa (NPM: 2306260366) | <strong>Pembimbing:</strong> Dr. dr. Mohamad Saekhu, Sp.BS</p>
      </div>
    </header>

    <!-- Disqualified screen (Inclusion/Exclusion failure) -->
    <div v-if="isDisqualified" class="card disqualify-card animate-fade">
      <div class="disqualify-icon">ℹ</div>
      <h3>Kriteria Tidak Terpenuhi</h3>
      <p>Terima kasih atas minat Anda untuk berpartisipasi.</p>
      <div class="exclusion-reason">
        <p><strong>Alasan Eliminasi Skrining:</strong></p>
        <ul>
          <li v-if="parseInt(form.age) === 99">Usia Anda saat ini tidak masuk dalam kriteria inklusi (wajib berumur 16, 17, atau 18 tahun).</li>
          <li v-if="parseInt(form.is_transfer) === 1 && parseFloat(form.transfer_duration) < 0.5">
            Lama sekolah Anda saat ini kurang dari 6 bulan (0,5 tahun). Sesuai etika penelitian, responden siswa pindahan wajib bersekolah &ge; 6 bulan.
          </li>
        </ul>
      </div>
      <p class="final-instruction">
        Untuk keperluan pencatatan statistik eksklusi penelitian, kami tetap perlu mengirimkan profil dasar ini ke sistem database. Data Anda aman dan rahasia.
      </p>
      <div class="btn-group">
        <button type="button" class="btn btn-secondary" @click="isDisqualified = false">Kembali</button>
        <button type="button" class="btn btn-primary" :disabled="submitting" @click="submitDisqualified">
          {{ submitting ? 'Mengirim data...' : 'Simpan Profil & Selesai' }}
        </button>
      </div>
    </div>

    <!-- Main Wizard Form -->
    <div v-else-if="currentStep <= 5" class="card">
      <!-- Wizard Progress Indicators -->
      <div class="wizard-progress">
        <div class="wizard-progress-bar" :style="{ width: ((currentStep - 1) / 4) * 100 + '%' }"></div>
        <div 
          v-for="step in 5" 
          :key="step" 
          class="wizard-step-node" 
          :class="{ active: currentStep === step, completed: currentStep > step }"
        >
          {{ step }}
        </div>
      </div>

      <form @submit.prevent>
        
        <!-- STEP 1: Lembar Informed Consent (Orang Tua / Wali) -->
        <div v-if="currentStep === 1" class="animate-fade">
          <div class="informed-consent-doc">
            <h3>Lembar Persetujuan Orang Tua / Wali (Informed Consent)</h3>
            <div class="doc-body">
              <p>Yth. Bapak/Ibu Orang Tua atau Wali Siswa,</p>
              <p>
                Saya, <strong>Maulana Yusuf Angkasa</strong>, mahasiswa Fakultas Kedokteran Universitas Indonesia, sedang melaksanakan penelitian mengenai prevalensi dan penyebab nyeri punggung (Back Pain) di kalangan siswa SMA. Penelitian ini disupervisi langsung oleh <strong>Dr. dr. Mohamad Saekhu, Sp.BS</strong> dari Departemen Bedah Saraf RSCM/FKUI.
              </p>
              <p>
                Melalui lembar ini, kami memohon kesediaan Bapak/Ibu untuk memberikan izin kepada putra/putri Bapak/Ibu untuk berpartisipasi mengisi kuesioner. Pengisian memakan waktu 10-15 menit. 
              </p>
              <p><strong>Kerahasiaan & Hak Pengunduran Diri:</strong></p>
              <p>
                Semua informasi yang dikumpulkan dijamin kerahasiaannya dan hanya digunakan untuk keperluan akademis kedokteran. Partisipasi bersifat sukarela, dan anak Bapak/Ibu berhak mengundurkan diri kapan saja tanpa konsekuensi apa pun.
              </p>
            </div>
          </div>

          <div class="form-group" :class="{ 'has-error': showValidationErrors && !form.parent_name.trim() }">
            <label class="form-label" for="parent_name">Nama Orang Tua / Wali <span class="required">*</span></label>
            <input 
              type="text" 
              id="parent_name" 
              class="form-control" 
              v-model="form.parent_name" 
              placeholder="Tulis nama lengkap Anda"
            />
            <p v-if="showValidationErrors && !form.parent_name.trim()" class="error-message">
              ⚠️ Silakan isi nama lengkap orang tua/wali.
            </p>
          </div>

          <div class="form-group" :class="{ 'has-error': showValidationErrors && !form.parent_student_name.trim() }">
            <label class="form-label" for="parent_student_name">Nama Anak / Siswa <span class="required">*</span></label>
            <input 
              type="text" 
              id="parent_student_name" 
              class="form-control" 
              v-model="form.parent_student_name" 
              placeholder="Tulis nama lengkap putra/putri Anda"
            />
            <p v-if="showValidationErrors && !form.parent_student_name.trim()" class="error-message">
              ⚠️ Silakan isi nama anak/siswa.
            </p>
          </div>

          <div class="form-group" :class="{ 'has-error': showValidationErrors && !form.parent_signature }">
            <SignaturePad 
              v-model="form.parent_signature" 
              label="Tanda Tangan Orang Tua / Wali" 
            />
            <p v-if="showValidationErrors && !form.parent_signature" class="error-message">
              ⚠️ Silakan berikan tanda tangan orang tua/wali.
            </p>
          </div>

          <div class="btn-group">
            <div></div> <!-- Space filler for flex alignment -->
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="handleStep1Next"
            >
              Setuju & Lanjutkan
            </button>
          </div>
        </div>

        <!-- STEP 2: Informed Assent (Siswa) -->
        <div v-if="currentStep === 2" class="animate-fade">
          <div class="informed-consent-doc">
            <h3>Lembar Persetujuan Siswa (Informed Assent)</h3>
            <div class="doc-body">
              <p>Halo teman-teman SMA,</p>
              <p>
                Kami mengundang kamu untuk mengisi kuesioner penelitian ini. Kamu akan diminta memberikan informasi terkait kondisi punggung kamu saat ini. Tolong diisi sesuai dengan keadaan sebenarnya (realistis), bukan keadaan ideal yang diharapkan.
              </p>
              <p><strong>Hal yang perlu kamu ketahui:</strong></p>
              <ul>
                <li>Pengisian ini memakan waktu sekitar 10-15 menit.</li>
                <li>Tidak ada sanksi akademik atau konsekuensi apa pun jika kamu tidak bersedia berpartisipasi atau ingin berhenti di tengah pengisian.</li>
                <li>Data pribadi dan tanda tangan kamu dijamin kerahasiaannya oleh FKUI.</li>
              </ul>
            </div>
          </div>

          <div class="form-group" :class="{ 'has-error': showValidationErrors && !form.student_name.trim() }">
            <label class="form-label" for="student_name">Nama Lengkap Siswa <span class="required">*</span></label>
            <input 
              type="text" 
              id="student_name" 
              class="form-control" 
              v-model="form.student_name" 
              placeholder="Tulis nama lengkap resmi Anda"
            />
            <p v-if="showValidationErrors && !form.student_name.trim()" class="error-message">
              ⚠️ Silakan isi nama lengkap Anda (siswa).
            </p>
          </div>

          <div class="form-group" :class="{ 'has-error': showValidationErrors && !form.student_signature }">
            <SignaturePad 
              v-model="form.student_signature" 
              label="Tanda Tangan Siswa" 
            />
            <p v-if="showValidationErrors && !form.student_signature" class="error-message">
              ⚠️ Silakan berikan tanda tangan Anda (siswa).
            </p>
          </div>

          <div class="btn-group">
            <button type="button" class="btn btn-secondary" @click="prevStep">Kembali</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="handleStep2Next"
            >
              Setuju & Lanjutkan
            </button>
          </div>
        </div>

        <!-- STEP 3: Profil & Demografi (Screening) -->
        <div v-if="currentStep === 3" class="animate-fade">
          <h3>Profil & Demografi</h3>
          <p class="step-desc">Silakan lengkapi profil dasar sekolah kamu untuk verifikasi kriteria penelitian.</p>
          
          <!-- Gender -->
          <div class="form-group" :class="{ 'has-error': showValidationErrors && form.gender === null }">
            <label class="form-label">Jenis Kelamin <span class="required">*</span></label>
            <div class="selection-grid">
              <label class="selection-card" :class="{ active: form.gender === 1 }">
                <input type="radio" :value="1" v-model="form.gender" /> Laki-laki
              </label>
              <label class="selection-card" :class="{ active: form.gender === 2 }">
                <input type="radio" :value="2" v-model="form.gender" /> Perempuan
              </label>
            </div>
            <p v-if="showValidationErrors && form.gender === null" class="error-message">
              ⚠️ Silakan pilih jenis kelamin Anda.
            </p>
          </div>

          <!-- Age -->
          <div class="form-group" :class="{ 'has-error': showValidationErrors && form.age === null }">
            <label class="form-label">Umur Responden <span class="required">*</span></label>
            <div class="selection-grid">
              <label class="selection-card" :class="{ active: form.age === 16 }">
                <input type="radio" :value="16" v-model="form.age" /> 16 Tahun
              </label>
              <label class="selection-card" :class="{ active: form.age === 17 }">
                <input type="radio" :value="17" v-model="form.age" /> 17 Tahun
              </label>
              <label class="selection-card" :class="{ active: form.age === 18 }">
                <input type="radio" :value="18" v-model="form.age" /> 18 Tahun
              </label>
              <label class="selection-card" :class="{ active: form.age === 99 }">
                <input type="radio" :value="99" v-model="form.age" /> Lainnya
              </label>
            </div>
            <p v-if="showValidationErrors && form.age === null" class="error-message">
              ⚠️ Silakan pilih umur Anda.
            </p>
          </div>

          <!-- Custom Age input (only if Lainnya is selected) -->
          <div v-if="form.age === 99" class="form-group animate-fade" :class="{ 'has-error': showValidationErrors && form.age === 99 && !form.custom_age }">
            <label class="form-label" for="custom_age">Usia berapa? (Tahun) <span class="required">*</span></label>
            <input 
              type="number" 
              id="custom_age" 
              class="form-control" 
              v-model="form.custom_age" 
              placeholder="Contoh: 15 atau 19"
              min="1"
              max="100"
            />
            <p v-if="showValidationErrors && form.age === 99 && !form.custom_age" class="error-message">
              ⚠️ Silakan masukkan usia Anda.
            </p>
          </div>

          <!-- School Name -->
          <div class="form-group" :class="{ 'has-error': showValidationErrors && !form.school.trim() }">
            <label class="form-label" for="school">Nama Sekolah SMA <span class="required">*</span></label>
            <input 
              type="text" 
              id="school" 
              class="form-control" 
              v-model="form.school" 
              placeholder="Contoh: SMAN 8 Jakarta"
            />
            <p class="input-tip">Tulis nama resmi SMA secara jelas, bukan singkatan gaul. Contoh: SMAN 8 Jakarta (BENAR), Smandel (SALAH).</p>
            <p v-if="showValidationErrors && !form.school.trim()" class="error-message">
              ⚠️ Silakan isi nama sekolah SMA Anda.
            </p>
          </div>

          <!-- Class Grade -->
          <div class="form-group" :class="{ 'has-error': showValidationErrors && form.class_grade === null }">
            <label class="form-label">Tingkat Kelas <span class="required">*</span></label>
            <div class="selection-grid">
              <label class="selection-card" :class="{ active: form.class_grade === 1 }">
                <input type="radio" :value="1" v-model="form.class_grade" /> 10 / Kelas 1
              </label>
              <label class="selection-card" :class="{ active: form.class_grade === 2 }">
                <input type="radio" :value="2" v-model="form.class_grade" /> 11 / Kelas 2
              </label>
              <label class="selection-card" :class="{ active: form.class_grade === 3 }">
                <input type="radio" :value="3" v-model="form.class_grade" /> 12 / Kelas 3
              </label>
            </div>
            <p v-if="showValidationErrors && form.class_grade === null" class="error-message">
              ⚠️ Silakan pilih tingkat kelas Anda.
            </p>
          </div>

          <!-- Transfer Status -->
          <div class="form-group" :class="{ 'has-error': showValidationErrors && form.is_transfer === null }">
            <label class="form-label">Apakah kamu berstatus siswa pindahan di sekolah saat ini? <span class="required">*</span></label>
            <div class="selection-grid">
              <label class="selection-card" :class="{ active: form.is_transfer === 1 }">
                <input type="radio" :value="1" v-model="form.is_transfer" /> Ya
              </label>
              <label class="selection-card" :class="{ active: form.is_transfer === 0 }">
                <input type="radio" :value="0" v-model="form.is_transfer" /> Tidak
              </label>
            </div>
            <p v-if="showValidationErrors && form.is_transfer === null" class="error-message">
              ⚠️ Silakan pilih status transfer Anda.
            </p>
          </div>

          <!-- Transfer Duration -->
          <div v-if="form.is_transfer === 1" class="form-group animate-fade" :class="{ 'has-error': showValidationErrors && form.is_transfer === 1 && (form.transfer_duration === null || form.transfer_duration === '') }">
            <label class="form-label">Sudah berapa lama sekolah di SMA saat ini? <span class="required">*</span></label>
            <div class="duration-inputs">
              <div class="duration-field">
                <input 
                  type="number" 
                  id="transfer_years" 
                  class="form-control" 
                  v-model="form.transfer_years" 
                  placeholder="0"
                  min="0"
                  @input="updateTransferDuration"
                />
                <span class="duration-unit">Tahun</span>
              </div>
              <div class="duration-field">
                <input 
                  type="number" 
                  id="transfer_months" 
                  class="form-control" 
                  v-model="form.transfer_months" 
                  placeholder="0"
                  min="0"
                  max="11"
                  @input="updateTransferDuration"
                />
                <span class="duration-unit">Bulan</span>
              </div>
            </div>
            <p v-if="showValidationErrors && form.is_transfer === 1 && (form.transfer_duration === null || form.transfer_duration === '')" class="error-message">
              ⚠️ Silakan isi lama bersekolah Anda (tahun dan/atau bulan).
            </p>
            <p class="input-tip">Minimal bersekolah selama 6 bulan (atau 0.5 tahun) agar lolos kriteria inklusi penelitian.</p>
          </div>

          <div class="btn-group">
            <button type="button" class="btn btn-secondary" @click="prevStep">Kembali</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="handleStep3Next"
            >
              Lanjutkan
            </button>
          </div>
        </div>

        <!-- STEP 4: Pertanyaan Utama Back Pain -->
        <div v-if="currentStep === 4" class="animate-fade">
          <h3>Pertanyaan Utama</h3>
          <p class="step-desc">Silakan jawab dengan jujur sesuai pengalaman fisik Anda.</p>

          <div class="form-group main-question-group" :class="{ 'has-error': showValidationErrors && form.has_back_pain === null }">
            <label class="form-label main-question-label">
              Apakah kamu pernah mengalami nyeri atau sakit di area sekitar tulang belakang (Back Pain)? <span class="required">*</span>
            </label>
            <div class="selection-grid-large">
              <label class="selection-card-large" :class="{ active: form.has_back_pain === 1 }">
                <input type="radio" :value="1" v-model="form.has_back_pain" />
                <span class="icon">🤕</span>
                <span class="title">Ya, Pernah</span>
                <span class="sub">Saya pernah merasakan rasa pegal/nyeri di punggung</span>
              </label>
              
              <label class="selection-card-large" :class="{ active: form.has_back_pain === 0 }">
                <input type="radio" :value="0" v-model="form.has_back_pain" />
                <span class="icon">😊</span>
                <span class="title">Tidak Pernah</span>
                <span class="sub">Punggung saya sehat-sehat saja</span>
              </label>
            </div>
            <p v-if="showValidationErrors && form.has_back_pain === null" class="error-message">
              ⚠️ Silakan pilih apakah kamu pernah mengalami nyeri atau sakit di area sekitar tulang belakang (Back Pain).
            </p>
          </div>

          <div class="btn-group">
            <button type="button" class="btn btn-secondary" @click="prevStep">Kembali</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="handleStep4Next"
            >
              {{ form.has_back_pain === 0 ? 'Kirim Formulir' : 'Lanjutkan' }}
            </button>
          </div>
        </div>

        <!-- STEP 5: Detail Keluhan Back Pain (Only if has_back_pain == 1) -->
        <div v-if="currentStep === 5" class="animate-fade">
          <h3>Detail Keluhan Back Pain</h3>
          <p class="step-desc">Lengkapi informasi klinis terkait nyeri punggung yang Anda rasakan.</p>

          <!-- Pain Duration in 12 months -->
          <div class="form-group" :class="{ 'has-error': showValidationErrors && form.pain_duration === null }">
            <label class="form-label">
              Jika ya, apakah Back Pain yang kamu alami terjadi dalam rentang 12 bulan terakhir? <span class="required">*</span>
            </label>
            <div class="vertical-selection">
              <label class="selection-row" :class="{ active: form.pain_duration === 1 }">
                <input type="radio" :value="1" v-model="form.pain_duration" />
                <span>Ya, nyeri punggung terjadi <strong>kurang dari 6 minggu</strong> (Akut)</span>
              </label>
              <label class="selection-row" :class="{ active: form.pain_duration === 2 }">
                <input type="radio" :value="2" v-model="form.pain_duration" />
                <span>Ya, nyeri punggung terjadi selama <strong>6-12 minggu</strong> (Subakut)</span>
              </label>
              <label class="selection-row" :class="{ active: form.pain_duration === 3 }">
                <input type="radio" :value="3" v-model="form.pain_duration" />
                <span>Ya, nyeri punggung terjadi sudah <strong>lebih dari 12 minggu</strong> (Kronik)</span>
              </label>
              <label class="selection-row" :class="{ active: form.pain_duration === 4 }">
                <input type="radio" :value="4" v-model="form.pain_duration" />
                <span>Tidak pernah nyeri punggung selama 12 bulan terakhir</span>
              </label>
            </div>
            <p v-if="showValidationErrors && form.pain_duration === null" class="error-message">
              ⚠️ Silakan pilih rentang waktu keluhan nyeri punggung Anda.
            </p>
          </div>

          <!-- Pain Causes -->
          <div class="form-group" :class="{ 'has-error': showValidationErrors && !isStep5CausesValid }">
            <label class="form-label">Mengapa kamu bisa mengalami nyeri punggung? (bisa memilih lebih dari satu) <span class="required">*</span></label>
            <div class="checkbox-grid">
              <label class="checkbox-row" :class="{ checked: form.pain_causes.cedera }">
                <input type="checkbox" v-model="form.pain_causes.cedera" />
                <span>Cedera (Otot/Saraf/Ligamen)</span>
              </label>
              <label class="checkbox-row" :class="{ checked: form.pain_causes.duduk_lama }">
                <input type="checkbox" v-model="form.pain_causes.duduk_lama" />
                <span>Duduk lebih dari 8 jam sehari</span>
              </label>
              <label class="checkbox-row" :class="{ checked: form.pain_causes.skoliosis }">
                <input type="checkbox" v-model="form.pain_causes.skoliosis" />
                <span>Skoliosis</span>
              </label>
              <label class="checkbox-row" :class="{ checked: form.pain_causes.tumor }">
                <input type="checkbox" v-model="form.pain_causes.tumor" />
                <span>Tumor</span>
              </label>
              <label class="checkbox-row" :class="{ checked: form.pain_causes.dokter_diagnosa }">
                <input type="checkbox" v-model="form.pain_causes.dokter_diagnosa" />
                <span>Penyakit lain yang didiagnosa oleh dokter</span>
              </label>
              <div v-if="form.pain_causes.dokter_diagnosa" class="conditional-input animate-fade">
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.pain_causes.dokter_diagnosa_detail" 
                  placeholder="Sebutkan diagnosis dokter"
                />
              </div>
              <label class="checkbox-row" :class="{ checked: form.pain_causes.lainnya }">
                <input type="checkbox" v-model="form.pain_causes.lainnya" />
                <span>Lainnya</span>
              </label>
              <div v-if="form.pain_causes.lainnya" class="conditional-input animate-fade">
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.pain_causes.pain_causes_other_detail" 
                  placeholder="Sebutkan alasan lainnya"
                />
              </div>
            </div>
            <p v-if="showValidationErrors && !isStep5CausesValid" class="error-message">
              ⚠️ Silakan pilih setidaknya satu alasan penyebab nyeri punggung (serta lengkapi rincian detail jika mencentang 'Penyakit lain' atau 'Lainnya').
            </p>
          </div>

          <!-- Interactive Spine Component -->
          <div class="form-group" :class="{ 'has-error': showValidationErrors && !isStep5AreasValid }">
            <InteractiveSpine v-model="form.pain_areas" />
            <p v-if="showValidationErrors && !isStep5AreasValid" class="error-message">
              ⚠️ Silakan pilih setidaknya satu area lokasi nyeri pada model tulang belakang di atas.
            </p>
          </div>

          <!-- Actions Taken -->
          <div class="form-group" :class="{ 'has-error': showValidationErrors && !isStep5ActionsValid }">
            <label class="form-label">Apa yang kamu lakukan ketika merasakan Back Pain? (bisa memilih lebih dari satu) <span class="required">*</span></label>
            <div class="checkbox-grid">
              <label class="checkbox-row" :class="{ checked: form.pain_actions.obat_bebas }">
                <input type="checkbox" v-model="form.pain_actions.obat_bebas" />
                <span>Menggunakan obat pereda nyeri secara mandiri (beli di apotik)</span>
              </label>
              <label class="checkbox-row" :class="{ checked: form.pain_actions.dokter_tanpa_obat }">
                <input type="checkbox" v-model="form.pain_actions.dokter_tanpa_obat" />
                <span>Pergi ke dokter tanpa menggunakan obat yang diberikan setelahnya</span>
              </label>
              <label class="checkbox-row" :class="{ checked: form.pain_actions.dokter_dengan_obat }">
                <input type="checkbox" v-model="form.pain_actions.dokter_dengan_obat" />
                <span>Pergi ke dokter dan meminum obat yang diberikan setelahnya</span>
              </label>
              <label class="checkbox-row" :class="{ checked: form.pain_actions.pijat }">
                <input type="checkbox" v-model="form.pain_actions.pijat" />
                <span>Pijat tradisional / urut</span>
              </label>
              <label class="checkbox-row" :class="{ checked: form.pain_actions.chiropractor }">
                <input type="checkbox" v-model="form.pain_actions.chiropractor" />
                <span>Melakukan terapi chiropractor</span>
              </label>
              <label class="checkbox-row" :class="{ checked: form.pain_actions.operasi }">
                <input type="checkbox" v-model="form.pain_actions.operasi" />
                <span>Menjalani tindakan operasi</span>
              </label>
              <label class="checkbox-row" :class="{ checked: form.pain_actions.lainnya }">
                <input type="checkbox" v-model="form.pain_actions.lainnya" />
                <span>Lainnya</span>
              </label>
              <div v-if="form.pain_actions.lainnya" class="conditional-input animate-fade">
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.pain_actions.action_lainnya_detail" 
                  placeholder="Sebutkan tindakan lainnya"
                />
              </div>
            </div>
            <p v-if="showValidationErrors && !isStep5ActionsValid" class="error-message">
              ⚠️ Silakan pilih setidaknya satu tindakan penanganan (serta isi rincian detail jika mencentang 'Lainnya').
            </p>
          </div>

          <!-- Pain Severity (NRS Scale Slider) -->
          <div class="form-group">
            <label class="form-label">
              Seberapa sakit nyeri Back Pain kamu selama 12 bulan terakhir? (Skala NRS) <span class="required">*</span>
            </label>
            <div class="slider-wrapper">
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="1" 
                v-model="form.pain_severity" 
                class="nrs-slider"
              />
              <div class="slider-ticks">
                <span v-for="i in 11" :key="i-1" :class="{ active: parseInt(form.pain_severity) === (i-1) }">
                  {{ i-1 }}
                </span>
              </div>
              <div class="severity-caption" :class="severityClass">
                <span>Skala {{ form.pain_severity }} / 10</span> &mdash; 
                <strong>{{ severityText }}</strong>
              </div>
            </div>
          </div>

          <div class="btn-group">
            <button type="button" class="btn btn-secondary" @click="prevStep">Kembali</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="handleStep5Submit"
            >
              Kirim Kuesioner
            </button>
          </div>
        </div>

      </form>
    </div>

    <!-- STEP 6: Thank You / CV Page -->
    <div v-else-if="currentStep === 6" class="card finish-card animate-fade">
      <div class="success-banner">
        <div class="success-icon">✓</div>
        <h2>Data Berhasil Dikirim!</h2>
        <p>Terima kasih banyak atas kesediaan Anda menyukseskan penelitian ini.</p>
      </div>

      <div class="contact-section">
        <h3>Butuh Bantuan atau Salinan Informasi?</h3>
        <p>Jika Bapak/Ibu Orang Tua atau Siswa memiliki pertanyaan lebih lanjut mengenai penelitian medis ini, silakan hubungi:</p>
        <a 
          href="https://wa.me/6281310100044" 
          target="_blank" 
          class="whatsapp-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.907h.004c4.368 0 7.926-3.558 7.93-7.93a7.896 7.896 0 0 0-2.327-5.594zm-5.608 9.778h-.002c-1.242 0-2.463-.334-3.537-.968l-.254-.15-2.61.685.698-2.541-.164-.262a6.578 6.578 0 0 1-1.003-3.504c.002-3.623 2.955-6.576 6.58-6.576 1.758 0 3.41.683 4.65 1.925a6.522 6.522 0 0 1 1.921 4.653c-.004 3.622-2.957 6.575-6.58 6.575zm3.569-4.86c-.198-.1-1.171-.577-1.353-.644-.182-.067-.315-.1-.448.1-.133.2-.516.643-.633.778-.117.135-.234.15-.432.05-.198-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.09-.088.198-.234.298-.35.1-.117.133-.198.198-.33.065-.134.034-.251-.015-.35-.05-.1-.448-1.08-.613-1.478-.16-.388-.336-.337-.46-.343-.118-.006-.254-.007-.39-.007-.136 0-.358.05-.546.257-.188.2-.72.703-.72 1.713 0 1.01.736 1.986.838 2.125.102.14 1.446 2.208 3.503 3.096.49.211.873.338 1.172.433.493.157.943.135 1.298.08.395-.058 1.172-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
          </svg>
          Hubungi WhatsApp Maulana (081310100044)
        </a>
      </div>

      <div class="profile-cards-container">
        <!-- Profile Maulana -->
        <div class="profile-card">
          <div class="avatar-placeholder">🎓</div>
          <div class="profile-info">
            <h4>Maulana Yusuf Angkasa</h4>
            <span class="profile-title">Peneliti Utama</span>
            <p class="profile-meta">NPM: 2306260366</p>
            <p class="profile-school">Program Pendidikan Dokter</p>
            <p class="profile-univ">Fakultas Kedokteran Univ. Indonesia</p>
            <a 
              href="https://drive.google.com/file/d/1_YJ70OaOmLvANcq69zr8_zvEVpSfrdL6/view?usp=sharing" 
              target="_blank" 
              class="btn-cv"
            >
              Lihat CV Peneliti
            </a>
          </div>
        </div>

        <!-- Profile Pembimbing -->
        <div class="profile-card">
          <div class="avatar-placeholder">🩺</div>
          <div class="profile-info">
            <h4>Dr. dr. Mohamad Saekhu, Sp.BS</h4>
            <span class="profile-title">Dosen Pembimbing</span>
            <p class="profile-dept">Departemen Bedah Saraf</p>
            <p class="profile-hospital">RSUPN Dr. Cipto Mangunkusumo</p>
            <p class="profile-univ">Fakultas Kedokteran Univ. Indonesia</p>
            <a 
              href="https://drive.google.com/file/d/1LxMuzgf6R6_6vvVBAwzM9LGQjw-0npcJ/view?usp=sharing" 
              target="_blank" 
              class="btn-cv"
            >
              Lihat CV Dosen Pembimbing
            </a>
          </div>
        </div>
      </div>

      <div class="new-survey-btn-wrapper">
        <button type="button" class="btn btn-secondary" @click="resetForm">
          Isi Kuesioner Baru
        </button>
      </div>
    </div>
  </div>

  <!-- Custom Confirmation Modal Overlay -->
  <div v-if="showConfirmSubmitModal" class="confirm-modal-overlay animate-fade">
    <div class="confirm-modal-card">
      <div class="confirm-modal-icon">❓</div>
      <h3>Konfirmasi Kirim Formulir</h3>
      <p>Apakah semua data yang diisi sudah benar? Jika sudah, silakan kirim formulirnya.</p>
      <div class="confirm-modal-actions">
        <button type="button" class="btn btn-secondary" @click="showConfirmSubmitModal = false">
          Periksa Kembali
        </button>
        <button type="button" class="btn btn-primary" :disabled="submitting" @click="confirmSubmit">
          {{ submitting ? 'Mengirim...' : 'Ya, Kirim Sekarang' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import SignaturePad from '../components/SignaturePad.vue';
import InteractiveSpine from '../components/InteractiveSpine.vue';

// Dynamic base URL detection for API calls
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5005/api' 
  : '/api';

const currentStep = ref(1);
const isDisqualified = ref(false);
const submitting = ref(false);
const showValidationErrors = ref(false);
const showConfirmSubmitModal = ref(false);

const initialForm = {
  parent_name: '',
  parent_student_name: '',
  parent_signature: '',
  student_name: '',
  student_signature: '',
  gender: null, // 1 = Laki-laki, 2 = Perempuan
  age: null, // 16, 17, 18, 99 (Lainnya)
  custom_age: '',
  school: '',
  is_transfer: null, // 1 = Ya, 0 = Tidak
  transfer_duration: null,
  transfer_years: '',
  transfer_months: '',
  class_grade: null, // 1, 2, 3
  has_back_pain: null, // 1 = Ya, 0 = Tidak
  
  // Detail keluhan back pain (Step 5)
  pain_duration: null, // 1, 2, 3, 4
  pain_causes: {
    cedera: false,
    duduk_lama: false,
    skoliosis: false,
    tumor: false,
    dokter_diagnosa: false,
    dokter_diagnosa_detail: '',
    lainnya: false,
    pain_causes_other_detail: ''
  },
  pain_areas: {
    leher: false,
    dada: false,
    pinggang: false
  },
  pain_actions: {
    obat_bebas: false,
    dokter_tanpa_obat: false,
    dokter_dengan_obat: false,
    pijat: false,
    chiropractor: false,
    operasi: false,
    lainnya: false,
    action_lainnya_detail: ''
  },
  pain_severity: 0 // Default slider position
};

const form = ref(JSON.parse(JSON.stringify(initialForm)));

// STEP VALIDATIONS
const isStep1Valid = computed(() => {
  return form.value.parent_name.trim() !== '' &&
         form.value.parent_student_name.trim() !== '' &&
         form.value.parent_signature !== '';
});

const isStep2Valid = computed(() => {
  return form.value.student_name.trim() !== '' &&
         form.value.student_signature !== '';
});

const isStep3Valid = computed(() => {
  const basicOk = form.value.gender !== null &&
                  form.value.age !== null &&
                  form.value.school.trim() !== '' &&
                  form.value.class_grade !== null &&
                  form.value.is_transfer !== null;
  
  if (!basicOk) return false;
  if (form.value.age === 99 && !form.value.custom_age) return false;
  if (form.value.is_transfer === 1) {
    return form.value.transfer_duration !== null && form.value.transfer_duration !== '';
  }
  return true;
});

const isStep5CausesValid = computed(() => {
  const causes = form.value.pain_causes;
  const hasCause = causes.cedera || causes.duduk_lama || causes.skoliosis || causes.tumor || causes.dokter_diagnosa || causes.lainnya;
  if (!hasCause) return false;
  if (causes.dokter_diagnosa && !causes.dokter_diagnosa_detail.trim()) return false;
  if (causes.lainnya && !causes.pain_causes_other_detail.trim()) return false;
  return true;
});

const isStep5AreasValid = computed(() => {
  const areas = form.value.pain_areas;
  return areas.leher || areas.dada || areas.pinggang;
});

const isStep5ActionsValid = computed(() => {
  const actions = form.value.pain_actions;
  const hasAction = actions.obat_bebas || actions.dokter_tanpa_obat || actions.dokter_dengan_obat || actions.pijat || actions.chiropractor || actions.operasi || actions.lainnya;
  if (!hasAction) return false;
  if (actions.lainnya && !actions.action_lainnya_detail.trim()) return false;
  return true;
});

const isStep5Valid = computed(() => {
  return form.value.pain_duration !== null &&
         isStep5CausesValid.value &&
         isStep5AreasValid.value &&
         isStep5ActionsValid.value;
});

// SLIDER NRS COMPUTATIONS
const severityText = computed(() => {
  const val = parseInt(form.value.pain_severity, 10);
  if (val === 0) return 'Tidak Sakit';
  if (val >= 1 && val <= 3) return 'Nyeri Ringan';
  if (val >= 4 && val <= 6) return 'Nyeri Sedang';
  return 'Nyeri Parah / Sangat Sakit';
});

const severityClass = computed(() => {
  const val = parseInt(form.value.pain_severity, 10);
  if (val === 0) return 'sev-none';
  if (val >= 1 && val <= 3) return 'sev-light';
  if (val >= 4 && val <= 6) return 'sev-med';
  return 'sev-high';
});

// NAVIGATION
const nextStep = () => {
  showValidationErrors.value = false;
  if (currentStep.value < 5) currentStep.value++;
};

const prevStep = () => {
  showValidationErrors.value = false;
  if (currentStep.value > 1) currentStep.value--;
};

// SCREENING (In Step 3 validation transition)
const handleScreening = () => {
  const isTransfer = parseInt(form.value.is_transfer, 10);
  const transferDuration = parseFloat(form.value.transfer_duration);

  // Exclude if transfer student and duration < 0.5 years
  if (isTransfer === 1 && transferDuration < 0.5) {
    isDisqualified.value = true;
    return;
  }

  // Pass screening (including Age 99 which is no longer immediately disqualified)
  nextStep();
};

// STEP 4 BRANCHING FLOW
const handleBackPainBranch = () => {
  if (form.value.has_back_pain === 0) {
    // Show confirmation modal instead of saving directly
    showConfirmSubmitModal.value = true;
  } else {
    // Go to Step 5
    nextStep();
  }
};

// STEP-BY-STEP VALIDATION & TRANSITION HANDLERS
const handleStep1Next = () => {
  if (isStep1Valid.value) {
    showValidationErrors.value = false;
    nextStep();
  } else {
    showValidationErrors.value = true;
    scrollToFirstError();
  }
};

const handleStep2Next = () => {
  if (isStep2Valid.value) {
    showValidationErrors.value = false;
    nextStep();
  } else {
    showValidationErrors.value = true;
    scrollToFirstError();
  }
};

const handleStep3Next = () => {
  if (isStep3Valid.value) {
    showValidationErrors.value = false;
    handleScreening();
  } else {
    showValidationErrors.value = true;
    scrollToFirstError();
  }
};

const handleStep4Next = () => {
  if (form.value.has_back_pain !== null) {
    showValidationErrors.value = false;
    handleBackPainBranch();
  } else {
    showValidationErrors.value = true;
    scrollToFirstError();
  }
};

const handleStep5Submit = () => {
  if (isStep5Valid.value) {
    showValidationErrors.value = false;
    showConfirmSubmitModal.value = true;
  } else {
    showValidationErrors.value = true;
    scrollToFirstError();
  }
};

// Calculate transfer duration from Years & Months input fields
const updateTransferDuration = () => {
  const yStr = form.value.transfer_years;
  const mStr = form.value.transfer_months;
  
  if ((yStr === '' || yStr === null || yStr === undefined) && 
      (mStr === '' || mStr === null || mStr === undefined)) {
    form.value.transfer_duration = null;
    return;
  }
  
  const y = parseInt(yStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  form.value.transfer_duration = y + (m / 12);
};

// Smooth scroll to the first element with validation error
const scrollToFirstError = () => {
  nextTick(() => {
    const firstErrorEl = document.querySelector('.has-error');
    if (firstErrorEl) {
      firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};

// CONFIRMED SUBMISSION FROM MODAL
const confirmSubmit = () => {
  showConfirmSubmitModal.value = false;
  submitSurvey();
};

// SUBMISSION API CALL
const submitSurvey = async () => {
  submitting.value = true;
  try {
    const payload = JSON.parse(JSON.stringify(form.value));
    
    // Map custom age if Lainnya is selected
    if (payload.age === 99 && payload.custom_age) {
      payload.age = parseInt(payload.custom_age, 10);
    }
    
    const response = await fetch(`${API_BASE}/kuesioner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok) {
      currentStep.value = 6; // Success step
    } else {
      alert(result.message || 'Gagal mengirim kuesioner. Silakan coba lagi.');
    }
  } catch (error) {
    console.error('Error sending survey:', error);
    alert('Terjadi kesalahan koneksi ke server. Pastikan server BE berjalan.');
  } finally {
    submitting.value = false;
  }
};

// SUBMIT EXCLUDED SUBMISSIONS
const submitDisqualified = async () => {
  submitting.value = true;
  try {
    const resolvedAge = form.value.age === 99 ? parseInt(form.value.custom_age, 10) : form.value.age;
    
    // Save partial answers for inclusion analysis
    const payload = {
      parent_name: form.value.parent_name,
      parent_student_name: form.value.parent_student_name,
      parent_signature: form.value.parent_signature,
      student_name: form.value.student_name,
      student_signature: form.value.student_signature,
      gender: form.value.gender,
      age: resolvedAge,
      school: form.value.school,
      is_transfer: form.value.is_transfer,
      transfer_duration: form.value.transfer_duration,
      class_grade: form.value.class_grade,
      has_back_pain: null // Disqualified
    };

    const response = await fetch(`${API_BASE}/kuesioner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok) {
      currentStep.value = 6; // Success step
      isDisqualified.value = false; // Reset screen state
    } else {
      alert(result.message || 'Gagal menyimpan data.');
    }
  } catch (error) {
    console.error('Error sending data:', error);
    alert('Terjadi kesalahan koneksi ke server.');
  } finally {
    submitting.value = false;
  }
};

// RESET WIZARD
const resetForm = () => {
  form.value = JSON.parse(JSON.stringify(initialForm));
  currentStep.value = 1;
  isDisqualified.value = false;
  showValidationErrors.value = false;
  showConfirmSubmitModal.value = false;
};
</script>

<style scoped>
.survey-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-logo-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.fkui-badge {
  background-color: #e8f3ff;
  color: var(--sky-blue-hover);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
}

.research-tag {
  background-color: #f1f5f9;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.survey-header h2 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 6px;
}

.survey-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.3;
}

.supervisor-info {
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.step-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.required {
  color: #ef4444;
}

/* Document styled boxes (informed consent/assent) */
.informed-consent-doc {
  background-color: #fdfefe;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 24px;
  height: 240px;
  overflow-y: auto;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.informed-consent-doc h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-dark);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.doc-body p {
  font-size: 0.9rem;
  margin-bottom: 12px;
  color: var(--text-dark);
  text-align: justify;
}

.doc-body ul, .doc-body ol {
  margin-left: 20px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

/* Input tips */
.input-tip {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 6px;
}

/* Large branching buttons (Step 4) */
.selection-grid-large {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 16px;
}

.selection-card-large {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  background-color: #fff;
  transition: var(--transition-smooth);
  text-align: center;
  user-select: none;
}

.selection-card-large input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.selection-card-large:hover {
  border-color: var(--sky-blue);
  background-color: var(--sky-blue-light);
}

.selection-card-large.active {
  border-color: var(--sky-blue);
  background-color: var(--sky-blue-light);
  box-shadow: var(--shadow-md);
}

.selection-card-large .icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.selection-card-large .title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.selection-card-large .sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Step 5 Custom Styles */
.vertical-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.selection-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  background-color: #fff;
  transition: var(--transition-smooth);
}

.selection-row input {
  width: 18px;
  height: 18px;
  accent-color: var(--sky-blue);
}

.selection-row:hover {
  border-color: var(--sky-blue);
  background-color: var(--sky-blue-light);
}

.selection-row.active {
  border-color: var(--sky-blue);
  background-color: var(--sky-blue-light);
}

.checkbox-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  background-color: #fdfefe;
  transition: var(--transition-smooth);
  user-select: none;
}

.checkbox-row input {
  width: 18px;
  height: 18px;
  accent-color: var(--sky-blue);
}

.checkbox-row:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.checkbox-row.checked {
  background-color: var(--sky-blue-light);
  border-color: var(--sky-blue);
}

.conditional-input {
  padding-left: 32px;
  margin-top: -4px;
  margin-bottom: 6px;
}

/* NRS Slider Style */
.slider-wrapper {
  margin-top: 16px;
  padding: 8px;
}

.nrs-slider {
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: var(--border-color);
  outline: none;
  margin-bottom: 12px;
}

.nrs-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--sky-blue);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(88, 166, 255, 0.4);
  transition: transform 0.1s ease;
}

.nrs-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
  margin-bottom: 20px;
}

.slider-ticks span {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.slider-ticks span.active {
  color: var(--sky-blue-hover);
  font-weight: 700;
}

.severity-caption {
  padding: 12px;
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 1rem;
}

.sev-none {
  background-color: #f1f5f9;
  color: #64748b;
}

.sev-light {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.sev-med {
  background-color: #fff3e0;
  color: #ef6c00;
}

.sev-high {
  background-color: #ffebee;
  color: #c62828;
}

/* Button groups */
.btn-group {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  gap: 16px;
}

/* Disqualification & Finish Screens */
.disqualify-card {
  text-align: center;
  padding: 40px;
}

.disqualify-icon {
  width: 64px;
  height: 64px;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.disqualify-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.exclusion-reason {
  background-color: #fcf8e3;
  border: 1px solid #faebcc;
  border-radius: var(--radius-md);
  padding: 16px 20px;
  text-align: left;
  margin: 20px 0;
}

.exclusion-reason ul {
  padding-left: 20px;
}

.exclusion-reason li {
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: #856404;
}

.final-instruction {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 24px;
}

/* Finish Card / Thank You Layout */
.finish-card {
  text-align: center;
  padding: 40px 32px;
}

.success-banner {
  margin-bottom: 32px;
}

.success-icon {
  width: 64px;
  height: 64px;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.finish-card h2 {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-dark);
}

.contact-section {
  background-color: var(--sky-blue-light);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 32px;
  border: 1px solid #d0e7ff;
}

.contact-section h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.contact-section p {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.whatsapp-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #25d366;
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 10px rgba(37, 211, 102, 0.25);
  transition: var(--transition-smooth);
}

.whatsapp-btn:hover {
  background-color: #128c7e;
  transform: translateY(-1px);
}

.profile-cards-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
  text-align: left;
}

.profile-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: #fff;
}

.avatar-placeholder {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.profile-info h4 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.profile-title {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: var(--sky-blue-light);
  color: var(--sky-blue-hover);
  padding: 2px 8px;
  border-radius: 10px;
  margin-bottom: 8px;
}

.profile-info p {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.btn-cv {
  display: inline-flex;
  align-items: center;
  margin-top: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--sky-blue-hover);
  background-color: var(--sky-blue-light);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: var(--transition-smooth);
}

.btn-cv:hover {
  background-color: var(--sky-blue);
  color: white;
}

.new-survey-btn-wrapper {
  border-top: 1px solid var(--border-color);
  padding-top: 24px;
}

@media (max-width: 600px) {
  .selection-grid-large {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .profile-cards-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .conditional-input {
    padding-left: 0;
  }
}

/* Years/Months Duration Inputs */
.duration-inputs {
  display: flex;
  gap: 16px;
}

.duration-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.duration-unit {
  font-size: 0.95rem;
  font-weight: 500;
  color: #475569;
}

/* Custom Confirmation Modal Overlay */
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.confirm-modal-card {
  background-color: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2xl);
  padding: 32px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  border: 1px solid var(--border-color);
}

.confirm-modal-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.confirm-modal-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 12px;
}

.confirm-modal-card p {
  color: #475569;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 24px;
}

.confirm-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-modal-actions button {
  flex: 1;
  padding: 12px 20px;
}

/* Error messages and highlighted forms */
.error-message {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-group.has-error {
  border: 2px solid #ef4444 !important;
  border-radius: var(--radius-md) !important;
  padding: 16px !important;
  background-color: #fef2f2 !important;
  margin-bottom: 24px !important;
  transition: all 0.3s ease;
}

.form-group.has-error :deep(.canvas-wrapper),
.form-group.has-error :deep(.interactive-spine-container),
.form-group.has-error :deep(.signature-container) {
  border-color: #ef4444 !important;
}
</style>
