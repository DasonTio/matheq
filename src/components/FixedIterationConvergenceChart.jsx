import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  SimpleGrid,
  Card,
  Alert,
} from "@mantine/core";
import { ChartBar, Target, Lightbulb, Info } from "@phosphor-icons/react";

const FixedIterationConvergenceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const convergenceData = data.map((item) => ({
    iteration: item.iteration,
    xi: parseFloat(item.xi.toFixed(6)),
    gxi: parseFloat(item.gxi.toFixed(6)),
    error: item.error,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="sm" withBorder shadow="md" radius="md">
          <Text fw={700} mb={4}>{`Iterasi: ${label}`}</Text>
          {payload.map((entry, index) => (
            <Text key={index} style={{ color: entry.color }} size="sm">
              {`${entry.name}: ${
                entry.name.includes("Error")
                  ? entry.value.toExponential(4)
                  : entry.value.toFixed(6)
              }`}
            </Text>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <Group justify="center" gap="lg" mt="sm">
      {payload.map((entry, index) => (
        <Group key={`item-${index}`} gap={8} wrap="nowrap">
          <div style={{ width: 16, height: 4, backgroundColor: entry.color }} />
          <Text size="sm" style={{ color: entry.color }}>
            {entry.value}
          </Text>
        </Group>
      ))}
    </Group>
  );

  return (
    <Paper shadow="sm" p="md" radius="md" mb="md" withBorder>
      <Title order={4}>📈 Visualisasi Proses Konvergensi</Title>
      <Text size="sm" c="dimmed" mb="md">
        Grafik menunjukkan bagaimana nilai x dan error berubah pada setiap iterasi.
      </Text>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Chart 1: Konvergensi Nilai x */}
        <Card shadow="xs" padding="sm" radius="md" withBorder>
          <Text fw={500} mb="sm" ta="center" c="blue.8">
            Konvergensi Nilai xᵢ
          </Text>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={convergenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="iteration" label={{ value: "Iterasi", position: "insideBottom", offset: -5 }} />
              <YAxis domain={['dataMin', 'dataMax']} label={{ value: "Nilai x", angle: -90, position: "insideLeft" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} verticalAlign="top" wrapperStyle={{ paddingBottom: "20px" }} />
              <Line type="monotone" dataKey="xi" stroke="#2563eb" strokeWidth={2} name="Nilai xᵢ" dot />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 2: Penurunan Error */}
        <Card shadow="xs" padding="sm" radius="md" withBorder>
          <Text fw={500} mb="sm" ta="center" c="red.8">
            Penurunan Error Relatif
          </Text>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={convergenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="iteration" label={{ value: "Iterasi", position: "insideBottom", offset: -5 }} />
              <YAxis scale="log" domain={['dataMin', 'dataMax']} label={{ value: "Error (Skala Log)", angle: -90, position: "insideLeft" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} verticalAlign="top" wrapperStyle={{ paddingBottom: "20px" }} />
              <Line type="monotone" dataKey="error" stroke="#c92a2a" strokeWidth={2} name="Error |xᵢ₊₁ - xᵢ|" dot />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </SimpleGrid>

      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Alert icon={<Info size={20} />} title="Interpretasi Grafik" color="blue">
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <div>
              <Text size="sm" fw={500}>Grafik Kiri (Nilai xᵢ):</Text>
              <Text size="xs">Garis biru menunjukkan nilai x pada awal setiap iterasi. Anda dapat melihatnya bergerak mendekati nilai akar yang stabil.</Text>
            </div>
            <div>
              <Text size="sm" fw={500}>Grafik Kanan (Error):</Text>
              <Text size="xs">Garis merah menunjukkan selisih |xᵢ₊₁ - xᵢ|. Penurunan yang tajam menandakan konvergensi yang cepat. Skala logaritmik digunakan untuk memperjelas penurunan error yang sangat kecil.</Text>
            </div>
          </SimpleGrid>
        </Alert>

        <Alert icon={<Target size={20} />} title="Ringkasan Konvergensi" color="green">
          <SimpleGrid cols={{ base: 2, md: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">Nilai Awal</Text>
              <Text fw={700}>{data[0]?.xi.toFixed(5)}</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">Nilai Akhir (Akar)</Text>
              <Text fw={700}>{data[data.length - 1]?.gxi.toFixed(5)}</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">Error Awal</Text>
              <Text fw={700} c="red.8">{data[0]?.error.toExponential(2)}</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">Error Akhir</Text>
              <Text fw={700} c="red.8">{data[data.length - 1]?.error.toExponential(2)}</Text>
            </div>
          </SimpleGrid>
        </Alert>

        <Alert icon={<Lightbulb size={20} />} title="Tips Pembelajaran" color="yellow">
          <ul style={{ fontSize: '12px', paddingLeft: '20px' }}>
            <li>Perhatikan bagaimana garis biru menjadi datar saat mendekati konvergensi.</li>
            <li>Error yang menurun secara konsisten adalah tanda bahwa metode ini bekerja dengan baik untuk fungsi g(x) yang Anda pilih.</li>
            <li>Coba gunakan fungsi g(x) yang berbeda untuk persamaan f(x)=0 yang sama dan bandingkan kecepatan konvergensinya.</li>
            <li>Ingat, metode ini hanya akan konvergen jika |g'(x)| &lt; 1 di sekitar akar.</li>
          </ul>
        </Alert>
      </div>
    </Paper>
  );
};

export default FixedIterationConvergenceChart;
