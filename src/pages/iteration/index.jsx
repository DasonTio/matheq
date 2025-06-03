import React, { useState } from "react";
import {
  Container,
  Title,
  Paper,
  TextInput,
  Button,
  Group,
  Alert,
  Text,
  Grid,
  Card,
  Badge,
  NumberInput,
  Tabs,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Warning, Function, Play, ArrowClockwise, CheckCircle } from "@phosphor-icons/react";
import { evaluate, parse } from "mathjs";
import Latex from "react-latex";
import FixedIterationTable from "../../components/FixedIterationTable";
import FixedIterationChart from "../../components/FixedIterationChart";

// Helper for plotting
const safeEvaluateForPlotting = (func, vars) => {
  try {
    const result = evaluate(func, vars);
    if (typeof result === 'number' && isFinite(result)) return result;
    return null;
  } catch {
    return null;
  }
};

// --- Component for Formula Explanation with a more robust syntax ---
const FormulaExplanation = () => (
  <Paper p="md" mb="md" withBorder>
    <Title order={4} mb="sm">Konsep Metode Iterasi Titik Tetap</Title>
    <Text mb="sm">
      Metode Iterasi Titik Tetap (Fixed-Point Iteration) adalah metode terbuka untuk menemukan akar persamaan <Latex>{"$f(x)=0$"}</Latex>. Kunci dari metode ini adalah mengubah persamaan tersebut ke dalam bentuk <Latex>{"$x = g(x)$"}</Latex>.
    </Text>
    <Text mb="sm">
      Setelah mendapatkan bentuk <Latex>{"$x = g(x)$"}</Latex>, kita dapat melakukan iterasi menggunakan rumus:
    </Text>
    <Paper p="xs" withBorder ta="center" mb="md">
      {/* --- FIX: Using explicit JS string with safer delimiters --- */}
      <Text size="lg" c="blue"><Latex>{"\\(x_{i+1} = g(x_i)\\)"}</Latex></Text>
    </Paper>
    <Text mb="sm">
      Dimulai dengan tebakan awal <Latex>{"$x_0$"}</Latex>, kita terus-menerus menghitung nilai <Latex>{"$x$"}</Latex> berikutnya hingga selisih antara <Latex>{"\\(x_{i+1}\\)"}</Latex> dan <Latex>{"\\(x_i\\)"}</Latex> lebih kecil dari toleransi yang ditentukan.
    </Text>
    <Alert color="blue" title="Syarat Konvergensi" icon={<CheckCircle />}>
      Agar iterasi ini konvergen (menuju ke satu titik akar), turunan dari <Latex>{"$g(x)$"}</Latex> harus memenuhi syarat: <Latex>{"$|g'(x)| < 1$"}</Latex> di sekitar akar. Jika tidak, nilai <Latex>{"$x$"}</Latex> akan divergen (menjauh dari akar).
    </Alert>
  </Paper>
);


