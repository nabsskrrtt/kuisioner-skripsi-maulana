# PRODUCT REQUIREMENT DOCUMENT (PRD)
## Platform Kuesioner Penelitian Web Interaktif: "Prevalensi Back Pain pada Anak SMA dan Faktor Penyebabnya"

---

## 1. PENDAHULUAN & LATAR BELAKANG

### 1.1 Deskripsi Proyek
Dokumen ini mendefinisikan persyaratan produk (PRD) untuk platform kuesioner web interaktif dan responsif yang dirancang khusus untuk memfasilitasi penelitian skripsi mahasiswa Fakultas Kedokteran Universitas Indonesia (FKUI). Platform ini akan mengumpulkan, memvalidasi, dan menyimpan data primer terkait kejadian nyeri punggung (*back pain*) pada remaja usia sekolah menengah atas.

### 1.2 Informasi Penelitian & Stakeholder
*   **Peneliti Utama:** Maulana Yusuf Angkasa (NPM: 2306260366), Program Pendidikan Dokter, Fakultas Kedokteran, Universitas Indonesia.
*   **Dosen Pembimbing:** Dr. dr. Mohamad Saekhu, Sp.BS, Departemen Bedah Saraf, Rumah Sakit Umum Pusat Nasional Cipto Mangunkusumo (RSCM) / Fakultas Kedokteran Universitas Indonesia.
*   **Judul Penelitian:** *Prevalensi Back Pain pada Anak SMA dan Faktor Penyebabnya*.
*   **Tujuan Umum:** Mendapatkan gambaran komprehensif mengenai angka kejadian *back pain* pada siswa SMA usia 16-18 tahun di sekitar UI Depok atau UI Salemba (dalam radius 3 km).
*   **Target Responden:** Minimal 120 orang siswa SMA yang memenuhi kriteria inklusi dan eksklusi penelitian.

### 1.3 Kriteria Subjek Penelitian
Untuk memastikan integritas data penelitian medis, platform kuesioner wajib menerapkan aturan penyaringan (*screening*) otomatis berdasarkan kriteria berikut:
*   **Kriteria Inklusi:**
    1. Berusia 16–18 tahun.
    2. Bersekolah di SMA yang berada dalam radius 3 km dari kampus Universitas Indonesia (Depok atau Salemba).
    3. Mendapatkan izin dari orang tua/wali (*Informed Consent*) serta bersedia secara sukarela (*Informed Assent*).
*   **Kriteria Eksklusi:**
    1. Siswa yang tidak bersedia mengisi form kuesioner secara sukarela.
    2. Bukan siswa di sekolah tempat pengambilan sampel penelitian.
    3. Siswa pindahan baru yang bersekolah di SMA saat ini kurang dari 6 bulan (jika berstatus siswa pindahan, lama sekolah harus $\ge$ 0,5 tahun).

---

## 2. PENGGUNA & ARSITEKTUR PLATFORM

Platform ini dirancang dengan arsitektur **decoupled** menggunakan **Vue.js 3** sebagai *Frontend (FE)* dan *Backend (BE)* menggunakan **Node.js (Express)** atau **Python (FastAPI)** dengan basis data **SQLite** (sangat praktis untuk skala 120+ responden).

### 2.1 Peran Pengguna (User Roles)
Platform ini membagi hak akses menjadi tiga peran utama:

1.  **Siswa (Responden Utama):**
    *   Membaca penjelasan penelitian (*Informed Assent*).
    *   Mengisi tanda tangan digital (*Assent Signature*).
    *   Mengisi profil demografi dan kuesioner *back pain*.
2.  **Orang Tua / Wali:**
    *   Membaca lembar persetujuan (*Informed Consent*).
    *   Mengisi nama orang tua, nama anak, dan tanda tangan digital (*Consent Signature*).
    *   *Catatan Alur:* Sesuai etika penelitian kedokteran, Orang Tua wajib memberikan persetujuan (*Informed Consent*) terlebih dahulu atau secara sekuensial (bisa dalam satu perangkat/sesi bersama anak) sebelum anak mengisi lembar *Informed Assent* dan kuesioner.
