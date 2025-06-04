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
  Divider,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Warning, Function, Play, ArrowClockwise, CheckCircle, ArrowUUpLeft } from "@phosphor-icons/react"; // <-- NEW: Added ArrowUUpLeft
import { evaluate } from "mathjs";
import Latex from "react-latex";
import FixedIterationTable from "../../components/FixedIterationTable";
import FixedIterationConvergenceChart from "../../components/FixedIterationConvergenceChart";
import FixedIterationChart from "../../components/FixedIterationChart";

// Helper for plotting the g(x) vs y=x chart
const safeEvaluateForPlotting = (func, vars) => {
  try {
    const result = evaluate(func, vars);
    if (typeof result === 'number' && isFinite(result)) return result;
    return null;
  } catch {
    return null;
  }
};

// Component for Formula Explanation (no changes needed here)
const FormulaExplanation = () => (
  <Paper p="md" mb="md" withBorder>
    <Title order={4} mb="sm">Konsep Metode Iterasi Titik Tetap</Title>
    <Text mb="sm">
      Metode Iterasi Titik Tetap (Fixed-Point Iteration) adalah metode terbuka untuk menemukan akar persamaan <Latex>{"f(x)=0"}</Latex>. Kunci dari metode ini adalah mengubah persamaan tersebut ke dalam bentuk x = g(x).
    </Text>
    <Text mb="sm">
      Setelah mendapatkan bentuk x = g(x), kita dapat melakukan iterasi menggunakan rumus:
    </Text>
    <Paper p="xs" withBorder ta="center" mb="md">
      <Text size="lg" c="blue">x <sub>i+1</sub> = g(x<sub>i</sub>) </Text>
    </Paper>
    <Text mb="sm">
      Dimulai dengan tebakan awal x <sub>0</sub> , kita terus-menerus menghitung nilai <Latex>{"x"}</Latex> berikutnya hingga selisih antara x <sub>i+1</sub> dan x <sub>i</sub> lebih kecil dari toleransi yang ditentukan.
    </Text>
    <Alert color="blue" title="Syarat Konvergensi" icon={<CheckCircle />}>
      Agar iterasi ini konvergen (menuju ke satu titik akar), turunan dari <Latex>{"g(x)"}</Latex> harus memenuhi syarat: <Latex>{"$|g'(x)| < 1$"}</Latex> di sekitar akar. Jika tidak, nilai <Latex>{"x"}</Latex> akan divergen (menjauh dari akar).
    </Alert>
  </Paper>
);


