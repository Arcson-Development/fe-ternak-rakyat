import type { RegionRef } from "../types";

/**
 * Static Indonesia region data. Acts as a stand-in for the master-data
 * endpoint that the backend will expose. Once available, replace these
 * exports with calls to /api/region/provinsi, /api/region/kabupaten, etc.
 *
 * `getProvinsi`, `getKabupaten`, `getKecamatan`, `getKelurahan` are the
 * public entry points used by the form.
 */

type Province = { id: string; name: string; regencies: Regency[] };
type Regency = { id: string; name: string; districts: District[] };
type District = { id: string; name: string; villages: Village[] };
type Village = { id: string; name: string };

const PROVINCES: Province[] = [
  {
    id: "11",
    name: "Aceh",
    regencies: [
      {
        id: "1101",
        name: "Kab. Aceh Selatan",
        districts: [
          { id: "110101", name: "Bakongan", villages: [
            { id: "1101012001", name: "Keude Bakongan" },
            { id: "1101012002", name: "Ujong Mangki" },
            { id: "1101012003", name: "Ujong Padang" },
          ]},
          { id: "110102", name: "Kluet Utara", villages: [
            { id: "1101022001", name: "Alur Mas" },
            { id: "1101022002", name: "Kampung Tinggi" },
          ]},
        ],
      },
      {
        id: "1171",
        name: "Kota Banda Aceh",
        districts: [
          { id: "117101", name: "Banda Raya", villages: [
            { id: "1171012001", name: "Lam Ara" },
            { id: "1171012002", name: "Lam Lo" },
          ]},
        ],
      },
    ],
  },
  {
    id: "12",
    name: "Sumatera Utara",
    regencies: [
      {
        id: "1271",
        name: "Kota Medan",
        districts: [
          { id: "127101", name: "Medan Tuntungan", villages: [
            { id: "1271012001", name: "Simpang Selayang" },
            { id: "1271012002", name: "Lau Cih" },
          ]},
          { id: "127102", name: "Medan Johor", villages: [
            { id: "1271022001", name: "Pangkalan Masyhur" },
            { id: "1271022002", name: "Johor" },
          ]},
        ],
      },
    ],
  },
  {
    id: "13",
    name: "Sumatera Barat",
    regencies: [
      {
        id: "1371",
        name: "Kota Padang",
        districts: [
          { id: "137101", name: "Padang Selatan", villages: [
            { id: "1371012001", name: "Seberang Padang" },
            { id: "1371012002", name: "Pasa Gadang" },
          ]},
        ],
      },
    ],
  },
  {
    id: "14",
    name: "Riau",
    regencies: [
      {
        id: "1471",
        name: "Kota Pekanbaru",
        districts: [
          { id: "147101", name: "Sukajadi", villages: [
            { id: "1471012001", name: "Sukajadi" },
            { id: "1471012002", name: "Harjosari" },
          ]},
        ],
      },
    ],
  },
  {
    id: "15",
    name: "Jambi",
    regencies: [
      {
        id: "1571",
        name: "Kota Jambi",
        districts: [
          { id: "157101", name: "Alam Barajo", villages: [
            { id: "1571012001", name: "Bagan Pete" },
          ]},
        ],
      },
    ],
  },
  {
    id: "16",
    name: "Sumatera Selatan",
    regencies: [
      {
        id: "1671",
        name: "Kota Palembang",
        districts: [
          { id: "167101", name: "Ilir Barat I", villages: [
            { id: "1671012001", name: "Bukit Lama" },
          ]},
        ],
      },
    ],
  },
  {
    id: "17",
    name: "Bengkulu",
    regencies: [
      {
        id: "1771",
        name: "Kota Bengkulu",
        districts: [
          { id: "177101", name: "Gading Cempaka", villages: [
            { id: "1771012001", name: "Cempaka Permai" },
          ]},
        ],
      },
    ],
  },
  {
    id: "18",
    name: "Lampung",
    regencies: [
      {
        id: "1871",
        name: "Kota Bandar Lampung",
        districts: [
          { id: "187101", name: "Tanjung Karang Pusat", villages: [
            { id: "1871012001", name: "Palapa" },
          ]},
        ],
      },
    ],
  },
  {
    id: "19",
    name: "Kepulauan Bangka Belitung",
    regencies: [
      {
        id: "1971",
        name: "Kota Pangkalpinang",
        districts: [
          { id: "197101", name: "Taman Sari", villages: [
            { id: "1971012001", name: "Batin Tikal" },
          ]},
        ],
      },
    ],
  },
  {
    id: "21",
    name: "Kepulauan Riau",
    regencies: [
      {
        id: "2171",
        name: "Kota Batam",
        districts: [
          { id: "217101", name: "Batam Kota", villages: [
            { id: "2171012001", name: "Belian" },
          ]},
        ],
      },
    ],
  },
  {
    id: "31",
    name: "DKI Jakarta",
    regencies: [
      {
        id: "3171",
        name: "Kota Administrasi Jakarta Selatan",
        districts: [
          { id: "317101", name: "Kebayoran Baru", villages: [
            { id: "3171012001", name: "Selong" },
            { id: "3171012002", name: "Gunung" },
            { id: "3171012003", name: "Kramat Pela" },
          ]},
          { id: "317102", name: "Kebayoran Lama", villages: [
            { id: "3171022001", name: "Grogol Selatan" },
            { id: "3171022002", name: "Grogol Utara" },
          ]},
          { id: "317103", name: "Pesanggrahan", villages: [
            { id: "3171032001", name: "Pesanggrahan" },
            { id: "3171032002", name: "Bintaro" },
          ]},
        ],
      },
      {
        id: "3172",
        name: "Kota Administrasi Jakarta Timur",
        districts: [
          { id: "317201", name: "Cakung", villages: [
            { id: "3172012001", name: "Cakung Barat" },
            { id: "3172012002", name: "Cakung Timur" },
          ]},
          { id: "317202", name: "Duren Sawit", villages: [
            { id: "3172022001", name: "Duren Sawit" },
            { id: "3172022002", name: "Pondok Bambu" },
          ]},
        ],
      },
      {
        id: "3173",
        name: "Kota Administrasi Jakarta Barat",
        districts: [
          { id: "317301", name: "Kebon Jeruk", villages: [
            { id: "3173012001", name: "Kebon Jeruk" },
            { id: "3173012002", name: "Sukabumi Selatan" },
          ]},
        ],
      },
      {
        id: "3174",
        name: "Kota Administrasi Jakarta Pusat",
        districts: [
          { id: "317401", name: "Tanah Abang", villages: [
            { id: "3174012001", name: "Gelora" },
            { id: "3174012002", name: "Bendungan Hilir" },
          ]},
        ],
      },
      {
        id: "3175",
        name: "Kota Administrasi Jakarta Utara",
        districts: [
          { id: "317501", name: "Kelapa Gading", villages: [
            { id: "3175012001", name: "Kelapa Gading Barat" },
            { id: "3175012002", name: "Kelapa Gading Timur" },
          ]},
        ],
      },
    ],
  },
  {
    id: "32",
    name: "Jawa Barat",
    regencies: [
      {
        id: "3201",
        name: "Kab. Bogor",
        districts: [
          { id: "320101", name: "Cibinong", villages: [
            { id: "3201012001", name: "Cibinong" },
            { id: "3201012002", name: "Nirwana" },
            { id: "3201012003", name: "Pakansari" },
          ]},
          { id: "320102", name: "Gunung Putri", villages: [
            { id: "3201022001", name: "Gunung Putri" },
            { id: "3201022002", name: "Bojong Nangka" },
          ]},
        ],
      },
      {
        id: "3273",
        name: "Kota Bandung",
        districts: [
          { id: "327301", name: "Coblong", villages: [
            { id: "3273012001", name: "Cipaganti" },
            { id: "3273012002", name: "Lebakgede" },
          ]},
          { id: "327302", name: "Sukajadi", villages: [
            { id: "3273022001", name: "Sukawarna" },
            { id: "3273022002", name: "Sukagalih" },
          ]},
        ],
      },
    ],
  },
  {
    id: "33",
    name: "Jawa Tengah",
    regencies: [
      {
        id: "3374",
        name: "Kota Semarang",
        districts: [
          { id: "337401", name: "Tembalang", villages: [
            { id: "3374012001", name: "Tembalang" },
            { id: "3374012002", name: "Bulusan" },
          ]},
          { id: "337402", name: "Banyumanik", villages: [
            { id: "3374022001", name: "Srondol Wetan" },
            { id: "3374022002", name: "Pudakpayung" },
          ]},
        ],
      },
      {
        id: "3372",
        name: "Kota Surakarta",
        districts: [
          { id: "337201", name: "Banjarsari", villages: [
            { id: "3372012001", name: "Banjarsari" },
          ]},
        ],
      },
    ],
  },
  {
    id: "34",
    name: "DI Yogyakarta",
    regencies: [
      {
        id: "3471",
        name: "Kota Yogyakarta",
        districts: [
          { id: "347101", name: "Gondokusuman", villages: [
            { id: "3471012001", name: "Demangan" },
            { id: "3471012002", name: "Terban" },
          ]},
          { id: "347102", name: "Umbulharjo", villages: [
            { id: "3471022001", name: "Muja-Muju" },
            { id: "3471022002", name: "Sorosutan" },
          ]},
        ],
      },
      {
        id: "3402",
        name: "Kab. Bantul",
        districts: [
          { id: "340201", name: "Bantul", villages: [
            { id: "3402012001", name: "Bantul" },
            { id: "3402012002", name: "Sabdodadi" },
          ]},
        ],
      },
    ],
  },
  {
    id: "35",
    name: "Jawa Timur",
    regencies: [
      {
        id: "3578",
        name: "Kota Surabaya",
        districts: [
          { id: "357801", name: "Sukomanunggal", villages: [
            { id: "3578012001", name: "Sukomanunggal" },
            { id: "3578012002", name: "Putat Gede" },
          ]},
          { id: "357802", name: "Rungkut", villages: [
            { id: "3578022001", name: "Rungkut Kidul" },
            { id: "3578022002", name: "Kalirungkut" },
          ]},
        ],
      },
      {
        id: "3573",
        name: "Kota Malang",
        districts: [
          { id: "357301", name: "Lowokwaru", villages: [
            { id: "3573012001", name: "Lowokwaru" },
          ]},
        ],
      },
    ],
  },
  {
    id: "36",
    name: "Banten",
    regencies: [
      {
        id: "3671",
        name: "Kota Tangerang",
        districts: [
          { id: "367101", name: "Cipondoh", villages: [
            { id: "3671012001", name: "Cipondoh" },
            { id: "3671012002", name: "Cipondoh Makmur" },
          ]},
        ],
      },
      {
        id: "3674",
        name: "Kota Tangerang Selatan",
        districts: [
          { id: "367401", name: "Serpong", villages: [
            { id: "3674012001", name: "Serpong" },
            { id: "3674012002", name: "Lengkong Wetan" },
          ]},
        ],
      },
    ],
  },
  {
    id: "51",
    name: "Bali",
    regencies: [
      {
        id: "5171",
        name: "Kota Denpasar",
        districts: [
          { id: "517101", name: "Denpasar Selatan", villages: [
            { id: "5171012001", name: "Sanur Kaja" },
            { id: "5171012002", name: "Sanur Kauh" },
          ]},
          { id: "517102", name: "Denpasar Barat", villages: [
            { id: "5171022001", name: "Kerobokan Kelod" },
          ]},
        ],
      },
    ],
  },
  {
    id: "52",
    name: "Nusa Tenggara Barat",
    regencies: [
      {
        id: "5271",
        name: "Kota Mataram",
        districts: [
          { id: "527101", name: "Mataram", villages: [
            { id: "5271012001", name: "Mataram Barat" },
          ]},
        ],
      },
    ],
  },
  {
    id: "53",
    name: "Nusa Tenggara Timur",
    regencies: [
      {
        id: "5371",
        name: "Kota Kupang",
        districts: [
          { id: "537101", name: "Kupang Kota", villages: [
            { id: "5371012001", name: "Oebobo" },
          ]},
        ],
      },
    ],
  },
  {
    id: "61",
    name: "Kalimantan Barat",
    regencies: [
      {
        id: "6171",
        name: "Kota Pontianak",
        districts: [
          { id: "617101", name: "Pontianak Kota", villages: [
            { id: "6171012001", name: "Mariana" },
          ]},
        ],
      },
    ],
  },
  {
    id: "62",
    name: "Kalimantan Tengah",
    regencies: [
      {
        id: "6271",
        name: "Kota Palangkaraya",
        districts: [
          { id: "627101", name: "Pahandut", villages: [
            { id: "6271012001", name: "Pahandut" },
          ]},
        ],
      },
    ],
  },
  {
    id: "63",
    name: "Kalimantan Selatan",
    regencies: [
      {
        id: "6371",
        name: "Kota Banjarmasin",
        districts: [
          { id: "637101", name: "Banjarmasin Tengah", villages: [
            { id: "6371012001", name: "Kertak Baru Ilir" },
          ]},
        ],
      },
    ],
  },
  {
    id: "64",
    name: "Kalimantan Timur",
    regencies: [
      {
        id: "6471",
        name: "Kota Balikpapan",
        districts: [
          { id: "647101", name: "Balikpapan Kota", villages: [
            { id: "6471012001", name: "Klandasan Ilir" },
          ]},
        ],
      },
    ],
  },
  {
    id: "65",
    name: "Kalimantan Utara",
    regencies: [
      {
        id: "6571",
        name: "Kota Tarakan",
        districts: [
          { id: "657101", name: "Tarakan Barat", villages: [
            { id: "6571012001", name: "Karang Anyar" },
          ]},
        ],
      },
    ],
  },
  {
    id: "71",
    name: "Sulawesi Utara",
    regencies: [
      {
        id: "7171",
        name: "Kota Manado",
        districts: [
          { id: "717101", name: "Wenang", villages: [
            { id: "7171012001", name: "Wenang Selatan" },
          ]},
        ],
      },
    ],
  },
  {
    id: "72",
    name: "Sulawesi Tengah",
    regencies: [
      {
        id: "7271",
        name: "Kota Palu",
        districts: [
          { id: "727101", name: "Palu Barat", villages: [
            { id: "7271012001", name: "Lere" },
          ]},
        ],
      },
    ],
  },
  {
    id: "73",
    name: "Sulawesi Selatan",
    regencies: [
      {
        id: "7371",
        name: "Kota Makassar",
        districts: [
          { id: "737101", name: "Makassar", villages: [
            { id: "7371012001", name: "Losari" },
            { id: "7371012002", name: "Maloku" },
          ]},
          { id: "737102", name: "Tamalate", villages: [
            { id: "7371022001", name: "Mangasa" },
          ]},
        ],
      },
    ],
  },
  {
    id: "74",
    name: "Sulawesi Tenggara",
    regencies: [
      {
        id: "7471",
        name: "Kota Kendari",
        districts: [
          { id: "747101", name: "Kendari", villages: [
            { id: "7471012001", name: "Mandonga" },
          ]},
        ],
      },
    ],
  },
  {
    id: "75",
    name: "Gorontalo",
    regencies: [
      {
        id: "7571",
        name: "Kota Gorontalo",
        districts: [
          { id: "757101", name: "Kota Barat", villages: [
            { id: "7571012001", name: "Dembe" },
          ]},
        ],
      },
    ],
  },
  {
    id: "76",
    name: "Sulawesi Barat",
    regencies: [
      {
        id: "7671",
        name: "Kota Mamuju",
        districts: [
          { id: "767101", name: "Mamuju", villages: [
            { id: "7671012001", name: "Mamuju" },
          ]},
        ],
      },
    ],
  },
  {
    id: "81",
    name: "Maluku",
    regencies: [
      {
        id: "8171",
        name: "Kota Ambon",
        districts: [
          { id: "817101", name: "Sirimau", villages: [
            { id: "8171012001", name: "Amantelu" },
          ]},
        ],
      },
    ],
  },
  {
    id: "82",
    name: "Maluku Utara",
    regencies: [
      {
        id: "8271",
        name: "Kota Ternate",
        districts: [
          { id: "827101", name: "Ternate Tengah", villages: [
            { id: "8271012001", name: "Kota Baru" },
          ]},
        ],
      },
    ],
  },
  {
    id: "91",
    name: "Papua",
    regencies: [
      {
        id: "9171",
        name: "Kota Jayapura",
        districts: [
          { id: "917101", name: "Jayapura Utara", villages: [
            { id: "9171012001", name: "Tanjung Ria" },
          ]},
        ],
      },
    ],
  },
  {
    id: "92",
    name: "Papua Barat",
    regencies: [
      {
        id: "9271",
        name: "Kota Sorong",
        districts: [
          { id: "927101", name: "Sorong", villages: [
            { id: "9271012001", name: "Remu" },
          ]},
        ],
      },
    ],
  },
  {
    id: "93",
    name: "Papua Selatan",
    regencies: [
      {
        id: "9371",
        name: "Kab. Merauke",
        districts: [
          { id: "937101", name: "Merauke", villages: [
            { id: "9371012001", name: "Mandala" },
          ]},
        ],
      },
    ],
  },
  {
    id: "94",
    name: "Papua Tengah",
    regencies: [
      {
        id: "9471",
        name: "Kab. Nabire",
        districts: [
          { id: "947101", name: "Nabire", villages: [
            { id: "9471012001", name: "Karang Mulia" },
          ]},
        ],
      },
    ],
  },
  {
    id: "95",
    name: "Papua Pegunungan",
    regencies: [
      {
        id: "9571",
        name: "Kab. Jayawijaya",
        districts: [
          { id: "957101", name: "Wamena", villages: [
            { id: "9571012001", name: "Wamena Kota" },
          ]},
        ],
      },
    ],
  },
  {
    id: "96",
    name: "Papua Barat Daya",
    regencies: [
      {
        id: "9671",
        name: "Kota Sorong",
        districts: [
          { id: "967101", name: "Sorong Barat", villages: [
            { id: "9671012001", name: "Klasaman" },
          ]},
        ],
      },
    ],
  },
];

