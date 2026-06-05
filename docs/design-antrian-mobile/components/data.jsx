// Sample data for the antrian sidang prototype.
// Mocks the API contract from the PRD.

const PERKARA_DB = [
  {
    nomor: "1234/Pdt.G/2026/PA.Pnj",
    para_pihak: "Ahmad Surya bin Rahmat — Siti Nurhaliza binti Yusuf",
    jenis: "Cerai Gugat",
    nik_valid: ["3201234567890001", "3201234567890002"],
  },
  {
    nomor: "1235/Pdt.G/2026/PA.Pnj",
    para_pihak: "Budi Hartono — Rini Astuti",
    jenis: "Cerai Talak",
    nik_valid: ["3201234567890003"],
  },
  {
    nomor: "0089/Pdt.P/2026/PA.Pnj",
    para_pihak: "Pemohon: Rahmat Hidayat",
    jenis: "Itsbat Nikah",
    nik_valid: ["3201234567890004"],
  },
];

const SCHEDULE = [
  {
    qn: "S-012", nomor_perkara: "0078/Pdt.G/2026/PA.Pnj", jenis: "Cerai Gugat",
    pihak: "Hendra Wijaya", lawan: "Maya Lestari",
    waktu: "08:30", ruang: "Ruang 1",
    agenda: "Pembacaan Putusan",
    status: "done",
  },
  {
    qn: "S-013", nomor_perkara: "0082/Pdt.G/2026/PA.Pnj", jenis: "Harta Bersama",
    pihak: "Tomy Saputra", lawan: "Lina Kusuma",
    waktu: "09:00", ruang: "Ruang 2",
    agenda: "Mediasi Tahap II",
    status: "done",
  },
  {
    qn: "S-014", nomor_perkara: "0091/Pdt.G/2026/PA.Pnj", jenis: "Cerai Talak",
    pihak: "Andre Pratama", lawan: "Dewi Sartika",
    waktu: "09:30", ruang: "Ruang 1",
    agenda: "Pemeriksaan Saksi",
    status: "live",
  },
  {
    qn: "S-015", nomor_perkara: "0094/Pdt.P/2026/PA.Pnj", jenis: "Itsbat Nikah",
    pihak: "Pemohon: Joko Riyadi",
    waktu: "10:00", ruang: "Ruang 3",
    agenda: "Pembuktian",
    status: "scheduled",
  },
  {
    qn: "S-016", nomor_perkara: "0099/Pdt.G/2026/PA.Pnj", jenis: "Cerai Gugat",
    pihak: "Sari Indah", lawan: "Bayu Anggara",
    waktu: "10:30", ruang: "Ruang 2",
    agenda: "Replik",
    status: "delayed",
  },
  {
    qn: "S-017", nomor_perkara: "0102/Pdt.G/2026/PA.Pnj", jenis: "Cerai Gugat",
    pihak: "Yusuf Maulana", lawan: "Aulia Rahmah",
    waktu: "11:00", ruang: "Ruang 1",
    agenda: "Jawaban Tergugat",
    status: "scheduled",
  },
  {
    qn: "S-018", nomor_perkara: "0107/Pdt.G/2026/PA.Pnj", jenis: "Waris",
    pihak: "Slamet Riyadi", lawan: "Pengadilan",
    waktu: "13:00", ruang: "Ruang 3",
    agenda: "Sidang Perdana",
    status: "scheduled",
  },
  {
    qn: "S-019", nomor_perkara: "0112/Pdt.G/2026/PA.Pnj", jenis: "Cerai Talak",
    pihak: "Hari Setiawan", lawan: "Nina Permata",
    waktu: "13:30", ruang: "Ruang 2",
    agenda: "Kesimpulan",
    status: "scheduled",
  },
  {
    qn: "S-020", nomor_perkara: "0115/Pdt.P/2026/PA.Pnj", jenis: "Wali Adhal",
    pihak: "Pemohon: Putri Ayu",
    waktu: "14:00", ruang: "Ruang 1",
    agenda: "Pemeriksaan Saksi",
    status: "scheduled",
  },
];

const SLOTS = [
  { time: "08:00", capacity: 8, booked: 8 },
  { time: "08:30", capacity: 8, booked: 8 },
  { time: "09:00", capacity: 8, booked: 7 },
  { time: "09:30", capacity: 8, booked: 5 },
  { time: "10:00", capacity: 8, booked: 4 },
  { time: "10:30", capacity: 8, booked: 6 },
  { time: "11:00", capacity: 8, booked: 2 },
  { time: "11:30", capacity: 8, booked: 1 },
  { time: "13:00", capacity: 8, booked: 3 },
  { time: "13:30", capacity: 8, booked: 0 },
  { time: "14:00", capacity: 8, booked: 5 },
  { time: "14:30", capacity: 8, booked: 2 },
];

const STATUS_LABEL = {
  live: "Sedang Berlangsung",
  done: "Selesai",
  scheduled: "Terjadwal",
  delayed: "Ditunda",
};

window.AS_DATA = { PERKARA_DB, SCHEDULE, SLOTS, STATUS_LABEL };