const FixedPointIterationPage = () => {
  const [results, setResults] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");
  const [stepExplanation, setStepExplanation] = useState("");
  const [calculationState, setCalculationState] = useState(null);
  
  const form = useForm({
    initialValues: {
      equation: "(2*x + 5)^(1/3)",
      initialGuess: 2,
      tolerance: 0.0001,
      maxIterations: 20,
    },
    // ... validation is the same
  });

  // This function is the same
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
      plotData.push({ x: x, g_x: safeEvaluateForPlotting(g_x_function, { x }), y_equals_x: x });
    }
    iterations.forEach((iter) => {
      plotData.push({ x: iter.xi, iteration_g_x: iter.gxi });
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
      isFinished: false,
    });
    setStepExplanation(`Kalkulasi siap. Klik "Langkah Selanjutnya" untuk memulai dengan tebakan awal x₀ = ${values.initialGuess}.`);
  };

  const handleNextStep = () => {
    if (!calculationState || calculationState.isFinished) return;
    
    let { x, iteration, config, allSteps } = calculationState;
    const { equation, tolerance, maxIterations, initialGuess } = config;
    
    const g_x = evaluate(equation, { x });

    if (typeof g_x !== 'number' || !isFinite(g_x)) {
      setError(`Hasil g(x) pada x = ${x} tidak valid. Perhitungan dihentikan.`);
      setCalculationState({ ...calculationState, isFinished: true });
      return;
    }

    const newStep = { iteration: iteration + 1, xi: x, gxi: g_x, error: Math.abs(g_x - x) };
    const updatedAllSteps = [...allSteps, newStep];
    const converged = newStep.error < tolerance;
    const maxIterReached = newStep.iteration >= maxIterations;
    const isNowFinished = converged || maxIterReached;

    setResults(updatedAllSteps);
    setChartData(generateChartData(updatedAllSteps, equation, initialGuess));
    
    if (converged) {
      setStepExplanation(`✅ Konvergen! Pada iterasi ${newStep.iteration}, error (${newStep.error.toExponential(4)}) lebih kecil dari toleransi. Akar ditemukan di ~${newStep.gxi.toFixed(6)}.`);
    } else if (maxIterReached) {
      setStepExplanation(`🟡 Selesai. Maksimal ${maxIterations} iterasi tercapai. Nilai terakhir adalah ${newStep.gxi.toFixed(6)}.`);
    } else {
       setStepExplanation(`Iterasi ${newStep.iteration + 1}: Substitusi xᵢ = ${newStep.gxi.toFixed(6)} ke dalam g(x) untuk mendapatkan xᵢ₊₁.`);
    }
    
    setCalculationState({
      ...calculationState,
      x: newStep.gxi,
      iteration: newStep.iteration,
      allSteps: updatedAllSteps,
      isFinished: isNowFinished,
    });
  };

  const handlePreviousStep = () => {
    if (!calculationState || results.length === 0) return;

    const { config } = calculationState;
    const newVisibleSteps = results.slice(0, results.length - 1);
    setResults(newVisibleSteps);
    setChartData(generateChartData(newVisibleSteps, config.equation, config.initialGuess));

    if (newVisibleSteps.length === 0) {
      prepareCalculation(config); // Go back to initial "prepared" state
    } else {
      const lastVisibleStep = newVisibleSteps[newVisibleSteps.length - 1];
      setCalculationState({
        ...calculationState,
        x: lastVisibleStep.gxi,
        iteration: lastVisibleStep.iteration,
        isFinished: false, // Can always go forward again
      });
      setStepExplanation(`Iterasi ${lastVisibleStep.iteration + 1}: Mundur ke langkah sebelumnya. Substitusi xᵢ = ${lastVisibleStep.gxi.toFixed(6)}.`);
    }
  };

  const handleJumpToStep = (stepIndex) => {
    if (!calculationState || stepIndex < 0 || stepIndex >= results.length) return;
    
    const { config } = calculationState;
    const newVisibleSteps = results.slice(0, stepIndex + 1);
    const lastVisibleStep = newVisibleSteps[stepIndex];
    
    // Update the visible results and chart
    setResults(newVisibleSteps);
    setChartData(generateChartData(newVisibleSteps, config.equation, config.initialGuess));
    
    const isNowFinished = lastVisibleStep.error < config.tolerance || lastVisibleStep.iteration >= config.maxIterations;

    // Update the engine to be ready for the next step from this point
    setCalculationState({
      ...calculationState,
      x: lastVisibleStep.gxi,
      iteration: lastVisibleStep.iteration,
      isFinished: isNowFinished
    });
    setStepExplanation(`Lompat ke akhir iterasi ${lastVisibleStep.iteration}. Nilai x selanjutnya adalah ${lastVisibleStep.gxi.toFixed(6)}.`);
  };


  const handleReset = (resetForm = true) => {
    setResults([]);
    setChartData([]);
    setError("");
    setCalculationState(null);
    setStepExplanation("");
    if (resetForm) {
      form.reset();
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} ta="center" mb="xl" c="blue">
        😭 Pembelajaran Metode Iterasi Titik Tetap
      </Title>

      <Paper shadow="sm" p="md" radius="md" mb="xl" ta={"center"}>
          Pelajari bagaimana metode iterasi titik tetap bekerja secara visual dan
          interaktif
      </Paper>
      
      
      <Grid>
        {/* --- INPUT & CONTROLS COLUMN --- */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack style={{ position: 'sticky', top: '20px' }}> 
              <Paper shadow="sm" p="md" radius="md">
              <Title order={3} mb="md"><Function size={24} style={{ marginRight: 8 }} />Parameter & Kontrol</Title>

              <form onSubmit={form.onSubmit(prepareCalculation)}>
                <TextInput label={<Latex>Fungsi g(x) untuk x = g(x)</Latex>} {...form.getInputProps("equation")} />
                <NumberInput mt="md" label="Tebakan Awal (x₀)" {...form.getInputProps("initialGuess")} step={0.1} precision={6} />
                <NumberInput mt="md" label="Toleransi Error" {...form.getInputProps("tolerance")} step={0.0001} decimalScale={8} precision={8} />
                <NumberInput mt="md" label="Maksimal Iterasi" {...form.getInputProps("maxIterations")} min={1} />
                
                <Divider my="xl" label="Kontrol Kalkulasi" labelPosition="center" />
                
                <Group grow>
                  <Button type="submit" disabled={calculationState !== null}>Siapkan</Button>
                  <Button onClick={() => handleReset(true)} color="red" leftSection={<ArrowClockwise size={16} />}>Reset</Button>
                </Group>

                <Group grow mt="md">
                  <Button 
                    onClick={handlePreviousStep} 
                    disabled={!calculationState || results.length === 0} 
                    variant="default"
                    leftSection={<ArrowUUpLeft size={16} />}
                  >
                    Sebelumnya
                  </Button>
                  <Button 
                    onClick={handleNextStep} 
                    disabled={!calculationState || calculationState.isFinished} 
                    leftSection={<Play size={16} />}
                  >
                    Selanjutnya
                  </Button>
                </Group>
              </form>
            </Paper>

            {stepExplanation && (
              <Card mt="md" shadow="sm" withBorder>
                <Text fw={500} mb="xs">Penjelasan Langkah</Text>
                <Text size="sm">{stepExplanation}</Text>
                {calculationState?.isFinished && (
                  <Badge mt="sm" color={calculationState.error < calculationState.config.tolerance ? 'green' : 'orange'}>
                    Perhitungan Selesai
                  </Badge>
                )}
              </Card>
            )}
          </Stack>
        </Grid.Col>

        {/* --- OUTPUT & VISUALIZATION COLUMN --- */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          {error && <Alert icon={<Warning size={16} />} title="Error" color="red" mb="md">{error}</Alert>}
          <FormulaExplanation />
          {results.length > 0 && (
            <>
              <Divider my="xl" label="Hasil Kalkulasi" labelPosition="center" />
              <Paper p="md" withBorder mb="xl" shadow="sm">
                 <Title order={4} mb="sm">Visualisasi Metode (g(x) vs y=x)</Title>
                 <FixedIterationChart data={chartData} />
              </Paper>
              <FixedIterationConvergenceChart data={results} />
              <Paper p="md" withBorder shadow="sm" mt="xl">
                 <Title order={4} mb="sm">Tabel Iterasi</Title>
                 <FixedIterationTable data={results} onRowClick={handleJumpToStep} />
              </Paper>
            </>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default FixedPointIterationPage;