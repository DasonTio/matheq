import React from "react";
import { Paper, Title, Text, Alert, Tabs } from "@mantine/core";
import { Lightbulb, Calculator } from "@phosphor-icons/react";

const FormulaExplanation = ({ method, equation }) => {
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
          <div>
            <Text fw={500} mb="xs">Langkah-langkah {currentMethod.title.split(' (')[0]}:</Text>
            <div className="bg-green-50 p-3 rounded">
              <ol className="text-sm space-y-2">
                {currentMethod.steps.map((step, index) => (
                  <li key={index}>{index + 1}. {step}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-4">
            <Text fw={500} mb="xs">💡 Tips Penggunaan:</Text>
            <div className="bg-blue-50 p-3 rounded">
              <ul className="text-sm space-y-1">
                <li>• Pilih interval awal yang cukup kecil untuk konvergensi lebih cepat</li>
                <li>• Periksa grafik fungsi untuk memastikan ada akar dalam interval</li>
                <li>• Gunakan toleransi yang sesuai dengan kebutuhan akurasi</li>
                <li>• Perhatikan perilaku fungsi di sekitar akar</li>
              </ul>
            </div>
          </div>
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