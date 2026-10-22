import React, { useState } from 'react';
import { 
  RotateCcw, 
  Copy, 
  Check, 
  Terminal, 
  AlertOctagon, 
  ShieldCheck, 
  FileCode, 
  Zap, 
  GitCommit,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ParsedSessionState } from '../types/zlce';
import { copyText } from '../utils/clipboard';


interface RecoveryTabProps {
  stateData: ParsedSessionState;
  rawMarkdown?: string;
}

export const RecoveryTab: React.FC<RecoveryTabProps> = ({ stateData, rawMarkdown }) => {
  const [selectedCase, setSelectedCase] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [copiedHandover, setCopiedHandover] = useState(false);
  const [copiedBundle, setCopiedBundle] = useState(false);
  const [copiedSnapshotCmd, setCopiedSnapshotCmd] = useState(false);

  // Snapshot Fixture Examples
  const caseFixtures = {
    A: `=== ZLCE RECOVERY SNAPSHOT ===
waktu: 2026-10-14T10:30:00+07:00
--- branch ---
feature/task-002-schema
--- git status --short ---
(clean working tree)
--- git log -5 ---
b1c2d3e 2026-10-14 10:15:00 +0700 feat: implementasi model Todo [TASK-001]
a0f1e2d 2026-10-14 09:30:00 +0700 chore: init repo dan struktur proyek
--- git diff --stat (unstaged) ---
(empty)
--- git diff --stat (staged) ---
(empty)
--- zlce-check ---
RESULT: OK (0 error, 0 warn, 3 task)
=== END SNAPSHOT ===`,

    B: `=== ZLCE RECOVERY SNAPSHOT ===
waktu: 2026-10-14T10:35:00+07:00
--- branch ---
feature/task-002-schema
--- git status --short ---
 M src/models/todo.py
?? migrations/001_todos.sql
--- git log -5 ---
b1c2d3e 2026-10-14 10:15:00 +0700 feat: init task 002
--- git diff --stat (unstaged) ---
 src/models/todo.py | 14 ++++++++++++++
 1 file changed, 14 insertions(+)
--- git diff berkas terlacak (maks. 400 baris) ---
diff --git a/src/models/todo.py b/src/models/todo.py
+class TodoItem(BaseModel):
+    id: int
+    title: str
--- zlce-check ---
RESULT: OK (0 error, 0 warn, 3 task)
=== END SNAPSHOT ===`,

    C: `=== ZLCE RECOVERY SNAPSHOT ===
waktu: 2026-10-14T10:40:00+07:00
--- branch ---
feature/task-002-schema
--- git status --short ---
(clean working tree)
--- git log -5 ---
9f8e7d6 2026-10-14 10:38:00 +0700 wip: coba tambah endpoint auth [UNTRACKED]
b1c2d3e 2026-10-14 10:15:00 +0700 feat: implementasi model Todo [TASK-001]
--- git diff --stat (unstaged) ---
(empty)
--- zlce-check ---
RESULT: OK (0 error, 0 warn, 3 task)
=== END SNAPSHOT ===`,

    D: `=== ZLCE RECOVERY SNAPSHOT ===
waktu: 2026-10-14T10:45:00+07:00
--- branch ---
feature/task-002-schema
--- git status --short ---
 M src/models/todo.py
 M src/billing/stripe_service.py
--- git log -5 ---
b1c2d3e 2026-10-14 10:15:00 +0700 feat: implementasi model Todo
--- git diff --stat (unstaged) ---
 src/billing/stripe_service.py | 45 +++++++++++++++++++++++++++++++++++++++
 1 file changed, 45 insertions(+)
--- zlce-check ---
RESULT: OK (0 error, 0 warn, 3 task)
=== END SNAPSHOT ===`
  };

  const [snapshotText, setSnapshotText] = useState(caseFixtures.A);

  const handleSelectCase = (caseId: 'A' | 'B' | 'C' | 'D') => {
    setSelectedCase(caseId);
    setSnapshotText(caseFixtures[caseId]);
  };

  // Generate Handover Prompt based on HANDOVER_PROMPT.md
  const generateHandoverPrompt = () => {
    return `# UNIVERSAL HANDOVER & RECOVERY PROMPT v3.2.2

Peran: Senior Software Engineer & Context Controller.
Metodologi: Zero-Loss Context Engineering (ZLCE).

## INSTRUKSI SERAH TERIMA & PEMULIHAN SESI

1. BACA TIER 0 SEKARANG:
   - Lampiran: SESSION_STATE.md (terlampir)
   - Task Aktif: ${stateData.status.activeTask || 'TASK-002'} (${stateData.status.activeTaskStatus || 'IN_PROGRESS'})
   - Snapshot Git:
\`\`\`text
${snapshotText}
\`\`\`

2. PROTOKOL KASUS ${selectedCase} TERDETEKSI:
${
  selectedCase === 'A'
    ? '   - KASUS A: Working tree bersih. Lanjutkan persis ke langkah berikutnya di WAL (' + stateData.wal.nextStepExact + '). DILARANG melakukan git reset.'
    : selectedCase === 'B'
    ? '   - KASUS B: Ditemukan diff uncommitted yang sesuai dengan rencana WAL (' + stateData.wal.plannedFiles + '). Selesaikan langkah ini, lakukan verifikasi, lalu commit. DILARANG mereset atau menghapus diff.'
    : selectedCase === 'C'
    ? '   - KASUS C: Ditemukan commit tidak terlacak pada git log. Rekonsiliasikan git log dengan SESSION_STATE.md, perbarui audit log, dan jalankan uji verifikasi penuh.'
    : '   - KASUS D: Ditemukan modifikasi di luar berkas yang terdaftar pada WAL. Karantina berkas terkait, dan minta konfirmasi persetujuan pengguna sebelum melakukan tindakan apa pun.'
}

3. TINDAKAN ANDA SEBAGAI AGEN:
   - Konfirmasi status sesi secara singkat (maksimal 6 baris).
   - Terapkan Aturan X1: dilarang mengarang jam baru, gunakan fallback 'jam: ?' bila tidak ada jam eksplisit.
   - Jangan menulis kode sebelum mengonfirmasi status dan meminta berkas Tier 1.
`;
  };

  const generateHandoverBundlePrompt = () => {
    return `${generateHandoverPrompt()}

---

## 4. DOKUMEN KONTROL AKTIF (SESSION_STATE.md)
\`\`\`markdown
${rawMarkdown || '<!-- Gunakan berkas SESSION_STATE.md aktual proyek -->'}
\`\`\`

---
*Petunjuk Agen AI Baru: Seluruh status sesi aktif, matriks task, status WAL, dan snapshot git telah terlampir lengkap di atas. Lakukan LANGKAH 0 & 1/2 konfirmasi status sekarang.*
`;
  };

  const handleCopyHandover = async () => {
    const success = await copyText(generateHandoverPrompt());
    if (success) {
      setCopiedHandover(true);
      setTimeout(() => setCopiedHandover(false), 2000);
    }
  };

  const handleCopyBundle = async () => {
    const success = await copyText(generateHandoverBundlePrompt());
    if (success) {
      setCopiedBundle(true);
      setTimeout(() => setCopiedBundle(false), 2000);
    }
  };

  const handleCopySnapshotCmd = async () => {
    const success = await copyText('bash scripts/zlce/zlce-snapshot.sh --diff');
    if (success) {
      setCopiedSnapshotCmd(true);
      setTimeout(() => setCopiedSnapshotCmd(false), 2000);
    }
  };

  const caseDescriptions = {
    A: {
      name: 'Kasus A: Working Tree Bersih',
      badge: 'Normal Resume',
      color: 'border-emerald-500 text-emerald-300 bg-emerald-950/40',
      rule: 'Pohon kerja git bersih dan konsisten dengan commit terakhir.',
      action: 'Lanjutkan persis langkah berikutnya yang tertulis di WAL. Dilarang git reset.'
    },
    B: {
      name: 'Kasus B: Diff Uncommitted Sesuai WAL',
      badge: 'In-Flight Changes',
      color: 'border-cyan-500 text-cyan-300 bg-cyan-950/40',
      rule: 'Ada perubahan belum di-commit yang cocok dengan Berkas Direncanakan di WAL.',
      action: 'Pertahankan diff yang ada! Selesaikan langkah, verifikasi dengan perintah test, baru commit.'
    },
    C: {
      name: 'Kasus C: Untracked Commits di Git Log',
      badge: 'Git Desync',
      color: 'border-amber-500 text-amber-300 bg-amber-950/40',
      rule: 'Ditemukan commit di git log yang belum tercatat atau disetujui di SESSION_STATE.md.',
      action: 'Rekonsiliasi git log dengan matriks task, perbarui audit log, dan wajib verifikasi test ulang.'
    },
    D: {
      name: 'Kasus D: Perubahan di Luar WAL (Wildcard)',
      badge: 'Quarantine Required',
      color: 'border-rose-500 text-rose-300 bg-rose-950/40',
      rule: 'Ditemukan modifikasi pada berkas yang TIDAK pernah dideklarasikan pada WAL.',
      action: 'Karantina berkas di luar WAL! Konfirmasi kepada pengguna secara eksplisit sebelum bertindak.'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-cyan-400" />
            Pemulihan Sesi Terputus (Recovery Protocol Kasus A-D)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Jika sesi AI terputus, token habis, atau pindah model di tengah task: pulihkan konteks 100% tanpa risiko kehilangan kode.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySnapshotCmd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Salin perintah terminal snapshot recovery"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            {copiedSnapshotCmd ? 'Tersalin' : 'bash scripts/zlce/zlce-snapshot.sh'}
          </button>
          <button
            onClick={handleCopyHandover}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
            title="Salin prompt serah terima dengan snapshot git tersemat"
          >
            {copiedHandover ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copiedHandover ? 'Tersalin!' : 'Salin Handover Prompt'}
          </button>
          <button
            onClick={handleCopyBundle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition"
            title="Salin bundel utuh satu-klik: Prompt + SESSION_STATE + Snapshot Git"
          >
            {copiedBundle ? <Check className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4" />}
            {copiedBundle ? 'Bundel Tersalin!' : 'Salin Bundel Handover (All-in-One)'}
          </button>
        </div>
      </div>

      {/* 4 Cases Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(['A', 'B', 'C', 'D'] as const).map((caseKey) => {
          const c = caseDescriptions[caseKey];
          const isSelected = selectedCase === caseKey;

          return (
            <div
              key={caseKey}
              onClick={() => handleSelectCase(caseKey)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${c.color}`}>
                  KASUS {caseKey}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{c.badge}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">{c.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{c.rule}</p>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-cyan-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{c.action}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Case Directive & Snapshot Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Terminal Snapshot (Input) */}
        <div className="lg:col-span-6 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Cuplikan Terminal: zlce-snapshot.sh --diff
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Pilih preset atau tempel</span>
          </div>

          <textarea
            value={snapshotText}
            onChange={(e) => setSnapshotText(e.target.value)}
            rows={16}
            className="w-full flex-1 p-4 bg-slate-950 text-slate-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 border-none resize-none leading-relaxed"
            spellCheck={false}
          />

          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px] text-slate-400">
              Jalankan: <code className="text-cyan-400">bash scripts/zlce/zlce-snapshot.sh --diff</code>
            </span>
            <div className="flex gap-1">
              {(['A', 'B', 'C', 'D'] as const).map(k => (
                <button
                  key={k}
                  onClick={() => handleSelectCase(k)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    selectedCase === k ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Preset {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Handover Directive Output */}
        <div className="lg:col-span-6 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Blok HANDOVER_PROMPT.md Siap Kirim
            </span>
            <button
              onClick={handleCopyHandover}
              className="text-xs px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium transition"
            >
              {copiedHandover ? 'Tersalin' : 'Salin'}
            </button>
          </div>

          <pre className="flex-1 p-4 bg-slate-950 text-slate-300 font-mono text-xs overflow-y-auto max-h-[360px] whitespace-pre-wrap leading-relaxed">
            {generateHandoverPrompt()}
          </pre>

          <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Peringatan Mutlak:</strong> Agen AI dilarang keras melakukan <code className="text-rose-400 font-mono">git reset --hard</code> pada sesi pemulihan untuk mencegah hilangnya hasil kerja yang belum di-commit.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
