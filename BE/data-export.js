const XLSX = require('xlsx');

/**
 * Converts database records into a buffer representing an XLSX Excel spreadsheet.
 * Columns match the PRD's Data Dictionary exactly.
 * @param {Array} rows - array of database records
 * @returns {Buffer} - XLSX file buffer
 */
function exportResponsesToExcel(rows) {
  // Map database rows to output spreadsheet format
  const mappedRows = rows.map(row => {
    return {
      "ID Responden": row.id,
      "Nama Orang Tua / Wali": row.parent_name,
      "Nama Anak (Ortu)": row.parent_student_name,
      "Tanda Tangan Orang Tua (Base64)": row.parent_signature ? row.parent_signature.substring(0, 100) + '... [TRUNCATED]' : '',
      "Nama Lengkap Siswa": row.student_name,
      "Tanda Tangan Siswa (Base64)": row.student_signature ? row.student_signature.substring(0, 100) + '... [TRUNCATED]' : '',
      "Jenis Kelamin (Gender)": row.gender, // 1 = Laki-laki, 2 = Perempuan
      "Umur (Age)": row.age,
      "Nama Sekolah (School)": row.school,
      "Siswa Pindahan (Is Transfer)": row.is_transfer, // 0 = Tidak, 1 = Ya
      "Lama Sekolah Pindahan (Transfer Duration)": row.transfer_duration,
      "Tingkat Kelas (Class Grade)": row.class_grade, // 1 = Kelas 10, 2 = Kelas 11, 3 = Kelas 12
      "Mengalami Nyeri Punggung (Has Back Pain)": row.has_back_pain, // 0 = Tidak, 1 = Ya
      "Rentang Waktu Keluhan (Pain Duration)": row.pain_duration, // 1, 2, 3, 4, 0/Null
      "Etiologi: Cedera Otot/Saraf (Cause Cedera)": row.cause_cedera,
      "Etiologi: Duduk >8 Jam (Cause Duduk Lama)": row.cause_duduk_lama,
      "Etiologi: Skoliosis (Cause Skoliosis)": row.cause_skoliosis,
      "Etiologi: Tumor (Cause Tumor)": row.cause_tumor,
      "Etiologi: Diagnosis Dokter (Cause Dokter)": row.cause_dokter,
      "Etiologi: Detil Diagnosis Dokter (Cause Dokter Detail)": row.cause_dokter_detail || '',
      "Etiologi: Alasan Lainnya (Cause Lainnya)": row.cause_lainnya,
      "Etiologi: Detil Alasan Lainnya (Cause Lainnya Detail)": row.cause_lainnya_detail || '',
      "Lokasi Nyeri: Leher (Area Cervical)": row.area_cervical,
      "Lokasi Nyeri: Punggung Dada (Area Thoracal)": row.area_thoracal,
      "Lokasi Nyeri: Pinggang (Area Lumbal)": row.area_lumbal,
      "Tindakan: Obat Bebas Mandiri (Action Obat Bebas)": row.action_obat_bebas,
      "Tindakan: Dokter Tanpa Obat (Action Dr Tanpa Obat)": row.action_dr_tanpa_obat,
      "Tindakan: Dokter Dengan Obat (Action Dr Dengan Obat)": row.action_dr_dengan_obat,
      "Tindakan: Pijat Tradisional (Action Pijat)": row.action_pijat,
      "Tindakan: Terapi Chiropractor (Action Chiro)": row.action_chiro,
      "Tindakan: Tindakan Operasi (Action Operasi)": row.action_operasi,
      "Tindakan: Lainnya (Action Lainnya)": row.action_lainnya,
      "Tindakan: Detil Tindakan Lainnya (Action Lainnya Detail)": row.action_lainnya_detail || '',
      "Skala Nyeri NRS (Pain Severity)": row.pain_severity, // 0 to 10
      "Kategori Skala NRS SPSS (Pain Severity Cat)": row.pain_severity_cat, // 0 = Tidak Sakit, 1 = Ringan, 2 = Sedang, 3 = Berat, -1
      "Lolos Skrining (Is Eligible)": row.is_eligible, // 1 = Ya, 0 = Tidak
      "Waktu Pengisian (Created At)": row.created_at
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(mappedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Responden SPSS");

  // Generate buffer
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = {
  exportResponsesToExcel
};