3.  **Administrator (Peneliti - Maulana):**
    *   Mengakses Dasbor Admin yang dilindungi kata sandi (*secure route*).
    *   Memantau total pengisian secara real-time (target progress bar menuju 120 responden).
    *   Melihat tabel data mentah seluruh responden beserta tanda tangannya.
    *   Mengekspor data ke dalam file Excel (.xlsx) / CSV yang terformat khusus dan siap diimpor langsung ke program **SPSS**.
    *   Melihat **Live Dummy Tables** (Tabel Kosong Penelitian) yang otomatis terisi data kumulatif hasil survei untuk mempermudah penyusunan Bab 4 Skripsi.

---

## 3. ALUR PENGGUNA (USER FLOW) & KEBUTUHAN FUNGSIONAL FE

### 3.1 Tema Visual & Desain Antarmuka (UX/UI)
Sesuai dengan kebutuhan segmentasi responden remaja (anak SMA) agar nyaman dan tidak jenuh mengisi kuesioner medis, FE Vue.js harus menerapkan gaya visual berikut:
*   **Palet Warna:** *Japanese soft pastel, warm, colorful* dengan aksen dominan *sky blue* (langit biru) yang melambangkan ketenangan akademis dan medis namun tetap ramah remaja.
*   **Tipografi & Komponen:** Rounded corners pada card, transisi animasi halus antar halaman/langkah (wizard-style kuesioner), tombol interaktif yang besar (ramah perangkat mobile).
*   **Responsivitas Tinggi:** Wajib berjalan lancar tanpa cacat layout (*no layout shifts*) di browser smartphone (Safari, Chrome, Samsung Internet), tablet/iPad, dan laptop/desktop.

### 3.2 Diagram Alur Langkah Kuesioner (Sisi Responden)
Kuesioner dirancang dengan sistem **Step-by-Step Wizard** untuk mengurangi kejenuhan pengisian:

```text
[Langkah 1: Penjelasan & Informed Consent Ortu]
        │
        ▼ (Setuju + Tanda Tangan Ortu)
[Langkah 2: Informed Assent Siswa]
        │
        ▼ (Setuju + Tanda Tangan Siswa)
[Langkah 3: Skrining Profil & Demografi]
        │
        ├── Age != 16, 17, 18 ───────────────► [Halaman Eksklusi / Disqualify]
        ├── IsTransfer == Ya & Duration < 0.5 ─► [Halaman Eksklusi / Disqualify]
        └── Lolos Skrining
        │
        ▼
[Langkah 4: Pertanyaan Utama Back Pain?]
        │
        ├── TIDAK ───────────────────────────► [Langkah 6: Terima Kasih / Selesai]
        └── YA
        │
        ▼
[Langkah 5: Detail Keluhan Back Pain (Multi-select, Ilustrasi Anatomi & Skala NRS)]
        │
        ▼
[Langkah 6: Terima Kasih, Kontak Peneliti, & Informasi CV]
```

### 3.3 Detail Kebutuhan Fungsional per Langkah (Wizard Steps)

#### Langkah 1: Lembar Informed Consent (Orang Tua / Wali)
*   **Konten Wajib:** Teks penjelasan dari Maulana Yusuf Angkasa mengenai maksud, tujuan (memetakan prevalensi *back pain* anak SMA), manfaat (landasan edukasi dan kebijakan pemerintah), kerahasiaan data, dan sifat sukarela dari penelitian dibimbing oleh Dr. dr. Mohamad Saekhu, Sp.BS.
*   **Input Field:**
    *   `parent_name` (Text, Required): Nama Orang Tua/Wali.
    *   `parent_student_name` (Text, Required): Nama Anak yang akan mengisi kuesioner.
    *   `parent_signature` (Canvas Pad, Required): Pad tanda tangan digital menggunakan sentuhan jari atau mouse pointer.
    *   `consent_date` (Date, Auto-filled): Tanggal pengisian persetujuan.

