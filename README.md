# Dokumentasi Fitur yang Dihasilkan Cron Service - Klasifikasi Tipe Pelajar

## Kategori Fitur

Fitur-fitur dibagi menjadi 4 kategori utama:

1. **Speed (Kecepatan)** - 4 fitur
2. **Consistency (Konsistensi)** - 3 fitur
3. **Review & Perfeksionisme** - 4 fitur
4. **Performa (Kinerja)** - 3 fitur

---

## SPEED (Kecepatan Belajar)

### 1. Completion Rate

**Kolom Database:** `completion_rate`

**Rumus:**
$$\text{Completion Rate} = \frac{\text{Total Journey Completed}}{\text{Total Journey Started}}$$

**Deskripsi:**
Mengukur proporsi journey yang berhasil diselesaikan dibandingkan dengan jumlah journey yang dimulai. Fitur ini menunjukkan seberapa banyak pelajar menyelesaikan materi pembelajaran yang telah mereka mulai. Nilai tinggi menunjukkan pelajar yang konsisten menyelesaikan apa yang dimulai.

**Range:** 0 - 1 (0% - 100%)

---

### 2. Study Duration Ratio

**Kolom Database:** `study_duration_ratio`

**Rumus:**
$$\text{Study Duration Ratio} = \frac{\text{Actual Study Duration}}{\text{Recommended Hours to Study}}$$

**Deskripsi:**
Mengukur perbandingan antara waktu belajar aktual yang dihabiskan pelajar dibandingkan dengan waktu yang direkomendasikan untuk setiap journey. Fitur ini menunjukkan efisiensi pelajar dalam memanfaatkan waktu belajar mereka. Nilai > 1 berarti pelajar menghabiskan lebih banyak waktu dari rekomendasi.

**Range:** 0 - ∞ (dapat melebihi 1)

---

### 3. Average Completion Time per Tutorial

**Kolom Database:** `avg_completion_time_per_tutorial`

**Rumus:**
$$\text{Avg Completion Time} = \frac{\sum(\text{Time to Complete Each Tutorial})}{\text{Number of Completed Tutorials}}$$

**Deskripsi:**
Rata-rata waktu (dalam jam) yang diperlukan pelajar untuk menyelesaikan satu tutorial. Fitur ini mengukur kecepatan pelajar dalam memproses materi pembelajaran. Waktu yang lebih singkat menunjukkan pelajar yang lebih cepat menguasai konsep.

**Range:** 0 - ∞ (dalam jam)

---

### 4. Active Days Percentage

**Kolom Database:** `active_days_percentage`

**Rumus:**
$$\text{Active Days Percentage} = \frac{\text{Unique Days with Activity}}{\text{Total Days from First to Last Activity}}$$

**Deskripsi:**
Mengukur seberapa konsisten pelajar aktif dalam belajar. Fitur ini menunjukkan persentase hari di mana pelajar melakukan aktivitas pembelajaran dari total hari yang tersedia dalam periode pembelajaran mereka. Nilai tinggi menunjukkan aktivitas yang tersebar merata.

**Range:** 0 - 1 (0% - 100%)

---

## CONSISTENCY (Konsistensi Belajar)

### 5. Learning Frequency per Week

**Kolom Database:** `learning_frequency_per_week`

**Rumus:**
$$\text{Learning Frequency} = \frac{\text{Unique Days with Activity}}{\text{Number of Weeks}}$$

**Deskripsi:**
Mengukur rata-rata hari aktivitas pembelajaran per minggu. Fitur ini menunjukkan seberapa sering pelajar terlibat dalam pembelajaran dalam periode mingguan. Nilai yang tinggi menunjukkan kebiasaan belajar yang konsisten dan teratur.

**Range:** 0 - 7 (hari per minggu)

---

### 6. Average Enrolling Times

**Kolom Database:** `avg_enrolling_times`

**Rumus:**
$$\text{Avg Enrolling Times} = \frac{\text{Total Times Enrolled in Journey}}{\text{Number of Completed Journeys}}$$

**Deskripsi:**
Mengukur rata-rata berapa kali pelajar perlu mendaftar ulang sebelum menyelesaikan satu journey. Fitur ini menunjukkan penentuan pelajar dalam mencapai tujuan pembelajaran mereka. Nilai yang rendah menunjukkan pelajar yang fokus dan tidak mudah menyerah.

**Range:** 0 - ∞

---

### 7. Total Study Days

**Kolom Database:** `total_study_days`

**Rumus:**
$$\text{Total Study Days} = \text{Count of Unique Dates with Activity}$$

**Deskripsi:**
Total jumlah hari unik di mana pelajar melakukan aktivitas pembelajaran. Fitur ini menunjukkan besarnya durasi keterlibatan pelajar dalam sistem pembelajaran secara keseluruhan, tanpa memperhitungkan intensitas aktivitas pada setiap hari.

**Range:** 0 - ∞ (dalam hari)

---

## REVIEW & PERFEKSIONISME

### 8. Revisit Rate

**Kolom Database:** `revisit_rate`

