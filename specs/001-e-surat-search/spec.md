# Feature Specification: e-Surat Search

**Feature Branch**: `001-e-surat-search`  
**Created**: 2026-06-28  
**Status**: Draft  
**Input**: User description: "Build a web application called e-Surat Search"

## Clarifications

### Session 2026-06-28
- Q: Strategi Pemrosesan TF-IDF (Pra-perhitungan vs Real-time) → A: Pra-perhitungan / Diindeks (Hitung dan simpan nilai TF/IDF saat dokumen dibuat atau diubah).
- Q: Penanganan Brute-force Login → A: Kunci akun selama 5 menit setelah 5 percobaan gagal berturut-turut.
- Q: Penghapusan Kategori Dokumen → A: Cegah Penghapusan (sistem menolak hapus jika masih ada dokumen terkait).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autentikasi dan Kontrol Akses (Priority: P1)

Administrator dan Pengguna dapat masuk ke sistem menggunakan kredensial masing-masing dan mengakses fitur sesuai peran yang ditetapkan. Administrator memiliki akses ke fungsi manajemen data, sedangkan Pengguna hanya dapat mengakses fitur pencarian dan riwayat.

**Why this priority**: Autentikasi adalah gerbang utama sistem. Tanpa mekanisme login yang berfungsi, tidak ada fitur lain yang dapat diakses secara aman. Kontrol akses berbasis peran memastikan setiap aktor hanya dapat melakukan tindakan yang diizinkan.

**Independent Test**: Dapat diuji sepenuhnya dengan mencoba login sebagai Administrator dan sebagai Pengguna, memverifikasi bahwa masing-masing diarahkan ke dasbor yang sesuai, dan bahwa Pengguna tidak dapat mengakses halaman manajemen Administrator.

**Acceptance Scenarios**:

1. **Given** kredensial Administrator yang valid, **When** Administrator mengisi formulir login dan mengirimkan, **Then** sistem mengautentikasi dan mengarahkan ke dasbor Administrator.
2. **Given** kredensial Pengguna yang valid (dibuat oleh Administrator), **When** Pengguna mengisi formulir login dan mengirimkan, **Then** sistem mengautentikasi dan mengarahkan ke halaman pencarian dokumen.
3. **Given** kredensial yang salah, **When** siapa pun mencoba login, **Then** sistem menampilkan pesan kesalahan yang informatif dan tidak memberikan akses.
4. **Given** Pengguna yang sudah login, **When** Pengguna mencoba mengakses URL halaman manajemen Administrator secara langsung, **Then** sistem menolak akses dan menampilkan halaman tidak diizinkan.
5. **Given** sesi login yang sudah berakhir, **When** pengguna mencoba mengakses halaman yang memerlukan autentikasi, **Then** sistem mengarahkan pengguna kembali ke halaman login.

---

### User Story 2 - Manajemen Pengguna oleh Administrator (Priority: P2)

Administrator dapat membuat, melihat, memperbarui, dan menonaktifkan akun Pengguna agar personel yang berwenang dapat mengakses sistem pencarian.

**Why this priority**: Manajemen Pengguna adalah prasyarat agar Pengguna dapat masuk ke sistem. Administrator harus dapat menyediakan dan mengelola akun sebelum pencarian dapat digunakan oleh pihak lain.

**Independent Test**: Dapat diuji sepenuhnya dengan membuat akun Pengguna baru dari dasbor Administrator, kemudian login dengan akun tersebut, memperbarui informasinya, dan menonaktifkannya untuk memastikan akses dicabut.

**Acceptance Scenarios**:

1. **Given** Administrator yang sudah login, **When** Administrator mengisi formulir pembuatan akun Pengguna dengan informasi yang valid, **Then** akun baru terdaftar dan Pengguna dapat login dengan kredensial tersebut.
2. **Given** Administrator yang sudah login, **When** Administrator membuka daftar Pengguna, **Then** sistem menampilkan semua akun Pengguna yang terdaftar.
3. **Given** Administrator yang sudah login, **When** Administrator memperbarui informasi Pengguna yang ada, **Then** perubahan tersimpan dan tercermin di daftar Pengguna.
4. **Given** Administrator yang sudah login, **When** Administrator menonaktifkan akun Pengguna, **Then** Pengguna tersebut tidak dapat lagi login ke sistem.
5. **Given** Administrator yang sudah login, **When** Administrator menghapus akun Pengguna, **Then** akun dihapus dari sistem secara permanen.