#### Langkah 2: Lembar Informed Assent (Siswa)
*   **Konten Wajib:** Penjelasan ramah anak mengenai durasi pengisian (10-15 menit) dan keharusan mengisi dengan kondisi riil saat ini (bukan kondisi ideal), hak untuk mundur kapan saja tanpa sanksi akademik apa pun.
*   **Input Field:**
    *   `student_name` (Text, Required): Nama Lengkap Siswa.
    *   `student_signature` (Canvas Pad, Required): Pad tanda tangan digital siswa.

#### Langkah 3: Profil & Demografi (Skrining Inklusi/Eksklusi)
*   **Input Field:**
    *   `gender` (Radio, Required): "Laki-laki" atau "Perempuan".
    *   `age` (Radio, Required): "16", "17", "18", atau "Lainnya" (Jika memilih Lainnya, kuesioner langsung diarahkan ke halaman eksklusi dengan penjelasan santun).
    *   `school` (Text, Required): Input nama sekolah dengan placeholder instruksi jelas: *"Tulis nama resmi SMA secara jelas, bukan singkatan gaul. Contoh: SMAN 8 Jakarta (BENAR), Smandel (SALAH)"*.
    *   `is_transfer` (Radio, Required): "Ya" atau "Tidak" (Apakah siswa pindahan sebelum bersekolah di sini?).
    *   `transfer_duration` (Number, Conditional): Muncul jika `is_transfer` == "Ya". Input berupa angka tahun (contoh: 0.5, 1, 1.5, 2). *Aturan Validasi:* Jika angka < 0.5 tahun (kurang dari 6 bulan), siswa otomatis diarahkan ke halaman eksklusi.
    *   `class_grade` (Radio, Required): "10 / Kelas 1", "11 / Kelas 2", "12 / Kelas 3".

#### Langkah 4: Pertanyaan Utama Back Pain
*   **Input Field:**
    *   `has_back_pain` (Radio, Required): *"Apakah kamu pernah mengalami nyeri punggung (Back Pain)?"* -> Pilihan: **"Ya"** atau **"Tidak"**.
    *   *Logika Percabangan:*
        *   Jika **"Tidak"**, simpan data dan langsung lompat ke **Langkah 6 (Halaman Selesai)**.
        *   Jika **"Ya"**, lanjutkan ke **Langkah 5 (Detail Keluhan)**.