**Rumus:**
$$\text{Revisit Rate} = \frac{\text{Number of Tutorials Revisited After Completion}}{\text{Total Completed Tutorials}}$$

**Deskripsi:**
Mengukur proporsi tutorial yang dikunjungi kembali oleh pelajar setelah mereka menyelesaikannya. Fitur ini menunjukkan kecenderungan pelajar untuk mereview materi yang telah dikuasai. Nilai tinggi menunjukkan pelajar yang perfeksionalis atau ingin memperdalam pemahaman.

**Range:** 0 - 1 (0% - 100%)

---

### 9. Revision Rate

**Kolom Database:** `revision_rate`

**Rumus:**
$$\text{Revision Rate} = \frac{\text{Number of Revised Quizzes}}{\text{Total Unique Quizzes Submitted}}$$

**Deskripsi:**
Mengukur proporsi quiz yang direvisi atau diajukan ulang oleh pelajar. Fitur ini menunjukkan tingkat kehati-hatian atau perfeksionisme pelajar dalam mengevaluasi diri mereka sendiri. Nilai tinggi menunjukkan pelajar yang ingin meningkatkan skor atau hasil sebelumnya.

**Range:** 0 - 1 (0% - 100%)

---

### 10. Average Submission Rating

**Kolom Database:** `avg_submission_rating`

**Rumus:**
$$\text{Avg Submission Rating} = \frac{\sum(\text{Rating dari Setiap Submission})}{\text{Number of Rated Submissions}}$$

**Deskripsi:**
Rata-rata rating/nilai dari setiap submission/pengerjaan yang dibuat pelajar. Fitur ini menunjukkan kualitas rata-rata submission pelajar. Rating yang lebih tinggi menunjukkan submission berkualitas tinggi dan pemahaman yang baik.

**Range:** 0 - 5 (atau skala rating yang digunakan)

---

### 11. Quiz Retake Rate

**Kolom Database:** `quiz_retake_rate`

**Rumus:**
$$\text{Quiz Retake Rate} = \frac{\text{Number of Retaken Exams}}{\text{Total Unique Exam Tutorials}}$$

**Deskripsi:**
Mengukur proporsi exam/kuis yang diulang atau diambil kembali oleh pelajar. Fitur ini menunjukkan kegigihan pelajar dalam meningkatkan hasil exam mereka. Nilai tinggi menunjukkan pelajar yang tidak puas dengan hasil awal dan berusaha meningkatkannya.

**Range:** 0 - 1 (0% - 100%)

---

## PERFORMA (Kinerja Akademik)

### 12. Average Exam Score

**Kolom Database:** `avg_exam_score`

**Rumus:**
$$\text{Avg Exam Score} = \frac{\sum(\text{Semua Skor Exam})}{\text{Total Exam Diambil}}$$

**Deskripsi:**
Rata-rata skor yang diperoleh pelajar dari semua exam yang diambil. Fitur ini menunjukkan tingkat penguasaan materi pelajaran secara keseluruhan. Skor yang lebih tinggi menunjukkan pemahaman yang lebih baik terhadap materi pembelajaran.

**Range:** 0 - 100 (atau skala skor maksimal yang digunakan)

---

### 13. Exam Pass Rate

**Kolom Database:** `exam_pass_rate`

**Rumus:**
$$\text{Exam Pass Rate} = \frac{\text{Number of Passed Exams}}{\text{Total Exams Taken}}$$

**Deskripsi:**
Mengukur proporsi exam yang berhasil dilewati/lulus oleh pelajar. Fitur ini menunjukkan keberhasilan pelajar dalam mencapai standar kelulusan yang telah ditetapkan. Nilai tinggi menunjukkan pelajar yang konsisten berhasil mencapai target pembelajaran.

**Range:** 0 - 1 (0% - 100%)

---

### 14. Total Submissions

**Kolom Database:** `total_submissions`

**Rumus:**
$$\text{Total Submissions} = \text{Count of All Submissions/Pengerjaan}$$

**Deskripsi:**
Total jumlah submission/pengerjaan yang telah dibuat pelajar. Fitur ini menunjukkan tingkat keterlibatan pelajar dalam menyelesaikan tugas-tugas pembelajaran. Jumlah submission yang lebih banyak menunjukkan pelajar yang aktif dan engaged dalam proses pembelajaran.

**Range:** 0 - ∞ (jumlah submission)

---

## Metadata Fitur

### Features Filled Count

**Kolom Database:** `features_filled_count`

Menghitung berapa banyak dari 14 fitur utama yang memiliki nilai valid (bukan null, bukan 0). Ini membantu mengetahui kelengkapan data profil pelajar.

### Computation Duration

**Kolom Database:** `computation_duration_ms`

Waktu yang diperlukan untuk menghitung semua fitur (dalam milidetik). Digunakan untuk monitoring performa sistem.

### Has Sufficient Data

**Kolom Database:** `has_sufficient_data`

Flag boolean yang menunjukkan apakah pelajar memiliki data minimal untuk perhitungan fitur (minimal 1 journey yang diselesaikan). (t/f)

---