---

### User Story 3 - Manajemen Kategori Dokumen (Priority: P3)

Administrator dapat membuat, melihat, memperbarui, dan menghapus kategori dokumen untuk mengorganisasi koleksi dokumen di dalam sistem.

**Why this priority**: Kategori dibutuhkan sebelum dokumen dapat ditambahkan dengan klasifikasi yang benar. Manajemen kategori memungkinkan organisasi dokumen yang terstruktur.

**Independent Test**: Dapat diuji dengan membuat kategori baru, memverifikasi tampilannya di daftar, memperbaruinya, dan menghapusnya.

**Acceptance Scenarios**:

1. **Given** Administrator yang sudah login, **When** Administrator membuat kategori baru dengan nama yang valid, **Then** kategori tersimpan dan muncul di daftar kategori.
2. **Given** Administrator yang sudah login, **When** Administrator membuka daftar kategori, **Then** semua kategori yang tersedia ditampilkan.
3. **Given** Administrator yang sudah login, **When** Administrator memperbarui nama atau informasi kategori, **Then** perubahan tersimpan.
4. **Given** Administrator yang sudah login, **When** Administrator menghapus kategori yang tidak lagi digunakan, **Then** kategori dihapus dari sistem.

---

### User Story 4 - Manajemen Dokumen oleh Administrator (Priority: P4)

Administrator dapat menambahkan, melihat, memperbarui, dan menghapus catatan dokumen di dalam sistem, sehingga koleksi dokumen yang dapat dicari selalu mutakhir.

**Why this priority**: Dokumen adalah data inti sistem. Tanpa dokumen yang dikelola Administrator, fitur pencarian tidak memiliki konten untuk dicari.

**Independent Test**: Dapat diuji dengan menambahkan dokumen baru, melihat detailnya, memperbaruinya, dan menghapusnya dari sistem.

**Acceptance Scenarios**:

1. **Given** Administrator yang sudah login, **When** Administrator mengisi formulir penambahan dokumen dengan judul, konten, dan kategori yang valid, **Then** dokumen tersimpan dan tersedia dalam sistem.
2. **Given** Administrator yang sudah login, **When** Administrator membuka daftar dokumen, **Then** semua dokumen yang tersimpan ditampilkan.
3. **Given** Administrator yang sudah login, **When** Administrator memilih dokumen tertentu, **Then** detail lengkap dokumen ditampilkan.
4. **Given** Administrator yang sudah login, **When** Administrator memperbarui informasi dokumen, **Then** perubahan tersimpan dan terindeks ulang untuk pencarian.
5. **Given** Administrator yang sudah login, **When** Administrator menghapus dokumen, **Then** dokumen dihapus dan tidak muncul lagi di hasil pencarian.

---

### User Story 5 - Pencarian Dokumen dengan TF-IDF (Priority: P5)

Pengguna dapat memasukkan satu atau lebih kata kunci, dan sistem memproses kueri tersebut menggunakan metode TF-IDF untuk menampilkan dokumen yang relevan secara berurutan dari skor relevansi tertinggi.

**Why this priority**: Pencarian dokumen adalah fitur inti dan tujuan utama sistem. Semua fitur lain (autentikasi, manajemen data) dibangun untuk mendukung fitur ini.

**Independent Test**: Dapat diuji dengan memasukkan kata kunci tertentu yang diketahui ada dalam dokumen tertentu, dan memverifikasi bahwa dokumen tersebut muncul di urutan teratas hasil pencarian dengan skor relevansi yang ditampilkan.

**Acceptance Scenarios**:

