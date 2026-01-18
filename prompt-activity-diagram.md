# Prompt untuk Claude: Activity Diagram POS UMKM

Saya membutuhkan 6 diagram activity untuk sistem POS UMKM dengan format Mermaid. Gunakan swimlanes untuk memisahkan role dan komponen sistem.

**Sistem ini memiliki:**
- Role: Admin dan Kasir
- Fitur Admin: Kelola Produk, Kelola Kategori, Kelola Stok, Kelola User, Lihat Laporan, Lihat Transaksi
- Fitur Kasir: Transaksi Penjualan, Lihat Produk, Riwayat Transaksi
- Fitur Umum: Login, Ubah Password, Lihat Profile

**Buatkan 6 diagram activity berikut:**

## 1. Proses Login & Autentikasi
- Swimlanes: User | Sistem | Database
- Flow: Input kredensial → Validasi → Query database → Cek role → Redirect berdasarkan role
- Include error handling: kredensial salah, user tidak ditemukan

## 2. Proses Transaksi Penjualan (Kasir)
- Swimlanes: Kasir | Sistem | Database | Customer
- Flow: Pilih produk → Cek stok di database → Tambah ke keranjang → Input pembayaran → Validasi → Simpan transaksi ke database → Update stok di database → Cetak struk
- Include error handling: stok habis, pembayaran kurang

## 3. Proses Kelola Produk (Admin)
- Swimlanes: Admin | Sistem | Database
- Flow: Tambah/Edit/Hapus produk → Validasi data → Query kategori dari database → Simpan/Update/Delete di database → Konfirmasi
- Include: Pilih kategori, upload gambar (optional)
- Include error handling: validasi gagal, produk sudah ada

## 4. Proses Kelola Stok (Admin)
- Swimlanes: Admin | Sistem | Database
- Flow: Lihat daftar stok → Query produk dari database → Pilih produk → Input jumlah stok baru → Validasi → Update stok di database → Konfirmasi
- Include error handling: stok negatif, produk tidak ditemukan

## 5. Proses Kelola User (Admin)
- Swimlanes: Admin | Sistem | Database
- Flow: Tambah/Edit/Hapus user → Validasi data → Cek username di database → Set role (Admin/Kasir) → Simpan/Update/Delete di database → Konfirmasi
- Include error handling: username sudah ada, validasi gagal

## 6. Proses Generate Laporan (Admin)
- Swimlanes: Admin | Sistem | Database
- Flow: Pilih jenis laporan (penjualan/stok/user) → Pilih periode → Query data dari database → Agregasi data → Tampilkan laporan → Export (optional)
- Include: Filter berdasarkan tanggal, kategori, atau kasir

---

**Requirements:**
- Gunakan syntax Mermaid yang valid untuk activity diagram
- Sertakan decision nodes (diamond) untuk validasi dan kondisi
- Tambahkan error handling yang realistis
- Gunakan swimlanes untuk memisahkan tanggung jawab setiap komponen
- Tunjukkan interaksi dengan database secara eksplisit (SELECT, INSERT, UPDATE, DELETE)
- Buat flow yang realistis untuk sistem POS

**Format Output untuk setiap diagram:**
1. Judul diagram
2. Kode Mermaid lengkap dengan swimlanes
3. Penjelasan singkat alur proses (3-5 poin)

Mulai dari diagram pertama.