const FixedPointIterationPage = () => {
  const [results, setResults] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");
  const [stepExplanation, setStepExplanation] = useState("");

  const [calculationState, setCalculationState] = useState(null);
  const [isConverged, setIsConverged] = useState(false);
  const [isFinished, setIsFinished] = useState(false);


  const form = useForm({
    initialValues: {
      equation: "(2*x + 5)^(1/3)",
      initialGuess: 2,
      tolerance: 0.0001,
      maxIterations: 20,
    },
    validate: {
      equation: (value) => {
        try {
          parse(value);
          return null;
        } catch {
          return "Persamaan g(x) tidak valid";
        }
      },
      tolerance: (value) =>
        value <= 0 ? "Toleransi harus lebih besar dari 0" : null,
      maxIterations: (value) =>
        value < 1 ? "Maksimal iterasi minimal 1" : null,
    },
  });

  const generateChartData = (iterations, g_x_function, initialGuess) => {
      if (!iterations || iterations.length === 0) return [];

      const plotData = [];
      const xValues = iterations.map(p => p.xi).concat([initialGuess]);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const range = maxX - minX;
      const padding = range === 0 ? 2 : range * 0.25;
      const plotMinX = minX - padding;
      const plotMaxX = maxX + padding;
      const step = (plotMaxX - plotMinX) / 150;

      for (let i = 0; i <= 150; i++) {
        const x = plotMinX + i * step;
        plotData.push({
          x: x,
          g_x: safeEvaluateForPlotting(g_x_function, { x }),
          y_equals_x: x,
        });
      }

      iterations.forEach((iter) => {
        plotData.push({
          x: iter.xi,
          iteration_g_x: iter.gxi,
        });
      });

      return plotData.sort((a, b) => a.x - b.x);
  };
  
  const prepareCalculation = (values) => {
    handleReset(false);
    setCalculationState({
      x: parseFloat(values.initialGuess),
      iteration: 0,
      config: values,
      allSteps: [],
    });
    setStepExplanation(`Kalkulasi siap. Klik "Langkah Selanjutnya" untuk memulai dengan tebakan awal x₀ = ${values.initialGuess}.`);
  };

  const handleNextStep = () => {
    if (!calculationState || isFinished) return;
    
    let { x, iteration, config, allSteps } = calculationState;
    const { equation, tolerance, maxIterations } = config;
    
    const g_x = evaluate(equation, { x });

    if (typeof g_x !== 'number' || !isFinite(g_x)) {
      setError(`Hasil g(x) pada x = ${x} tidak valid. Perhitungan dihentikan.`);
      setIsFinished(true);
      return;
    }

    const xNext = g_x;
    const currentError = Math.abs(xNext - x);

    const newStep = {
      iteration: iteration + 1,
      xi: x,
      gxi: xNext,
      error: currentError,
    };
    
    const updatedSteps = [...allSteps, newStep];
    setResults(updatedSteps);
    setChartData(generateChartData(updatedSteps, equation, config.initialGuess));

    let converged = currentError < tolerance;
    let maxIterReached = iteration + 1 >= maxIterations;
    
    if (converged) {
      setIsConverged(true);
      setIsFinished(true);
      setStepExplanation(`✅ Konvergen! Pada iterasi ${iteration + 1}, error (${currentError.toExponential(4)}) lebih kecil dari toleransi (${tolerance}). Akar ditemukan di ~${xNext.toFixed(6)}.`);
    } else if (maxIterReached) {
      setIsFinished(true);
      setStepExplanation(`🟡 Selesai. Maksimal ${maxIterations} iterasi tercapai tanpa konvergensi. Nilai terakhir adalah ${xNext.toFixed(6)}.`);
    } else {
       setStepExplanation(`Iterasi ${iteration + 2}: Substitusi xᵢ = ${xNext.toFixed(6)} ke dalam g(x) untuk mendapatkan xᵢ₊₁.`);
    }
    
    setCalculationState({
      ...calculationState,
      x: xNext,
      iteration: iteration + 1,
      allSteps: updatedSteps
    });
  };

  const handleReset = (resetForm = true) => {
    setResults([]);
    setChartData([]);
    setError("");
    setCalculationState(null);
    setIsConverged(false);
    setIsFinished(false);
    setStepExplanation("");
    if (resetForm) {
      form.reset();
    }
  };


  return (
    <Container size="xl" py="xl">
      <Title order={1} ta="center" mb="xl" c="blue">
        🧑‍🏫 Platform Pembelajaran: Iterasi Titik Tetap
      </Title>

      <Grid>
        {/* --- INPUT & CONTROLS COLUMN --- */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper shadow="sm" p="md" radius="md">
            <Title order={3} mb="md"><Function size={24} style={{ marginRight: 8 }} />Parameter & Kontrol</Title>

            <form onSubmit={form.onSubmit(prepareCalculation)}>
              <TextInput label={<Latex>Fungsi $g(x)$ untuk $x = g(x)$</Latex>} {...form.getInputProps("equation")} />
              <NumberInput mt="md" label="Tebakan Awal (x₀)" {...form.getInputProps("initialGuess")} step={0.1} precision={6} />
              <NumberInput mt="md" label="Toleransi Error" {...form.getInputProps("tolerance")} step={0.0001} decimalScale={8} precision={8} />
              <NumberInput mt="md" label="Maksimal Iterasi" {...form.getInputProps("maxIterations")} min={1} />
              
              <Divider my="xl" label="Kontrol Kalkulasi" labelPosition="center" />
              
              <Group grow>
                <Button type="submit" disabled={calculationState !== null}>Siapkan</Button>
                <Button onClick={() => handleReset(true)} color="red" leftSection={<ArrowClockwise size={16} />}>Reset</Button>
              </Group>
              <Button mt="md" fullWidth onClick={handleNextStep} disabled={!calculationState || isFinished} leftSection={<Play size={16} />}>
                Langkah Selanjutnya
              </Button>
            </form>
          </Paper>

          {stepExplanation && (
            <Card mt="md" shadow="sm" withBorder>
              <Text fw={500} mb="xs">Penjelasan Langkah</Text>
              <Text size="sm">{stepExplanation}</Text>
              {isFinished && (
                <Badge mt="sm" color={isConverged ? 'green' : 'orange'}>
                  {isConverged ? 'Konvergen' : 'Perhitungan Selesai'}
                </Badge>
              )}
            </Card>
          )}

        </Grid.Col>

        {/* --- OUTPUT & VISUALIZATION COLUMN --- */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          {error && <Alert icon={<Warning size={16} />} title="Error" color="red" mb="md">{error}</Alert>}
          
          <Tabs defaultValue="konsep">
            <Tabs.List>
              <Tabs.Tab value="konsep">Konsep & Rumus</Tabs.Tab>
              <Tabs.Tab value="visualisasi" disabled={results.length === 0}>Visualisasi Grafik</Tabs.Tab>
              <Tabs.Tab value="tabel" disabled={results.length === 0}>Tabel Iterasi</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="konsep" pt="md">
              <FormulaExplanation />
            </Tabs.Panel>

            <Tabs.Panel value="visualisasi" pt="md">
              {chartData.length > 0 && <FixedIterationChart data={chartData} />}
            </Tabs.Panel>
            
            <Tabs.Panel value="tabel" pt="md">
              {results.length > 0 && <FixedIterationTable data={results} />}
            </Tabs.Panel>
          </Tabs>

        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default FixedPointIterationPage;