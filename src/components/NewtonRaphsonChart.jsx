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
import { Paper, Title, Text, Group, Badge } from "@mantine/core";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Text fw={500} mb="xs">
            Konvergensi Nilai x
          </Text>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={convergenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="iteration"
                  label={{
                    value: "Iterasi",
                    position: "insideBottom",
                    offset: -10,
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="x"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                  name="Nilai x"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <Text fw={500} mb="xs">
            Penurunan Error
          </Text>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={convergenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="iteration"
                  label={{
                    value: "Iterasi",
                    position: "insideBottom",
                    offset: -10,
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="error"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                  name="Error Absolut"
                />
                <Line
                  type="monotone"
                  dataKey="fx"
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={{ fill: "#ea580c", strokeWidth: 2, r: 4 }}
                  name="Nilai f(x)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <Text size="sm" fw={500} mb="xs">
          💡 Interpretasi Grafik:
        </Text>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • <strong>Grafik kiri:</strong> Menunjukkan nilai x mendekati akar
            persamaan
          </li>
          <li>
            • <strong>Grafik kanan:</strong> Menunjukkan error yang semakin
            mengecil (skala logaritmik)
          </li>
          <li>
            • <strong>Error Absolut:</strong> Selisih antara x(n+1) dan x(n)
          </li>
          <li>
            • <strong>Nilai f(x):</strong> Seberapa dekat nilai fungsi dengan
            nol
          </li>
          <li>• Hover pada titik untuk melihat nilai detail</li>
        </ul>
      </div>

      {/* Tabel ringkasan */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <Text size="sm" fw={500} mb="xs">
          📊 Ringkasan Konvergensi:
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <Text size="xs" c="dimmed">
              Iterasi Pertama:
            </Text>
            <Text fw={500}>{data[0]?.x.toFixed(6)}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Iterasi Terakhir:
            </Text>
            <Text fw={500}>{data[data.length - 1]?.xNext.toFixed(6)}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Error Awal:
            </Text>
            <Text fw={500}>{data[0]?.error.toExponential(2)}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Error Akhir:
            </Text>
            <Text fw={500}>
              {data[data.length - 1]?.error.toExponential(2)}
            </Text>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default NewtonRaphsonChart;