1. **Given** Pengguna yang sudah login dan setidaknya satu dokumen tersimpan di sistem, **When** Pengguna memasukkan kata kunci yang relevan dan mengirimkan permintaan pencarian, **Then** sistem memproses kueri menggunakan TF-IDF dan menampilkan daftar dokumen yang diurutkan berdasarkan skor relevansi secara menurun.
2. **Given** Pengguna yang sudah login, **When** Pengguna memasukkan kata kunci yang tidak cocok dengan dokumen mana pun, **Then** sistem menampilkan pesan yang menyatakan tidak ada dokumen yang ditemukan.
3. **Given** Pengguna yang sudah login, **When** hasil pencarian ditampilkan, **Then** setiap hasil menampilkan informasi dokumen dan skor relevansi yang sesuai.
4. **Given** Pengguna yang sudah login, **When** hasil pencarian ditampilkan, **Then** urutan dokumen sesuai dengan skor relevansi dari tertinggi ke terendah.
5. **Given** Pengguna yang sudah login dan telah melakukan pencarian, **When** pencarian selesai, **Then** aktivitas pencarian (kata kunci, waktu, dan hasil) disimpan secara otomatis dalam riwayat pencarian Pengguna.

---

### User Story 6 - Riwayat dan Laporan Pencarian (Priority: P6)

Pengguna dapat meninjau riwayat pencarian sebelumnya dan mengakses laporan ringkasan aktivitas pencarian mereka untuk mendapatkan wawasan tentang pola penggunaan.

**Why this priority**: Riwayat dan laporan meningkatkan nilai sistem dengan memungkinkan Pengguna melihat kembali pencarian sebelumnya tanpa harus mengetik ulang, dan memberikan transparansi penggunaan.

**Independent Test**: Dapat diuji dengan melakukan beberapa pencarian, kemudian membuka halaman riwayat untuk memverifikasi bahwa semua pencarian tercatat, dan memeriksa halaman laporan untuk melihat ringkasan.

**Acceptance Scenarios**:

1. **Given** Pengguna yang sudah login dan telah melakukan setidaknya satu pencarian, **When** Pengguna membuka halaman Riwayat Pencarian, **Then** sistem menampilkan daftar pencarian sebelumnya beserta kata kunci dan waktu pencarian.
2. **Given** Pengguna yang sudah login, **When** Pengguna memilih entri riwayat tertentu, **Then** sistem menampilkan kembali hasil pencarian yang terkait dengan entri tersebut.
3. **Given** Pengguna yang sudah login dan telah melakukan beberapa pencarian, **When** Pengguna membuka halaman Laporan Pencarian, **Then** sistem menampilkan ringkasan aktivitas pencarian, termasuk jumlah pencarian dan kata kunci yang sering digunakan.

---

### Edge Cases

- Apa yang terjadi ketika Pengguna mengirimkan kolom pencarian yang kosong?
- Bagaimana sistem menangani kata kunci yang mengandung karakter khusus atau tanda baca?
- Sistem akan menolak permintaan penghapusan kategori jika kategori tersebut masih digunakan oleh satu atau lebih dokumen.
- Sistem mengunci akun sementara selama 5 menit jika terjadi 5 kali percobaan login gagal secara berturut-turut (brute-force protection).
- Apa yang terjadi ketika seorang Pengguna yang sedang login dinonaktifkan oleh Administrator — apakah sesinya langsung berakhir?
- Apa yang terjadi ketika basis data dokumen kosong dan Pengguna mencoba melakukan pencarian?
- Bagaimana sistem menangani kata kunci yang sangat panjang atau input dengan batas karakter yang dilampaui?

## Requirements *(mandatory)*

### Functional Requirements

**Autentikasi & Akses**

