# Maklor vici! — UMKM Macaroni Mentai Landing Page

Website satu halaman dengan katalog menu, filter kategori, keranjang belanja, hitung subtotal otomatis, dan checkout WhatsApp.

## Menjalankan
1. Ekstrak ZIP.
2. Buka folder `maklor vici-website` di VS Code.
3. Buka `index.html` di browser, atau gunakan extension Live Server.

## WAJIB disesuaikan sebelum dipublikasikan
Buka `script.js` lalu:
- Ganti `WHATSAPP_NUMBER` dengan nomor WhatsApp bisnis format internasional tanpa `+`, spasi, atau tanda hubung. Contoh format: `62812...`.
- Ganti `INSTAGRAM_URL` dan `TIKTOK_URL` ke akun resmi bisnis.
- Edit array `PRODUCTS`: nama, deskripsi, kategori, harga (angka rupiah), tag, dan foto.
- Foto saat ini adalah foto ilustrasi dari Unsplash, bukan foto produk UMKM yang terverifikasi. Ganti dengan foto produk sendiri untuk hasil paling akurat.

## Catatan
- Website ini tidak memproses pembayaran online. Checkout membuka WhatsApp dengan ringkasan pesanan.
- Subtotal tidak termasuk ongkir; konfirmasi ongkir dilakukan oleh admin.
- Belum ada database, panel admin, atau penyimpanan keranjang permanen.
- Nama Mentaiko! hanyalah konsep awal. Periksa ketersediaan merek dan username sebelum penggunaan komersial.
- Hosting statis dapat memakai GitHub Pages, Netlify, atau Vercel.