#### Langkah 5: Detail Keluhan Back Pain (Khusus yang Menjawab "Ya")
*   **Input Field & Logika:**
    1.  **Durasi dalam 12 Bulan Terakhir:**
        *   `pain_duration` (Radio, Required): *"Jika ya, apakah Back Pain yang kamu alami dalam rentang 12 bulan terakhir?"*
        *   Pilihan jawaban (Pilih salah satu):
            *   "Ya, nyeri punggung terjadi kurang dari 6 minggu" (Klasifikasi: Akut)
            *   "Ya, nyeri punggung terjadi selama 6-12 minggu" (Klasifikasi: Subakut)
            *   "Ya, nyeri punggung terjadi sudah lebih dari 12 minggu" (Klasifikasi: Kronik)
            *   "Tidak pernah nyeri punggung selama 12 bulan terakhir"
    2.  **Penyebab yang Dirasakan (Etiologi):**
        *   `pain_causes` (Checkbox/Multi-select, Required): *"Mengya kamu bisa mengalami nyeri punggung? (bisa memilih lebih dari satu)"*
        *   Pilihan:
            *   `cedera` (Cedera otot/saraf/ligamen)
            *   `duduk_lama` (Duduk lebih dari 8 jam sehari)
            *   `skoliosis` (Skoliosis)
            *   `tumor` (Tumor)
            *   `dokter_diagnosa` (Penyakit lain yang didiagnosa oleh dokter) -> Jika dicentang, tampilkan text field input: *`dokter_diagnosa_detail` (Sebutkan diagnosis dokter)*.
            *   `lainnya` (Lainnya) -> Jika dicentang, tampilkan text field input: *`pain_causes_other_detail` (Sebutkan alasan lainnya)*.
    3.  **Area Nyeri Punggung (Anatomi Vertebra):**
        *   `pain_areas` (Checkbox/Multi-select, Required): *"Di area punggung mana biasanya kamu merasakan nyeri punggung?"*
        *   *Fitur FE:* Tampilkan visual/ilustrasi penampang tulang belakang pembagian vertebra (Leher/Cervical, Punggung dada/Thoracal, Pinggang/Lumbar) untuk mempermudah pemahaman siswa.
        *   Pilihan:
            *   `leher` (Leher / Cervical)
            *   `dada` (Punggung dada / Thoracal)
            *   `pinggang` (Pinggang / Lower Back / Lumbal)
    4.  **Tata Laksana Mandiri / Pengobatan:**
        *   `pain_actions` (Checkbox/Multi-select, Required): *"Apa yang kamu lakukan ketika merasakan Back Pain?"*
        *   Pilihan:
            *   `obat_bebas` (Menggunakan obat pereda nyeri secara mandiri)
            *   `dokter_tanpa_obat` (Pergi ke dokter tanpa menggunakan obat yang diberikan setelahnya)
            *   `dokter_dengan_obat` (Pergi ke dokter dan menggunakan obat yang diberikan setelahnya)
            *   `pijat` (Pijat tradisional / urut)
            *   `chiropractor` (Melakukan terapi chiropractor)
            *   `operasi` (Menjalani tindakan operasi)
            *   `lainnya` (Lainnya - sebutkan via text input detail)
    5.  **Skala Tingkat Keparahan Nyeri (Numeric Rating Scale - NRS):**
        *   `pain_severity` (Slider/Radio, Required): *"Seberapa sakit nyeri Back Pain kamu selama 12 bulan terakhir?"*
        *   *Komponen FE:* Slider interaktif skala **0 sampai 10** dengan panduan teks keterangan yang dinamis:
            *   `0`: "Tidak Sakit"
            *   `1–3`: "Nyeri Ringan"
            *   `4–6`: "Nyeri Sedang"
            *   `7–10`: "Nyeri Parah / Sangat Sakit"

#### Langkah 6: Penutup, Kontak & CV Informasi
*   **Pesan Sukses:** Ucapan terima kasih formal atas partisipasi siswa dan orang tua dalam menyukseskan penelitian skripsi Maulana Yusuf Angkasa.
*   **Informasi Kontak Peneliti:** WhatsApp Maulana Yusuf Angkasa (081310100044) untuk pertanyaan atau jika subjek membutuhkan salinan edukasi lebih lanjut.
*   **Kartu Informasi Akademis (FE Card):** Menampilkan profil Maulana (Foto, NPM, Institusi FKUI) serta pembimbing Dr. dr. Mohamad Saekhu, Sp.BS (Departemen Bedah Saraf RSCM/FKUI).

---

## 4. VIEW ADMINISTRATOR (DASHBOARD KONTROL PENELITI)

Kebutuhan khusus dari Maulana adalah kemudahan dalam mengontrol data masuk tanpa perlu membuka database mentah. Fitur Dashboard Admin dirancang seringkas mungkin namun fungsional:

### 4.1 Otentikasi Sederhana
*   Halaman login admin dengan rute `/admin-survei-login` atau `/admin`.
*   Menggunakan pengamanan berbasis sesi atau token JWT sederhana dengan *single credentials* yang dikonfigurasi melalui `.env` di backend (tanpa sistem pendaftaran akun baru).

### 4.2 Dasbor Metrik Utama (Dashboard Overview)
1.  **Target Tracker:** Progress bar interaktif "Jumlah Responden Terkumpul" (misalnya: **85 / 120 Responden** - 70.8%).
2.  **Prevalensi Back Pain Aktual:** Pie chart kecil atau persentase pengisi yang memiliki keluhan back pain (Total Ya vs Total Tidak).
3.  **Metrik Inklusi/Eksklusi:** Angka jumlah siswa yang tereliminasi di tahap skrining karena tidak memenuhi syarat (contoh: umur di luar kriteria, atau pindahan baru < 6 bulan).