- **FR-001**: Sistem HARUS menyediakan halaman login yang dapat diakses oleh Administrator dan Pengguna.
- **FR-002**: Sistem HARUS memvalidasi kredensial login terhadap data akun yang tersimpan.
- **FR-003**: Sistem HARUS memberikan akses berbasis peran — Administrator mengakses fungsi manajemen; Pengguna mengakses fitur pencarian, riwayat, dan laporan.
- **FR-004**: Sistem HARUS menolak akses ke rute yang diproteksi jika pengguna tidak terautentikasi atau tidak memiliki peran yang diperlukan.
- **FR-005**: Sistem HARUS menyediakan mekanisme logout yang mengakhiri sesi pengguna secara aman.

**Manajemen Pengguna (Administrator)**

- **FR-006**: Administrator HARUS dapat membuat akun Pengguna baru dengan nama, nama pengguna, kata sandi awal, dan peran.
- **FR-007**: Administrator HARUS dapat melihat daftar semua akun Pengguna yang terdaftar.
- **FR-008**: Administrator HARUS dapat memperbarui informasi akun Pengguna yang sudah ada.
- **FR-009**: Administrator HARUS dapat menonaktifkan akun Pengguna sehingga akun tersebut tidak dapat digunakan untuk login.
- **FR-010**: Administrator HARUS dapat menghapus akun Pengguna secara permanen dari sistem.

**Manajemen Kategori (Administrator)**

- **FR-011**: Administrator HARUS dapat membuat kategori dokumen baru dengan nama dan deskripsi opsional.
- **FR-012**: Administrator HARUS dapat melihat daftar semua kategori yang tersedia.
- **FR-013**: Administrator HARUS dapat memperbarui nama atau deskripsi kategori yang ada.
- **FR-014**: Administrator HARUS dapat menghapus kategori yang tidak lagi digunakan, dengan konfirmasi sebelum penghapusan.

**Manajemen Dokumen (Administrator)**

- **FR-015**: Administrator HARUS dapat menambahkan dokumen baru dengan setidaknya judul, konten teks, nomor surat/dokumen, tanggal, dan kategori.
- **FR-016**: Administrator HARUS dapat melihat daftar semua dokumen yang tersimpan di sistem.
- **FR-017**: Administrator HARUS dapat melihat detail lengkap dokumen individual.
- **FR-018**: Administrator HARUS dapat memperbarui informasi dokumen yang sudah ada.
- **FR-019**: Administrator HARUS dapat menghapus dokumen dari sistem, dengan konfirmasi sebelum penghapusan.

**Pencarian Dokumen (Pengguna)**

- **FR-020**: Pengguna HARUS dapat memasukkan satu atau lebih kata kunci ke dalam kolom pencarian.
- **FR-021**: Sistem HARUS memproses kueri pencarian menggunakan metode TF-IDF untuk menghitung skor relevansi antara kueri dan setiap dokumen yang tersimpan.
- **FR-022**: Sistem HARUS mengurutkan dan menampilkan hasil pencarian dalam urutan menurun berdasarkan skor relevansi TF-IDF.
- **FR-023**: Setiap hasil pencarian HARUS menampilkan informasi dokumen yang relevan (judul, nomor, tanggal, kategori) dan skor relevansinya.
- **FR-024**: Sistem HARUS menampilkan pesan yang sesuai apabila tidak ada dokumen yang cocok dengan kueri pencarian.

**Riwayat Pencarian**

- **FR-025**: Sistem HARUS secara otomatis menyimpan setiap aktivitas pencarian Pengguna, termasuk kata kunci, tanggal/waktu, dan jumlah hasil yang ditemukan.
- **FR-026**: Pengguna HARUS dapat melihat daftar riwayat pencarian pribadi mereka.
- **FR-027**: Pengguna HARUS dapat memilih entri riwayat untuk melihat kembali hasil pencarian terkait.

**Laporan Pencarian**

- **FR-028**: Sistem HARUS menyediakan halaman laporan yang menampilkan ringkasan aktivitas pencarian Pengguna (jumlah total pencarian, kata kunci yang paling sering digunakan, dan tren berdasarkan periode waktu).

### Key Entities *(include if feature involves data)*

