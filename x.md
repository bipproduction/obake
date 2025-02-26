Berikut adalah rincian spesifikasi rekomendasi untuk menjalankan **DeepSeek R1 671B** secara offline dalam bentuk tabel, mencakup tiga opsi (GPU H100, CPU-Only, dan 4x RTX 4090) beserta perkiraan biaya dalam Rupiah (IDR). Harga menggunakan kurs asumsi 1 USD = Rp16.000.

---

### **Tabel Spesifikasi dan Perkiraan Biaya**

#### **Opsi 1: GPU-Based (2x NVIDIA H100 80 GB untuk 1.58-bit)**
| **Komponen**         | **Spesifikasi**                         | **Harga (IDR)**      |
|-----------------------|-----------------------------------------|----------------------|
| CPU                  | AMD Ryzen Threadripper 5975WX (32 core) | Rp45.000.000         |
| RAM                  | 512 GB DDR5 ECC (8x 64 GB, 5600 MHz)   | Rp60.000.000         |
| GPU                  | 2x NVIDIA H100 80 GB (160 GB VRAM)     | Rp1.200.000.000      |
| Storage              | 1 TB NVMe SSD (Samsung 990 Pro)        | Rp3.500.000          |
| Motherboard          | ASUS Pro WS WRX80E-SAGE SE WIFI        | Rp18.000.000         |
| PSU                  | Seasonic PRIME PX-1600 80+ Platinum    | Rp6.500.000          |
| Cooling              | ASUS ROG Ryujin III 360 AIO            | Rp4.000.000          |
| Casing               | Fractal Design Meshify 2 XL            | Rp3.000.000          |
| Sistem Operasi       | Ubuntu 22.04 LTS                       | Gratis               |
| **Total**            |                                         | **Rp1.340.000.000**  |
| **Kecepatan**        | ~140 token/detik (1.58-bit)            |                      |

**Catatan:** Ideal untuk performa maksimal, tetapi sangat mahal karena H100 adalah GPU kelas data center.

---

#### **Opsi 2: CPU-Only (Dual AMD EPYC 7313 untuk Q4_K_M)**
| **Komponen**         | **Spesifikasi**                         | **Harga (IDR)**      |
|-----------------------|-----------------------------------------|----------------------|
| CPU                  | 2x AMD EPYC 7313 (32 core total)       | Rp50.000.000         |
| RAM                  | 512 GB DDR5 ECC (8x 64 GB, 5600 MHz)   | Rp60.000.000         |
| GPU                  | Tidak diperlukan                       | Rp0                  |
| Storage              | 1 TB NVMe SSD (Samsung 990 Pro)        | Rp3.500.000          |
| Motherboard          | Supermicro H12DGO-6 (dual socket SP3)  | Rp15.000.000         |
| PSU                  | Corsair HX1200 80+ Gold                | Rp4.500.000          |
| Cooling              | 2x Noctua NH-U14S TR4-SP3              | Rp3.000.000          |
| Casing               | Supermicro CSE-745                     | Rp5.000.000          |
| Sistem Operasi       | Ubuntu 22.04 LTS                       | Gratis               |
| **Total**            |                                         | **Rp141.000.000**    |
| **Kecepatan**        | ~3-5 token/detik (Q4_K_M)              |                      |

**Catatan:** Pilihan paling hemat, cocok untuk eksperimental, tapi kecepatan rendah.

---

#### **Opsi 3: 4x RTX 4090 (Q4_K_M)**
| **Komponen**         | **Spesifikasi**                         | **Harga (IDR)**      |
|-----------------------|-----------------------------------------|----------------------|
| CPU                  | AMD Ryzen Threadripper 5975WX (32 core) | Rp45.000.000         |
| RAM                  | 256 GB DDR5 ECC (4x 64 GB, 5600 MHz)   | Rp30.000.000         |
| GPU                  | 4x NVIDIA RTX 4090 24 GB (96 GB VRAM)  | Rp160.000.000        |
| Storage              | 1 TB NVMe SSD (Samsung 990 Pro)        | Rp3.500.000          |
| Motherboard          | ASUS Pro WS WRX80E-SAGE SE WIFI        | Rp18.000.000         |
| PSU                  | 2x Seasonic PRIME PX-1000 (2000W total)| Rp10.000.000         |
| Cooling              | ASUS ROG Ryujin III 360 AIO            | Rp4.000.000          |
| Casing               | Fractal Design Meshify 2 XL            | Rp3.000.000          |
| Sistem Operasi       | Ubuntu 22.04 LTS                       | Gratis               |
| **Total**            |                                         | **Rp273.500.000**    |
| **Kecepatan**        | ~20-30 token/detik (Q4_K_M)            |                      |

**Catatan:** Kompromi antara harga dan performa, lebih realistis untuk pengguna rumahan.

---

### **Ringkasan Perbandingan**
| **Opsi**            | **Total Biaya (IDR)** | **Kecepatan**         | **Kegunaan**                  |
|---------------------|-----------------------|-----------------------|-------------------------------|
| GPU H100 (2x)       | Rp1.340.000.000       | ~140 token/detik      | Profesional/Riset            |
| CPU-Only            | Rp141.000.000         | ~3-5 token/detik      | Hobi/Eksperimental           |
| 4x RTX 4090         | Rp273.500.000         | ~20-30 token/detik    | Semi-Profesional/Enthusiast  |

---

### **Penjelasan Tambahan**
- **Harga**: Estimasi berdasarkan e-commerce Indonesia (Tokopedia, Shopee) dan distributor lokal. Harga bisa lebih murah jika membeli bekas atau lebih mahal karena pajak/impor.
- **Fleksibilitas**: Jika Anda hanya ingin menjalankan varian kecil (misalnya 70B), biaya bisa turun drastis (di bawah Rp50 juta dengan 1x RTX 3090).
- **Listrik**: Setup besar (H100/RTX 4090) konsumsi 400-1000W, pastikan daya listrik rumah mencukupi (minimal 1300W PLN).

Jika Anda ingin penyesuaian lebih lanjut (misalnya budget tertentu), beri tahu saya!