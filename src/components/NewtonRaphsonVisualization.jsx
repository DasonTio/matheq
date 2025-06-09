import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Button,
  NumberInput,
} from "@mantine/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { evaluate } from "mathjs";

const NewtonRaphsonVisualization = ({ data, equation }) => {
  const [numPoints, setNumPoints] = useState(200);
  const [zoomDomain, setZoomDomain] = useState(null);
  const [brushRange, setBrushRange] = useState([0, numPoints - 1]);
  // mulai dari iterasi pertama
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const safeEval = (expr, x) => {
    try {
      return evaluate(expr, { x, e: Math.E });
    } catch {
      return NaN;
    }
  };

  // hitung domain grafik berdasarkan semua xₙ
  const xs = data.map((d) => d.x);
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const margin = (xmax - xmin) * 0.3 || 1;
  const start = xmin - margin;
  const end = xmax + margin;

  // generate titik-titik f(x)
  const generateFuncData = (points = numPoints) => {
    const step = (end - start) / (points - 1);
    return Array.from({ length: points }, (_, i) => {
      const x = start + i * step;
      return { x: Number(x.toFixed(6)), y: safeEval(equation, x) };
    });
  };
  const funcData = generateFuncData();

  // data langkah saat ini
  const step = data[currentStepIdx] || {};
  const x0 = step.x;
  const fx0 = step.fx;
  const fpx0 = step.fpx;

  // garis singgung di (x₀, f(x₀))
  const tangentData = funcData.map((p) => ({
    x: p.x,
    y: fpx0 * (p.x - x0) + fx0,
  }));

  // brush / zoom handler
  const handleBrush = (e) => {
    if (e?.startIndex != null && e?.endIndex != null) {
      const x1 = funcData[e.startIndex].x;
      const x2 = funcData[e.endIndex].x;
      setZoomDomain([x1, x2]);
      setBrushRange([e.startIndex, e.endIndex]);
    } else {
      setZoomDomain(null);
      setBrushRange([0, funcData.length - 1]);
    }
  };

  useEffect(() => {
    // reset zoom & kembalikan ke langkah pertama tiap data baru
    setZoomDomain(null);
    setBrushRange([0, funcData.length - 1]);
    setCurrentStepIdx(0);
  }, [equation, start, end, numPoints, data.length]);

  return (
    <Paper shadow="sm" p="md" radius="md" mb="md">
      <Group justify="space-between" mb="sm">
        <Title order={4}>📈 Visualisasi Newton–Raphson</Title>
        <Badge variant="light" color="blue">
          Iterasi {currentStepIdx + 1} / {data.length}
        </Badge>
      </Group>
      <Text size="sm" c="dimmed" mb="md">
        Grafik fungsi \(f(x)\) dan garis singgung di \(x_n\).
      </Text>

      <Group justify="space-between" mb="xs">
        <Group spacing="xs">
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              setZoomDomain(null);
              setBrushRange([0, funcData.length - 1]);
            }}
          >
            Reset Zoom
          </Button>
          <Button
            size="xs"
            variant="light"
            onClick={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
            disabled={currentStepIdx === 0}
          >
            ← Prev
          </Button>
          <Button
            size="xs"
            variant="light"
            onClick={() =>
              setCurrentStepIdx((i) => Math.min(data.length - 1, i + 1))
            }
            disabled={currentStepIdx === data.length - 1}
          >
            Next →
          </Button>
        </Group>
        <NumberInput
          label="Titik grafik"
          value={numPoints}
          onChange={setNumPoints}
          min={50}
          max={500}
          step={10}
          hideControls
          size="xs"
          style={{ width: 100 }}
        />
      </Group>

      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <LineChart
            data={funcData}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              domain={zoomDomain || ["dataMin", "dataMax"]}
            />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" />
            {/* f(x) */}
            <Line
              type="monotone"
              dataKey="y"
              stroke="#2563eb"
              dot={false}
              name="f(x)"
            />
            {/* garis singgung */}
            <Line
              data={tangentData}
              type="monotone"
              dataKey="y"
              stroke="#f59e0b"
              dot={false}
              name="Garis singgung"
            />
            {/* tanda xₙ */}
            <ReferenceLine
              x={x0}
              stroke="#ef4444"
              label={{
                value: `xₙ = ${x0?.toFixed(4)}`,
                position: "top",
              }}
            />
            <Brush
              dataKey="x"
              height={30}
              stroke="#8884d8"
              startIndex={brushRange[0]}
              endIndex={brushRange[1]}
              onChange={handleBrush}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

export default NewtonRaphsonVisualization;
