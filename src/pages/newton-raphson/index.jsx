import { useState } from "react";
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
import { LineChart } from "@mantine/charts";
import Latex from "react-latex";
import * as math from "mathjs";

export default function NewtonRaphsonPage() {
  const [funcString, setFuncString] = useState("x^4 + x^3 - 4x - 5");
  const [x0, setX0] = useState(1);
  const [tolerance, setTolerance] = useState(1e-7);
  const [maxIter, setMaxIter] = useState(10);

  const [iterations, setIterations] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const [dfLatex, setDfLatex] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    try {
      const fNode = math.parse(funcString);
      const f = fNode.compile();
      const dfNode = math.derivative(fNode, "x");
      const df = dfNode.compile();
      setDfLatex(dfNode.toTex());

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

      const delta = 1;
      const tangents = iters.map(({ xi, fxi, dfxi }) => ({
        x0: xi,
        y0: fxi,
        m: dfxi,
      }));

      const xs = iters.map((r) => r.xi);
      const xMin = Math.min(...xs) - 2;
      const xMax = Math.max(...xs) + 2;
      const samples = 200;
      const step = (xMax - xMin) / samples;
      const xPlot = Array.from(
        { length: samples + 1 },
        (_, idx) => xMin + idx * step
      );

      let allX = [
        ...xPlot,
        ...tangents.flatMap((t) => [t.x0 - delta, t.x0 + delta]),
      ];
      allX = Array.from(new Set(allX)).sort((a, b) => a - b);

      const data = allX.map((x) => {
        const row = { x };
        row["f(x)"] = f.evaluate({ x });
        tangents.forEach((t, idx) => {
          const key = `tangent ${idx}`;
          if (x >= t.x0 - delta && x <= t.x0 + delta) {
            row[key] = t.m * (x - t.x0) + t.y0;
          } else {
            row[key] = null;
          }
        });
        return row;
      });

      const series = [
        { name: "f(x)", color: "red.6" },
        ...tangents.map((_, idx) => ({
          name: `tangent ${idx}`,
          color: "blue.6",
        })),
      ];

      setChartData(data);
      setChartSeries(series);
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
            <Latex>{`$$
        f(x) = ${funcString}
      $$`}</Latex>
            <Latex>{`$$
        f'(x) = ${dfLatex}
      $$`}</Latex>
          </div>

          <LineChart
            h={400}
            data={chartData}
            dataKey="x"
            series={chartSeries}
            curveType="linear"
            withDots={false}
          />

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
