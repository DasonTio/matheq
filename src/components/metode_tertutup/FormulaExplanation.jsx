import React from "react";
import { Paper, Title, Text, Alert, Tabs, Group, Button, Badge, Divider } from "@mantine/core";
import { Lightbulb, Calculator } from "@phosphor-icons/react";

const FormulaExplanation = ({ method, equation, results = [], currentIteration = 0, setCurrentIteration, tolerance }) => {
  const methodConfig = {
    bisection: {
      title: "Metode Biseksi (Bisection Method)",
      formula: "c = (a + b) / 2",
      description: "Membagi interval menjadi dua bagian sama besar",
      concept: "Metode biseksi menggunakan teorema nilai tengah. Jika f(a) dan f(b) berlawanan tanda, maka ada akar di antara a dan b.",
      steps: [
        "Pastikan f(a) × f(b) < 0",
        "Hitung titik tengah: c = (a + b) / 2",
        "Evaluasi f(c)",
        "Pilih interval baru berdasarkan tanda f(c)",
        "Ulangi hingga error < toleransi"
      ],
      advantages: [
        "Selalu konvergen jika syarat awal terpenuhi",
        "Sederhana dan mudah dipahami",
        "Stabil secara numerik"
      ],
      disadvantages: [
        "Konvergensi relatif lambat",
        "Membutuhkan interval awal yang tepat"
      ]
    },
    "regula-falsi": {
      title: "Metode Regula Falsi (False Position)",
      formula: "c = (a×f(b) - b×f(a)) / (f(b) - f(a))",
      description: "Menggunakan interpolasi linear untuk menentukan titik potong",
      concept: "Metode regula falsi menggunakan garis lurus yang menghubungkan titik (a,f(a)) dan (b,f(b)) untuk memperkirakan lokasi akar.",
      steps: [
        "Pastikan f(a) × f(b) < 0",
        "Hitung titik potong: c = (a×f(b) - b×f(a)) / (f(b) - f(a))",
        "Evaluasi f(c)",
        "Pilih interval baru berdasarkan tanda f(c)",
        "Ulangi hingga error < toleransi"
      ],
      advantages: [
        "Konvergensi lebih cepat dari biseksi",
        "Menggunakan informasi kemiringan fungsi",
        "Selalu konvergen jika syarat awal terpenuhi"
      ],
      disadvantages: [
        "Bisa lambat jika fungsi sangat melengkung",
        "Lebih kompleks dari biseksi"
      ]
    }
  };

  const currentMethod = methodConfig[method];
  const currentStep = results[currentIteration] || {};

  const getCCalculationText = () => {
    if (!currentStep.a) return "";
    
    if (method === "bisection") {
      return `c = (a + b) / 2 = (${currentStep.a} + ${currentStep.b}) / 2 = ${currentStep.c}`;
    } else {
      return `c = (a⋅f(b) - b⋅f(a)) / (f(b) - f(a)) = (${currentStep.a}⋅${currentStep.fb} - ${currentStep.b}⋅${currentStep.fa}) / (${currentStep.fb} - ${currentStep.fa}) = ${currentStep.c}`;
    }
  };

  const renderStepByStep = () => {
    if (results.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded">
          <Text size="sm" c="dimmed" ta="center">
            Jalankan perhitungan terlebih dahulu untuk melihat langkah-langkah
          </Text>
        </div>
      );
    }

    return (
      <div>
        {/* Navigation */}
        <Group justify="space-between" mb="md">
          <Badge variant="light" color="blue" size="lg">
            Iterasi {currentIteration + 1} dari {results.length}
          </Badge>
          <Group>
            <Button
              size="xs"
              variant="light"
              onClick={() => setCurrentIteration(Math.max(0, currentIteration - 1))}
              disabled={currentIteration === 0}
            >
              ← Sebelumnya
            </Button>
            <Button
              size="xs"
              variant="light"
              onClick={() => setCurrentIteration(Math.min(results.length - 1, currentIteration + 1))}
              disabled={currentIteration === results.length - 1}
            >
              Selanjutnya →
            </Button>
          </Group>
        </Group>

        <Divider mb="md" />

        {/* Current Step Details */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <Text fw={500} mb="xs">📍 Kondisi Awal Iterasi {currentStep.iteration}:</Text>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <Text size="xs" c="dimmed">Interval saat ini:</Text>
                <Text ff="monospace">[{currentStep.a}, {currentStep.b}]</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">f(a) = f({currentStep.a}):</Text>
                <Text ff="monospace">{currentStep.fa}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">f(b) = f({currentStep.b}):</Text>
                <Text ff="monospace">{currentStep.fb}</Text>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <Text fw={500} mb="xs">🔢 Langkah 1: Hitung nilai c</Text>
            <Text size="sm" mb="xs">
              <strong>Formula:</strong> {currentMethod.formula}
            </Text>
            <Text size="sm" ff="monospace" p="xs" style={{ backgroundColor: 'white', borderRadius: 4 }}>
              {getCCalculationText()}
            </Text>
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <Text fw={500} mb="xs">📊 Langkah 2: Evaluasi f(c)</Text>
            <Text size="sm" mb="xs">
              Substitusi c = {currentStep.c} ke dalam fungsi:
            </Text>
            <Text size="sm" ff="monospace" p="xs" style={{ backgroundColor: 'white', borderRadius: 4 }}>
              f({currentStep.c}) = {currentStep.fc}
            </Text>
          </div>

          <div className="bg-purple-50 p-4 rounded">
            <Text fw={500} mb="xs">🎯 Langkah 3: Cek Konvergensi</Text>
            <div className="space-y-2">
              <Text size="sm">
                <strong>Error saat ini:</strong> |f(c)| = |{currentStep.fc}| = {Math.abs(currentStep.fc).toFixed(8)}
              </Text>
              <Text size="sm">
                <strong>Toleransi:</strong> {tolerance}
              </Text>
              <div className={`p-2 rounded ${Math.abs(currentStep.fc) < tolerance ? 'bg-green-100' : 'bg-orange-100'}`}>
                <Text size="sm" fw={500} c={Math.abs(currentStep.fc) < tolerance ? "green" : "orange"}>
                  {Math.abs(currentStep.fc) < tolerance 
                    ? `✅ |f(c)| < ${tolerance} → KONVERGEN! Akar ditemukan: x ≈ ${currentStep.c}` 
                    : `⏳ |f(c)| ≥ ${tolerance} → Belum konvergen, lanjut ke iterasi berikutnya`
                  }
                </Text>
              </div>
            </div>
          </div>

          {Math.abs(currentStep.fc) >= tolerance && (
            <div className="bg-orange-50 p-4 rounded">
              <Text fw={500} mb="xs">🔄 Langkah 4: Tentukan Interval Baru</Text>
              <div className="space-y-2">
                <Text size="sm">
                  <strong>Cek tanda:</strong> f(a) × f(c) = {currentStep.fa} × {currentStep.fc} = {(currentStep.fa * currentStep.fc).toFixed(6)}
                </Text>
                <Text size="sm">
                  <strong>Keputusan:</strong> {currentStep.fa * currentStep.fc < 0 
                    ? `f(a) × f(c) < 0, maka akar berada di interval [a, c] = [${currentStep.a}, ${currentStep.c}]`
                    : `f(a) × f(c) > 0, maka akar berada di interval [c, b] = [${currentStep.c}, ${currentStep.b}]`
                  }
                </Text>
                <div className={`p-2 rounded ${currentStep.chosen === 'left' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <Text size="sm" fw={500}>
                    📍 Interval baru: {currentStep.chosen === 'left' ? `[${currentStep.a}, ${currentStep.c}]` : `[${currentStep.c}, ${currentStep.b}]`}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Summary for this iteration */}
          <div className="bg-gray-50 p-4 rounded">
            <Text fw={500} mb="xs">📋 Ringkasan Iterasi {currentStep.iteration}:</Text>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Text size="xs" c="dimmed">Interval Awal:</Text>
                <Text ff="monospace">[{currentStep.a}, {currentStep.b}]</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Titik c:</Text>
                <Text ff="monospace">{currentStep.c}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">f(c):</Text>
                <Text ff="monospace">{currentStep.fc}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Status:</Text>
                <Badge 
                  color={Math.abs(currentStep.fc) < tolerance ? "green" : "orange"} 
                  variant="light" 
                  size="sm"
                >
                  {Math.abs(currentStep.fc) < tolerance ? "Konvergen" : "Lanjut"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Paper shadow="sm" p="md" radius="md" mb="md">
      <Title order={4} mb="md">
        📚 {currentMethod.title}
      </Title>

      <Alert icon={<Lightbulb size={16} />} color="blue" mb="md">
        <Text fw={500} mb="xs">Konsep Dasar:</Text>
        <Text size="sm">{currentMethod.concept}</Text>
      </Alert>

      <Tabs defaultValue="formula" mb="md">
        <Tabs.List>
          <Tabs.Tab value="formula">📐 Formula</Tabs.Tab>
          <Tabs.Tab value="steps">📝 Langkah</Tabs.Tab>
          <Tabs.Tab value="comparison">⚖️ Perbandingan</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="formula" pt="md">
          <div className="space-y-4">
            <div>
              <Text fw={500} mb="xs">Formula {currentMethod.title.split(' (')[0]}:</Text>
              <div className="bg-gray-50 p-3 rounded text-center">
                <Text size="lg" ff="monospace" fw={700}>
                  {currentMethod.formula}
                </Text>
              </div>
              <Text size="sm" c="dimmed" mt="xs">
                {currentMethod.description}
              </Text>
            </div>

            <div>
              <Text fw={500} mb="xs">Untuk persamaan Anda:</Text>
              <div className="bg-blue-50 p-3 rounded">
                <Text size="sm" ff="monospace">
                  f(x) = {equation}
                </Text>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded">
              <Text fw={500} size="sm" mb="xs">
                🎯 Syarat Penting:
              </Text>
              <Text size="sm">
                • f(a) × f(b) &lt; 0 (berbeda tanda)
                <br />
                • Fungsi kontinu dalam interval [a, b]
              </Text>
            </div>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="steps" pt="md">
          {renderStepByStep()}
        </Tabs.Panel>

        <Tabs.Panel value="comparison" pt="md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text fw={500} mb="xs" c="green">✅ Kelebihan:</Text>
              <div className="bg-green-50 p-3 rounded">
                <ul className="text-sm space-y-1">
                  {currentMethod.advantages.map((advantage, index) => (
                    <li key={index}>• {advantage}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <Text fw={500} mb="xs" c="orange">⚠️ Kekurangan:</Text>
              <div className="bg-orange-50 p-3 rounded">
                <ul className="text-sm space-y-1">
                  {currentMethod.disadvantages.map((disadvantage, index) => (
                    <li key={index}>• {disadvantage}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-50 rounded">
            <Text fw={500} size="sm" mb="xs">
              <Calculator size={16} style={{ marginRight: 4 }} />
              Kapan Menggunakan Method Ini?
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Text fw={500} mb="xs">Biseksi cocok untuk:</Text>
                <ul className="space-y-1">
                  <li>• Fungsi yang sulit diturunkan</li>
                  <li>• Ketika keamanan konvergensi penting</li>
                  <li>• Implementasi sederhana</li>
                </ul>
              </div>
              <div>
                <Text fw={500} mb="xs">Regula Falsi cocok untuk:</Text>
                <ul className="space-y-1">
                  <li>• Ketika kecepatan konvergensi penting</li>
                  <li>• Fungsi yang relatif smooth</li>
                  <li>• Akurasi tinggi diperlukan</li>
                </ul>
              </div>
            </div>
          </div>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};

export default FormulaExplanation;