### 4.3 Data Table & Export
*   Tabel interaktif yang menampilkan daftar lengkap pengisi kuesioner yang lolos skrining.
*   Kolom pencarian berdasarkan nama siswa atau nama SMA.
*   **Tombol "Unduh Data Excel (.xlsx)"**: Ekspor otomatis seluruh baris database ke format lembar sebar (spreadsheet). Kolom tanda tangan diubah menjadi representasi teks Base64 atau URL unduhan gambar tanda tangan di server.

---

## 5. LIVE DUMMY TABLES (SPESIFIKASI SKRIPSI FKUI)

Salah satu nilai tambah paling krusial untuk Admin View adalah menampilkan **Live Dummy Tables** secara dinamis di halaman admin. Angka frekuensi ($n$) dan persentase ($\%$) dalam tabel-tabel ini akan otomatis terhitung dari data responden yang tersimpan di basis data. Hal ini mempermudah Maulana untuk langsung menyalin data ke dalam Bab 4 (Hasil Penelitian) skripsinya.

### 5.1 Tabel 1: Karakteristik Responden Berdasarkan Demografi & Keluhan Back Pain (Tabel Silang / Cross-tabulation)

Tabel ini membagi distribusi seluruh variabel berdasarkan Jenis Kelamin (Laki-laki vs Perempuan) dan menampilkan total agregatnya.

$$N_{\text{total}} = \text{Jumlah Responden Lolos Skrining}$$

| Variabel | Laki-laki ($n$) | Laki-laki ($\%$) | Perempuan ($n$) | Perempuan ($\%$) | Total ($N$) | Total ($\%$) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Umur** | | | | | | |
| *   16 Tahun | | | | | | |
| *   17 Tahun | | | | | | |
| *   18 Tahun | | | | | | |
| **Apakah Pernah Mengalami Back Pain?** | | | | | | |
| *   Ya | | | | | | |
| *   Tidak | | | | | | |
| **Durasi Gejala Back Pain (12 Bulan Terakhir)** | | | | | | |
| *   $<$ 6 minggu (Akut) | | | | | | |
| *   6-12 minggu (Subakut) | | | | | | |
| *   $>$ 12 minggu (Kronik) | | | | | | |
| *   Tidak pernah nyeri dalam 12 bulan terakhir | | | | | | |
| **Faktor Penyebab Back Pain (Etiologi) \*** | | | | | | |
| *   Cedera (Otot/Saraf/Ligamen) | | | | | | |
| *   Duduk lebih dari 8 jam | | | | | | |
| *   Skoliosis | | | | | | |
| *   Tumor | | | | | | |
| *   Penyakit didiagnosa oleh dokter | | | | | | |
| *   Lainnya | | | | | | |
| **Area Vertebra (Lokasi Nyeri) \*** | | | | | | |
| *   Cervical (Leher) | | | | | | |
| *   Thoracal (Punggung Dada) | | | | | | |
| *   Lumbal (Pinggang / Lower Back) | | | | | | |
| **Tata Laksana (Tindakan) \*** | | | | | | |
| *   Menggunakan obat pereda nyeri secara mandiri | | | | | | |
| *   Pergi ke dokter tanpa menggunakan obat | | | | | | |
| *   Pergi ke dokter dan menggunakan obat | | | | | | |
| *   Pijat tradisional / urut | | | | | | |
| *   Terapi chiropractor | | | | | | |
| *   Tindakan Operasi | | | | | | |
| *   Lainnya | | | | | | |
| **Tingkat Keparahan Nyeri (Skala Likert NRS)** | | | | | | |
| *   0 (Tidak Sakit) | | | | | | |
| *   1–3 (Ringan) | | | | | | |
| *   4–6 (Sedang) | | | | | | |
| *   7–10 (Berat / Sangat Sakit) | | | | | | |