- **Pengguna (User)**: Merepresentasikan akun yang dapat login ke sistem. Atribut utama: nama, nama pengguna (username), kata sandi (ter-hash), peran (Administrator/Pengguna), dan status aktif/nonaktif.
- **Dokumen**: Merepresentasikan catatan surat atau dokumen yang tersimpan di sistem. Atribut utama: judul, nomor surat/dokumen, konten teks, tanggal, kategori, dan metadata pembuat/pembaruan.
- **Kategori**: Merepresentasikan klasifikasi yang digunakan untuk mengorganisasi dokumen. Atribut utama: nama dan deskripsi opsional.
- **RiwayatPencarian (SearchHistory)**: Merepresentasikan catatan aktivitas pencarian yang dilakukan oleh Pengguna. Atribut utama: referensi Pengguna, kata kunci yang dicari, waktu pencarian, dan jumlah dokumen yang ditemukan.
- **HasilPencarian (SearchResult)**: Merepresentasikan dokumen yang dikembalikan oleh pencarian tertentu, beserta skor relevansi TF-IDF yang dihitung. Terhubung ke RiwayatPencarian dan Dokumen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Pengguna dapat menyelesaikan pencarian dokumen — dari memasukkan kata kunci hingga melihat hasil yang diurutkan — dalam waktu kurang dari 5 detik untuk koleksi dokumen hingga 10.000 dokumen.
- **SC-002**: Hasil pencarian diurutkan secara konsisten berdasarkan skor relevansi TF-IDF yang dihitung, yang dapat diverifikasi dengan membandingkan skor yang ditampilkan dengan urutan dokumen.
- **SC-003**: 100% aktivitas pencarian yang berhasil dicatat di riwayat pencarian Pengguna yang sesuai.
- **SC-004**: Administrator dapat menyelesaikan tugas manajemen dokumen (tambah, ubah, hapus) dalam waktu kurang dari 2 menit per dokumen.
- **SC-005**: Pengguna yang tidak terautentikasi tidak dapat mengakses halaman mana pun yang memerlukan login — semua rute terproteksi dialihkan ke halaman login.
- **SC-006**: Pengguna yang sudah login dapat mengakses kembali hasil pencarian sebelumnya dari riwayat pencarian tanpa melakukan pencarian ulang.
- **SC-007**: Antarmuka pengguna seluruhnya menggunakan Bahasa Indonesia sebagai bahasa tampilan.

## Assumptions

- Sistem diakses melalui jaringan internal organisasi (intranet) atau jaringan yang dikontrol; koneksi internet publik tidak diasumsikan.
- Setiap dokumen yang dimasukkan ke dalam sistem memiliki representasi teks yang dapat dibaca mesin (bukan gambar/scan) sehingga TF-IDF dapat diterapkan pada kontennya.
- Administrator adalah pengguna pertama yang dibuat; setidaknya satu akun Administrator ada di dalam sistem saat inisialisasi.
- Pendaftaran mandiri oleh Pengguna tidak diperbolehkan — semua akun Pengguna dibuat oleh Administrator.
- Kata sandi disimpan menggunakan mekanisme hash yang aman dan tidak disimpan dalam teks biasa.
- Sistem menggunakan pendekatan pra-perhitungan (indexing) untuk TF-IDF: nilai Term Frequency (TF) dan Inverse Document Frequency (IDF) dihitung dan disimpan di basis data setiap kali dokumen ditambahkan, diperbarui, atau dihapus. Pada saat pencarian, sistem hanya menghitung skor kecocokan akhir (seperti cosine similarity) untuk mempercepat waktu respons.
- Laporan pencarian menampilkan data untuk Pengguna yang sedang login secara individual; laporan agregat lintas pengguna tidak termasuk dalam cakupan versi pertama.
- Bahasa Indonesia digunakan untuk semua teks antarmuka pengguna, pesan kesalahan, dan label.
- Penghapusan permanen dokumen atau akun Pengguna memerlukan konfirmasi eksplisit dari Administrator.
- Sistem tidak menangani pengunggahan file fisik (PDF, Word, dll.) — konten dokumen dimasukkan sebagai teks langsung oleh Administrator melalui antarmuka.
