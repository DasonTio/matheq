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
} from "@mantine/core";

const NewtonRaphsonChart = ({ data, equation }) => {
  const convergenceData = data.map((item) => ({
    iteration: item.iteration,
    x: parseFloat(item.x.toFixed(6)),
    error: Math.abs(item.error),
    fx: Math.abs(item.fx),
  }));

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`Iterasi: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${
                entry.name.includes("Error") || entry.name.includes("f(x)")
                  ? entry.value.toExponential(3)
                  : entry.value.toFixed(6)
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Legend dengan spacing yang lebih baik
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-6 py-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-0.5"
              style={{ backgroundColor: entry.color }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: entry.color }}
            >
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Paper shadow="sm" p="md" radius="md" mb="md">
      <Group justify="space-between" mb="md">
        <Title order={4}>📈 Visualisasi Konvergensi</Title>
        <Badge variant="light" color="blue">
          {data.length} Iterasi
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        Grafik menunjukkan bagaimana nilai x dan error berkurang setiap iterasi
      </Text>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Chart 1: Konvergensi Nilai x */}
        <Card shadow="xs" padding="md" radius="md" className="h-fit">
          <Text fw={500} mb="sm" ta="center" c="blue">
            Konvergensi Nilai x
          </Text>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart
                data={convergenceData}
                margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="iteration"
                  label={{
                    value: "Iterasi",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{
                    value: "Nilai x",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  content={<CustomLegend />}
                  wrapperStyle={{ paddingTop: "10px" }}
                />
                <Line
                  type="monotone"
                  dataKey="x"
                  stroke="#1e40af"
                  strokeWidth={3}
                  dot={{ fill: "#1e40af", strokeWidth: 2, r: 5 }}
                  name="Nilai x"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Penurunan Error */}
        <Card shadow="xs" padding="md" radius="md" className="h-fit">
          <Text fw={500} mb="sm" ta="center" c="red">
            Penurunan Error
          </Text>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart
                data={convergenceData}
                margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="iteration"
                  label={{
                    value: "Iterasi",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  scale="log"
                  domain={["dataMin", "dataMax"]}
                  label={{
                    value: "Error (log)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  content={<CustomLegend />}
                  wrapperStyle={{ paddingTop: "10px" }}
                />
                <Line
                  type="monotone"
                  dataKey="error"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                  name="Error"
                />
                <Line
                  type="monotone"
                  dataKey="fx"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ fill: "#eab308", strokeWidth: 2, r: 4 }}
                  name="f(x)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </SimpleGrid>

      {/* Penjelasan */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <Text size="sm" fw={500} mb="xs" c="blue">
            📊 Interpretasi Grafik:
          </Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <div>
              <Text size="sm" fw={500} mb="xs">
                Grafik Kiri:
              </Text>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <span className="text-blue-700 font-semibold">—</span>{" "}
                  Menunjukkan nilai x mendekati akar
                </li>
                <li>• Garis mendatar = konvergensi tercapai</li>
                <li>• Setiap titik = hasil iterasi</li>
              </ul>
            </div>
            <div>
              <Text size="sm" fw={500} mb="xs">
                Grafik Kanan:
              </Text>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <span className="text-red-600 font-semibold">—</span> Error:
                  selisih |x(n+1) - x(n)|
                </li>
                <li>
                  • <span className="text-yellow-600 font-semibold">—</span>{" "}
                  f(x): nilai fungsi
                </li>
                <li>• Skala log untuk melihat penurunan</li>
              </ul>
            </div>
          </SimpleGrid>
        </div>

        {/* Ringkasan Numerik */}
        <div className="p-4 bg-green-50 rounded-lg">
          <Text size="sm" fw={500} mb="xs" c="green">
            🎯 Ringkasan Konvergensi:
          </Text>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
            <div className="text-center">
              <Text size="xs" c="dimmed">
                Nilai Awal
              </Text>
              <Text fw={700} size="sm" c="blue">
                {data[0]?.x.toFixed(4)}
              </Text>
            </div>
            <div className="text-center">
              <Text size="xs" c="dimmed">
                Nilai Akhir
              </Text>
              <Text fw={700} size="sm" c="blue">
                {data[data.length - 1]?.xNext.toFixed(4)}
              </Text>
            </div>
            <div className="text-center">
              <Text size="xs" c="dimmed">
                Error Awal
              </Text>
              <Text fw={700} size="sm" c="red">
                {data[0]?.error.toExponential(1)}
              </Text>
            </div>
            <div className="text-center">
              <Text size="xs" c="dimmed">
                Error Akhir
              </Text>
              <Text fw={700} size="sm" c="red">
                {data[data.length - 1]?.error.toExponential(1)}
              </Text>
            </div>
          </SimpleGrid>
        </div>

        {/* Tips Pembelajaran */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <Text size="sm" fw={500} mb="xs" c="orange">
            💡 Tips Pembelajaran:
          </Text>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • Perhatikan bagaimana nilai x bergerak menuju akar persamaan
            </li>
            <li>
              • <span className="text-red-600 font-semibold">Error merah</span>{" "}
              yang menurun menunjukkan konvergensi yang baik
            </li>
            <li>
              •{" "}
              <span className="text-yellow-600 font-semibold">
                Garis kuning f(x)
              </span>{" "}
              mendekati nol berarti x mendekati akar yang benar
            </li>
            <li>
              • Coba ubah tebakan awal untuk melihat perbedaan jalur konvergensi
            </li>
          </ul>
        </div>
      </div>
    </Paper>
  );
};

export default NewtonRaphsonChart;