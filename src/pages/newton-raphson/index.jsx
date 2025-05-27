import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Box,
  Title,
  Table,
  Text,
} from "@mantine/core";
import Latex from "react-latex";
import * as math from "mathjs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
  Tooltip,
  Legend,
} from "recharts";

export default function NewtonRaphsonPage() {
  const [funcString, setFuncString] = useState("x^4 + x^3 - 4x - 5");
  const [x0, setX0] = useState(1);
  const [tolerance, setTolerance] = useState(1e-7);
  const [maxIter, setMaxIter] = useState(10);

  const [iterations, setIterations] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dfLatex, setDfLatex] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    try {
      // Parse dan kompilasi f dan f'
      const fNode = math.parse(funcString);
      const f = fNode.compile();
      const dfNode = math.derivative(fNode, "x");
      const df = dfNode.compile();
      setDfLatex(dfNode.toTex());

      // Newton–Raphson iterasi
      let xi = x0;
      const iters = [];
      for (let i = 0; i < maxIter; i++) {
        const fxi = f.evaluate({ x: xi });
        const dfxi = df.evaluate({ x: xi });
        if (Math.abs(dfxi) < 1e-12) {
          throw new Error("Turunan mendekati nol, iterasi dihentikan.");
        }
        const xNext = xi - fxi / dfxi;
        iters.push({ i, xi, fxi, dfxi, xNext });
        if (Math.abs(xNext - xi) < tolerance) break;
        xi = xNext;
      }
      setIterations(iters);

      // Siapkan data untuk plot f(x) dan segmen-segmen tangen
      const delta = 1; // panjang segmen tangen ke kiri/kanan
      const xsIter = iters.map((r) => r.xi);
      const xMin = Math.min(...xsIter) - delta * 1.5;
      const xMax = Math.max(...xsIter) + delta * 1.5;
      const samples = 200;
      const step = (xMax - xMin) / samples;

      const data = [];
      for (let j = 0; j <= samples; j++) {
        const x = xMin + j * step;
        const point = { x, fx: f.evaluate({ x }) };
        // untuk setiap iterasi, hitung nilai tangen di [xi - delta, xi + delta]
        iters.forEach(({ xi, fxi, dfxi }, idx) => {
          const key = `tan${idx}`;
          if (x >= xi - delta && x <= xi + delta) {
            point[key] = dfxi * (x - xi) + fxi;
          } else {
            point[key] = null;
          }
        });
        data.push(point);
      }

      setChartData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box className="p-6">
      <Title order={2} mb="md">
        Metode Newton–Raphson
      </Title>
      <div className="flex flex-col gap-4 max-w-lg">
        <TextInput
          label="Fungsi f(x)"
          placeholder="misal: x^3 - x - 2"
          value={funcString}
          onChange={(e) => setFuncString(e.currentTarget.value)}
        />
        <NumberInput
          label="Tebakan awal x₀"
          value={x0}
          onChange={(val) => setX0(val)}
        />
        <NumberInput
          label="Toleransi"
          precision={10}
          value={tolerance}
          onChange={(val) => setTolerance(val)}
        />
        <NumberInput
          label="Maksimum iterasi"
          value={maxIter}
          onChange={(val) => setMaxIter(val)}
        />
        <Group position="right" mt="md">
          <Button onClick={handleSubmit}>Hitung</Button>
        </Group>
        {error && (
          <Text color="red" size="sm">
            {error}
          </Text>
        )}
      </div>

      {chartData.length > 0 && (
        <Box mt="8">
          <Title order={4} mb="sm">
            Hasil Perhitungan
          </Title>

          <div className="mb-4 flex flex-col space-y-2">
            <Latex>{`$$f(x) = ${funcString}$$`}</Latex>
            <Latex>{`$$f'(x) = ${dfLatex}$$`}</Latex>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={["auto", "auto"]}
                label={{ value: "x", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                domain={["auto", "auto"]}
                label={{
                  value: "f(x)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 0,
                }}
              />
              <Tooltip
                formatter={(value, name) => [
                  typeof value === "number" ? value.toFixed(4) : value,
                  name,
                ]}
              />
              <Legend verticalAlign="top" />

              {/* Garis f(x) */}
              <Line
                type="monotone"
                dataKey="fx"
                name="f(x)"
                stroke="#ff4d4f"
                dot={false}
                strokeWidth={2}
              />

              {/* Segmen-segmen tangen */}
              {iterations.map(({ i }, idx) => (
                <Line
                  key={i}
                  type="linear"
                  dataKey={`tan${i}`}
                  name={`Tangen ke-${i}`}
                  stroke="#228be6"
                  dot={false}
                  strokeWidth={1.5}
                />
              ))}

              {/* Garis referensi vertikal di tiap xi */}
              {iterations.map(({ i, xi }) => (
                <ReferenceLine
                  key={`xref-${i}`}
                  x={xi}
                  stroke="#999"
                  strokeDasharray="3 3"
                  label={{ position: "bottom", value: `x${i}` }}
                />
              ))}

              {/* Garis referensi horizontal di tiap f(xi) */}
              {iterations.map(({ i, fxi }) => (
                <ReferenceLine
                  key={`yref-${i}`}
                  y={fxi}
                  stroke="#999"
                  strokeDasharray="3 3"
                  label={{ position: "right", value: `f(x${i})` }}
                />
              ))}

              {/* Titik iterasi */}
              {iterations.map(({ i, xi, fxi }) => (
                <ReferenceDot
                  key={`dot-${i}`}
                  x={xi}
                  y={fxi}
                  r={4}
                  fill="#228be6"
                  label={{
                    position: "top",
                    value: `(${xi.toFixed(2)}, ${fxi.toFixed(2)})`,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          <Table
            mt="6"
            highlightOnHover
            className="w-full table-auto border-collapse"
          >
            <thead>
              <tr>
                <th className="border px-4 py-2 text-center">Iterasi</th>
                <th className="border px-4 py-2 text-center">
                  x<sub>i</sub>
                </th>
                <th className="border px-4 py-2 text-center">
                  f(x<sub>i</sub>)
                </th>
                <th className="border px-4 py-2 text-center">
                  f&apos;(x<sub>i</sub>)
                </th>
                <th className="border px-4 py-2 text-center">
                  x<sub>i+1</sub>
                </th>
              </tr>
            </thead>
            <tbody>
              {iterations.map(({ i, xi, fxi, dfxi, xNext }) => (
                <tr key={i}>
                  <td className="border px-4 py-2 text-center">{i + 1}</td>
                  <td className="border px-4 py-2 text-center">
                    {xi.toFixed(6)}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {fxi.toExponential(3)}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {dfxi.toExponential(3)}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {xNext.toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