// ---------- public API ----------

export function getProvinsi(): RegionRef[] {
  return PROVINCES.map(({ id, name }) => ({ id, name }));
}

export function getKabupaten(provinsiId: string | null): RegionRef[] {
  if (!provinsiId) return [];
  const p = PROVINCES.find((x) => x.id === provinsiId);
  if (!p) return [];
  return p.regencies.map(({ id, name }) => ({ id, name }));
}

export function getKecamatan(
  provinsiId: string | null,
  kabupatenId: string | null
): RegionRef[] {
  if (!provinsiId || !kabupatenId) return [];
  const p = PROVINCES.find((x) => x.id === provinsiId);
  const r = p?.regencies.find((x) => x.id === kabupatenId);
  if (!r) return [];
  return r.districts.map(({ id, name }) => ({ id, name }));
}

export function getKelurahan(
  provinsiId: string | null,
  kabupatenId: string | null,
  kecamatanId: string | null
): RegionRef[] {
  if (!provinsiId || !kabupatenId || !kecamatanId) return [];
  const p = PROVINCES.find((x) => x.id === provinsiId);
  const r = p?.regencies.find((x) => x.id === kabupatenId);
  const d = r?.districts.find((x) => x.id === kecamatanId);
  if (!d) return [];
  return d.villages.map(({ id, name }) => ({ id, name }));
}