*\*Catatan:* Variabel bertanda bintang ($\*$) merupakan pertanyaan dengan jawaban ganda (*multiple choice* / Checkbox). Total persentase untuk sub-bagian tersebut bisa melebihi $100\%$ karena satu siswa dapat memilih lebih dari satu jawaban.

### 5.2 Tabel 2: Analisis Variabel Numerik Tunggal (Umur)

Sesuai metodologi penelitian FKUI, variabel umur juga disajikan dalam bentuk data statistik deskriptif parametrik/non-parametrik:

| Variabel | Mean $\pm$ Standard Deviation (SD) | Median (Min – Max) |
| :--- | :---: | :---: |
| **Umur Responden** | $\bar{X} \pm SD$ | $Me \ (Min - Max)$ |

*Formula Backend:*
*   **Mean:** Rerata aritmatika umur seluruh responden.
*   **SD:** Standar deviasi sampel dari umur.
*   **Median:** Nilai tengah dari seluruh data umur setelah diurutkan.
*   **Min – Max:** Batas umur minimum (pasti 16) dan maksimum (pasti 18) dari responden lolos skrining.

---

## 6. SPESIFIKASI DATA & SPSS DICTIONARY (BACKEND API MAPPING)

Untuk memfasilitasi pengolahan data menggunakan aplikasi **SPSS** oleh Maulana, seluruh jawaban kuesioner yang disimpan ke database harus dimapping ke dalam kode angka (*Numeric Codes*). 

Berikut adalah **Data Dictionary & API Payload Mapping** yang wajib digunakan:

### 6.1 Database Schema & Data Dictionary

