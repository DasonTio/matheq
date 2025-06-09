import React from "react";
import { Paper, Title, Text, Alert, Tabs, Group, Button, Badge, Divider } from "@mantine/core";
import { Lightbulb, Calculator } from "@phosphor-icons/react";

const FormulaExplanation = ({ equation, results = [], currentIteration = 0, setCurrentIteration, tolerance }) => {
  const currentStep = results[currentIteration] || {};

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <Text size="xs" c="dimmed">Titik sebelumnya (x₍ₙ₋₁₎):</Text>
                <Text ff="monospace">{currentStep.xPrev}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Titik saat ini (xₙ):</Text>
                <Text ff="monospace">{currentStep.xCurr}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">f(x₍ₙ₋₁₎):</Text>
                <Text ff="monospace">{currentStep.fPrev}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">f(xₙ):</Text>
                <Text ff="monospace">{currentStep.fCurr}</Text>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <Text fw={500} mb="xs">🔢 Langkah 1: Hitung Gradien Secant</Text>
            <Text size="sm" mb="xs">
              <strong>Formula:</strong> f'(xₙ) ≈ [f(xₙ) - f(x₍ₙ₋₁₎)] / [xₙ - x₍ₙ₋₁₎]
            </Text>
            <div className="bg-white p-3 rounded">
              <Text size="sm" ff="monospace">
                f'({currentStep.xCurr}) ≈ [{currentStep.fCurr} - {currentStep.fPrev}] / [{currentStep.xCurr} - {currentStep.xPrev}]
              </Text>
              <Text size="sm" ff="monospace">
                f'({currentStep.xCurr}) ≈ {currentStep.slope}
              </Text>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <Text fw={500} mb="xs">📊 Langkah 2: Hitung Titik Baru</Text>
            <Text size="sm" mb="xs">
              <strong>Formula Secant:</strong> x₍ₙ₊₁₎ = xₙ - f(xₙ) / f'(xₙ)
            </Text>
            <div className="bg-white p-3 rounded">
              <Text size="sm" ff="monospace">
                x₍ₙ₊₁₎ = {currentStep.xCurr} - {currentStep.fCurr} / {currentStep.slope}
              </Text>
              <Text size="sm" ff="monospace">
                x₍ₙ₊₁₎ = {currentStep.xNext}
              </Text>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded">
            <Text fw={500} mb="xs">🎯 Langkah 3: Evaluasi dan Cek Konvergensi</Text>
            <div className="space-y-2">
              <Text size="sm">
                <strong>f(x₍ₙ₊₁₎):</strong> f({currentStep.xNext}) = {currentStep.fNext}
              </Text>
              <Text size="sm">
                <strong>Error absolut:</strong> |x₍ₙ₊₁₎ - xₙ| = {currentStep.error?.toFixed(8)}
              </Text>
              <Text size="sm">
                <strong>Error relatif:</strong> {currentStep.relativeError?.toFixed(4)}%
              </Text>
              <div className={`p-2 rounded ${Math.abs(currentStep.fNext) < tolerance ? 'bg-green-100' : 'bg-orange-100'}`}>
                <Text size="sm" fw={500} c={Math.abs(currentStep.fNext) < tolerance ? "green" : "orange"}>
                  {Math.abs(currentStep.fNext) < tolerance 
                    ? `✅ |f(x₍ₙ₊₁₎)| < ${tolerance} → KONVERGEN! Akar: x ≈ ${currentStep.xNext}` 
                    : `⏳ |f(x₍ₙ₊₁₎)| ≥ ${tolerance} → Lanjut ke iterasi berikutnya`
                  }
                </Text>
              </div>
            </div>
          </div>

          {/* Summary for this iteration */}
          <div className="bg-gray-50 p-4 rounded">
            <Text fw={500} mb="xs">📋 Ringkasan Iterasi {currentStep.iteration}:</Text>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Text size="xs" c="dimmed">x₍ₙ₋₁₎:</Text>
                <Text ff="monospace">{currentStep.xPrev}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">xₙ:</Text>
                <Text ff="monospace">{currentStep.xCurr}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">x₍ₙ₊₁₎:</Text>
                <Text ff="monospace">{currentStep.xNext}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Status:</Text>
                <Badge 
                  color={Math.abs(currentStep.fNext) < tolerance ? "green" : "orange"} 
                  variant="light" 
                  size="sm"
                >
                  {Math.abs(currentStep.fNext) < tolerance ? "Konvergen" : "Lanjut"}
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
        🔄 Metode Secant (Secant Method)
      </Title>

      <Alert icon={<Lightbulb size={16} />} color="blue" mb="md">
        <Text fw={500} mb="xs">Konsep Dasar:</Text>
        <Text size="sm">
          Metode Secant menggunakan dua titik untuk memperkirakan gradien (turunan) 
          tanpa perlu menghitung turunan secara eksplisit. Lebih praktis daripada Newton-Raphson.
        </Text>
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
              <Text fw={500} mb="xs">Formula Metode Secant:</Text>
              <div className="bg-gray-50 p-3 rounded text-center">
                <Text size="lg" ff="monospace" fw={700}>
                  x₍ₙ₊₁₎ = xₙ - f(xₙ) × [xₙ - x₍ₙ₋₁₎] / [f(xₙ) - f(x₍ₙ₋₁₎)]
                </Text>
              </div>
              <Text size="sm" c="dimmed" mt="xs">
                Menggunakan aproksimasi gradien dengan dua titik terakhir
              </Text>
            </div>

            <div>
              <Text fw={500} mb="xs">Aproksimasi Gradien:</Text>
              <div className="bg-blue-50 p-3 rounded text-center">
                <Text size="md" ff="monospace" fw={600}>
                  f'(xₙ) ≈ [f(xₙ) - f(x₍ₙ₋₁₎)] / [xₙ - x₍ₙ₋₁₎]
                </Text>
              </div>
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
                • Dua tebakan awal yang berbeda (x₀ ≠ x₁)
                <br />
                • f(xₙ) ≠ f(x₍ₙ₋₁₎) (menghindari pembagian nol)
                <br />
                • Fungsi kontinu di sekitar akar
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
                  <li>• Tidak memerlukan turunan fungsi</li>
                  <li>• Konvergensi lebih cepat dari bisection</li>
                  <li>• Implementasi relatif mudah</li>
                  <li>• Orde konvergensi ≈ 1.618 (golden ratio)</li>
                </ul>
              </div>
            </div>

            <div>
              <Text fw={500} mb="xs" c="orange">⚠️ Kekurangan:</Text>
              <div className="bg-orange-50 p-3 rounded">
                <ul className="text-sm space-y-1">
                  <li>• Memerlukan dua tebakan awal</li>
                  <li>• Lebih lambat dari Newton-Raphson</li>
                  <li>• Bisa gagal jika gradien mendekati nol</li>
                  <li>• Tidak selalu konvergen</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-50 rounded">
            <Text fw={500} size="sm" mb="xs">
              <Calculator size={16} style={{ marginRight: 4 }} />
              Kapan Menggunakan Metode Secant?
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Text fw={500} mb="xs">Secant cocok untuk:</Text>
                <ul className="space-y-1">
                  <li>• Fungsi yang sulit diturunkan</li>
                  <li>• Ketika turunan tidak tersedia</li>
                  <li>• Perlu konvergensi yang cukup cepat</li>
                  <li>• Implementasi numerik sederhana</li>
                </ul>
              </div>
              <div>
                <Text fw={500} mb="xs">Bandingkan dengan:</Text>
                <ul className="space-y-1">
                  <li>• Newton-Raphson: Lebih cepat tapi perlu turunan</li>
                  <li>• Bisection: Lebih lambat tapi lebih stabil</li>
                  <li>• Fixed Point: Tergantung transformasi fungsi</li>
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