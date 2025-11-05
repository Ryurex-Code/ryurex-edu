# Category Images Guide

## 📁 Upload Gambar Kategori di Folder Ini

Silakan upload gambar/SVG untuk setiap kategori dengan nama file yang sesuai:

### ✅ Nama File yang Dibutuhkan:

1. `emotion.svg` - Kategori Emotion 😊
2. `family.svg` - Kategori Family 👨‍👩‍👧‍👦
3. `food.svg` - Kategori Food 🍕
4. `action.svg` - Kategori Action 🏃
5. `nature.svg` - Kategori Nature 🌳
6. `animal.svg` - Kategori Animal 🐶
7. `color.svg` - Kategori Color 🎨
8. `body.svg` - Kategori Body 👤
9. `time.svg` - Kategori Time ⏰
10. `place.svg` - Kategori Place 🏠
11. `object.svg` - Kategori Object 📦

### 📐 Spesifikasi Gambar:

- **Format**: SVG (recommended) atau PNG/JPG
- **Aspect Ratio**: 1:1 (square/persegi)
- **Ukuran**: Min. 300x300px (untuk kualitas optimal)
- **Style**: Ilustrasi minimalis, flat design
- **Warna**: Sesuaikan dengan theme (yellow #fee801 atau purple #7c5cff)

### 🎨 Desain Card:

```
┌─────────────────────┐
│                     │
│     [IMAGE]         │ ← Gambar mengisi area ini
│                     │   (rounded top corners)
├─────────────────────┤
│   Category Name     │
│   10 words          │
│   [▶ Play]          │
└─────────────────────┘
```

### 📝 Cara Mengaktifkan Gambar:

Setelah upload gambar, edit file `app/dashboard/page.tsx`:

**Hapus/comment bagian ini:**
```tsx
<div className="text-6xl">{category.icon}</div>
```

**Uncomment bagian ini:**
```tsx
<Image 
  src={`/images/categories/${category.name.toLowerCase()}.svg`}
  alt={category.name}
  fill
  className="object-cover"
/>
```

**Jangan lupa import Image dari Next.js di bagian atas:**
```tsx
import Image from 'next/image';
```

### 🔥 Background Gradient

Saat ini ada gradient placeholder:
- `from-[#fee801]/20` (kuning transparan)
- `to-[#7c5cff]/20` (ungu transparan)

Jika gambar sudah ada, gradient ini akan tertutup oleh gambar.

---

**Status**: 📸 Menunggu upload gambar kategori