| Nama Kolom DB | Tipe Data DB | SPSS Value Label Mapping | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | INT (PK) | *None* | Auto-increment ID unik responden |
| `parent_name` | VARCHAR | *None* | Nama Orang Tua / Wali |
| `parent_student_name`| VARCHAR | *None* | Nama Anak (menurut Ortu) |
| `parent_signature` | TEXT | *None* | Gambar tanda tangan Ortu (Base64) |
| `student_name` | VARCHAR | *None* | Nama Lengkap Siswa |
| `student_signature` | TEXT | *None* | Gambar tanda tangan Siswa (Base64) |
| `gender` | INT | `1` = Laki-laki, `2` = Perempuan | Jenis Kelamin Responden |
| `age` | INT | `16`, `17`, `18` | Umur aktual dalam tahun |
| `school` | VARCHAR | *None* | Nama resmi SMA siswa |
| `is_transfer` | INT | `0` = Tidak, `1` = Ya | Status siswa pindahan |
| `transfer_duration` | FLOAT | *None* (Null-able jika `is_transfer` = 0) | Durasi bersekolah dalam tahun |
| `class_grade` | INT | `1` = Kelas 10, `2` = Kelas 11, `3` = Kelas 12 | Tingkat kelas di SMA |
| `has_back_pain` | INT | `0` = Tidak, `1` = Ya | Mengalami nyeri punggung |
| `pain_duration` | INT | `1` = $<$ 6 minggu<br>`2` = 6-12 minggu<br>`3` = $>$ 12 minggu<br>`4` = Tidak pernah nyeri dalam 12 bulan terakhir<br>`0` = Null (Jika `has_back_pain` = 0) | Rentang waktu keluhan |
| `cause_cedera` | INT | `0` = Tidak dipilih, `1` = Dipilih | Etiologi: Cedera otot/saraf/ligamen |
| `cause_duduk_lama` | INT | `0` = Tidak dipilih, `1` = Dipilih | Etiologi: Duduk lebih dari 8 jam |
| `cause_skoliosis` | INT | `0` = Tidak dipilih, `1` = Dipilih | Etiologi: Skoliosis |
| `cause_tumor` | INT | `0` = Tidak dipilih, `1` = Dipilih | Etiologi: Tumor |
| `cause_dokter` | INT | `0` = Tidak dipilih, `1` = Dipilih | Etiologi: Diagnosis dokter |
| `cause_dokter_detail`| VARCHAR | *None* (Null-able) | Teks diagnosis spesifik dokter |
| `cause_lainnya` | INT | `0` = Tidak dipilih, `1` = Dipilih | Etiologi: Alasan lainnya |
| `cause_lainnya_detail`| VARCHAR| *None* (Null-able) | Teks alasan lainnya |
| `area_cervical` | INT | `0` = Tidak dipilih, `1` = Dipilih | Lokasi: Leher |
| `area_thoracal` | INT | `0` = Tidak dipilih, `1` = Dipilih | Lokasi: Punggung Dada |
| `area_lumbal` | INT | `0` = Tidak dipilih, `1` = Dipilih | Lokasi: Pinggang (Lower Back) |
| `action_obat_bebas` | INT | `0` = Tidak dipilih, `1` = Dipilih | Tindakan: Obat bebas mandiri |
| `action_dr_tanpa_obat`| INT | `0` = Tidak dipilih, `1` = Dipilih | Tindakan: Dokter tanpa obat |
| `action_dr_dengan_obat`| INT | `0` = Tidak dipilih, `1` = Dipilih | Tindakan: Dokter dengan obat |
| `action_pijat` | INT | `0` = Tidak dipilih, `1` = Dipilih | Tindakan: Pijat/urut tradisional |
| `action_chiro` | INT | `0` = Tidak dipilih, `1` = Dipilih | Tindakan: Terapi chiropractor |
| `action_operasi` | INT | `0` = Tidak dipilih, `1` = Dipilih | Tindakan: Tindakan operasi |
| `action_lainnya` | INT | `0` = Tidak dipilih, `1` = Dipilih | Tindakan: Lainnya |
| `action_lainnya_detail`| VARCHAR| *None* (Null-able) | Teks tindakan lainnya |
| `pain_severity` | INT | Skala `0` hingga `10` | Keparahan nyeri (Likert NRS) |
| `pain_severity_cat` | INT | `0` = Tidak Sakit (NRS 0)<br>`1` = Ringan (NRS 1-3)<br>`2` = Sedang (NRS 4-6)<br>`3` = Berat (NRS 7-10)<br>`-1` = Null (Jika `has_back_pain` = 0) | Pengelompokan Skala NRS untuk SPSS |
| `created_at` | TIMESTAMP | *None* | Waktu kirim otomatis dari sistem |

---

## 7. PERSYARATAN NON-FUNGSIONAL (NFR)

*   **Keamanan Data Medis (Data Privacy):** Karena survei mengumpulkan nama lengkap anak, nama orang tua, serta tanda tangan digital, seluruh komunikasi API harus dilindungi protokol enkripsi HTTPS (SSL). Tanda tangan digital sebaiknya diubah dari data canvas koordinat ke Base64 PNG dan disimpan di folder terproteksi di server.
*   **Akurasi Skrining:** Validasi umur (16, 17, 18) dan lama sekolah bagi siswa pindahan ($\ge$ 6 bulan atau 0.5 tahun) wajib ditangani di sisi klien (*client-side* Vue FE) untuk mencegah data sampah masuk ke basis data backend.
*   **Keandalan Ekspor:** Fitur ekspor Excel di admin view harus dipastikan bebas error saat memproses karakter tanda koma atau tanda petik di kolom teks, agar tidak merusak struktur tabel saat diimpor ke SPSS.
*   **Performa & Aksesibilitas:** Ukuran bundle Vue FE harus dioptimalkan agar kuesioner dapat dimuat dengan sangat cepat sekalipun responden membukanya menggunakan jaringan seluler 3G/4G di area sekolah.

---
*Dokumen ini dibuat secara resmi untuk mendampingi rancangan teknis Front-End (Vue.js) dan Back-End platform kuesioner skripsi Maulana Yusuf Angkasa - FKUI 2026.*
