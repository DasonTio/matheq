import React, { useState } from "react";
import OpenAI from "openai";
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
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Warning, Function, Play, ArrowClockwise, CheckCircle, ArrowUUpLeft, Sparkle } from "@phosphor-icons/react";
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
      Metode Iterasi Titik Tetap (Fixed-Point Iteration) adalah metode terbuka untuk menemukan akar persamaan <Latex>{"$f(x)=0$"}</Latex>. Kunci dari metode ini adalah mengubah persamaan tersebut ke dalam bentuk <Latex>{"$x = g(x)$"}</Latex>.
    </Text>
    <Text mb="sm">
      Setelah mendapatkan bentuk <Latex>{"$x = g(x)$"}</Latex>, kita dapat melakukan iterasi menggunakan rumus:
    </Text>
    <Paper p="xs" withBorder ta="center" mb="md">
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
  // --- State for the AI feature ---
  const [fxEquation, setFxEquation] = useState("x^3 - 2*x - 5 = 0");
  const [isFindingGx, setIsFindingGx] = useState(false);
  const [aiError, setAiError] = useState("");
  const [gxSuggestions, setGxSuggestions] = useState([]); // <-- NEW: State for AI suggestions

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
      plotData.push({ x: x, g_x: safeEvaluateForPlotting(g_x_function, { x }), y_equals_x: x });
    }
    iterations.forEach((iter) => {
      plotData.push({ x: iter.xi, iteration_g_x: iter.gxi });
    });
    return plotData.sort((a, b) => a.x - b.x);
  };

  const handleFindGx = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setAiError("Kunci API OpenAI tidak ditemukan. Pastikan Anda sudah mengatur file .env.local dengan benar.");
      return;
    }

    setIsFindingGx(true);
    setAiError("");
    setGxSuggestions([]); // Clear previous suggestions

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    const prompt = `Given the equation f(x) = ${fxEquation}, rearrange it into several different forms of x = g(x) that can be used for fixed-point iteration. Provide a numbered list of possible expressions for g(x). Each line should contain only the mathematical expression for g(x), without the "g(x) =" part. The expressions must be compatible with the mathjs library. For example, for 'x^2 - x - 2 = 0', a valid response would be:\n1. x + 2\n2. 2/(x-1)\n3. sqrt(x+2)`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that is an expert in mathematics and numerical methods. You provide concise, machine-readable answers in a numbered list format." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        n: 1,
      });

      const responseText = completion.choices[0].message.content;
      
      const suggestions = responseText
        .split('\n') 
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) 
        .filter(line => line.length > 0); 

      if (suggestions.length === 0) {
        setAiError("AI tidak dapat menemukan bentuk g(x) yang valid dari persamaan tersebut.");
      } else {
        setGxSuggestions(suggestions);
      }
      
    } catch (err) {
      setAiError("Gagal menghubungi AI. Error: " + err.message);
    } finally {
      setIsFindingGx(false);
    }
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
    setCalculationState({ ...calculationState, x: newStep.gxi, iteration: newStep.iteration, allSteps: updatedAllSteps, isFinished: isNowFinished });
  };

  const handlePreviousStep = () => {
    if (!calculationState || results.length === 0) return;
    const { config } = calculationState;
    const newVisibleSteps = results.slice(0, results.length - 1);
    setResults(newVisibleSteps);
    setChartData(generateChartData(newVisibleSteps, config.equation, config.initialGuess));
    if (newVisibleSteps.length === 0) {
      prepareCalculation(config);
    } else {
      const lastVisibleStep = newVisibleSteps[newVisibleSteps.length - 1];
      setCalculationState({ ...calculationState, x: lastVisibleStep.gxi, iteration: lastVisibleStep.iteration, isFinished: false });
      setStepExplanation(`Iterasi ${lastVisibleStep.iteration + 1}: Mundur ke langkah sebelumnya. Substitusi xᵢ = ${lastVisibleStep.gxi.toFixed(6)}.`);
    }
  };

  const handleJumpToStep = (stepIndex) => {
    if (!calculationState || stepIndex < 0 || stepIndex >= results.length) return;
    const { config } = calculationState;
    const newVisibleSteps = results.slice(0, stepIndex + 1);
    const lastVisibleStep = newVisibleSteps[stepIndex];
    setResults(newVisibleSteps);
    setChartData(generateChartData(newVisibleSteps, config.equation, config.initialGuess));
    const isNowFinished = lastVisibleStep.error < config.tolerance || lastVisibleStep.iteration >= config.maxIterations;
    setCalculationState({ ...calculationState, x: lastVisibleStep.gxi, iteration: lastVisibleStep.iteration, isFinished: isNowFinished });
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
        🧑‍🏫 Platform Pembelajaran: Iterasi Titik Tetap
      </Title>

      {/* --- AI Feature UI --- */}
      <Paper shadow="sm" p="md" radius="md" mb="xl" withBorder>
          <Group align="flex-end">
            <TextInput
              label="Cari g(x) dari f(x) = 0 menggunakan AI"
              placeholder="Contoh: x^3 - 2*x - 5 = 0"
              value={fxEquation}
              onChange={(event) => setFxEquation(event.currentTarget.value)}
              style={{ flex: 1 }}
              description="Masukkan persamaan f(x)=0 untuk diubah menjadi x=g(x)."
            />
            <Button 
              onClick={handleFindGx} 
              loading={isFindingGx}
              leftSection={<Sparkle size={18} />}
            >
              Cari g(x)
            </Button>
          </Group>
          {aiError && <Alert color="red" title="AI Error" mt="md">{aiError}</Alert>}
          
          {/* <-- NEW: Display suggestions as a list of buttons --> */}
          {gxSuggestions.length > 0 && (
            <Card mt="md" p="sm" withBorder radius="md">
              <Text size="sm" fw={500}>Saran g(x) dari AI (klik untuk menggunakan):</Text>
              <Stack gap="xs" mt="sm">
                {gxSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="light"
                    onClick={() => form.setFieldValue('equation', suggestion)}
                    styles={{ label: { whiteSpace: 'normal', textAlign: 'left' } }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Stack>
            </Card>
          )}
      </Paper>      
      
      <Grid>
        {/* --- INPUT & CONTROLS COLUMN --- */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack style={{ position: 'sticky', top: '20px' }}> 
              <Paper shadow="sm" p="md" radius="md">
              <Title order={3} mb="md"><Function size={24} style={{ marginRight: 8 }} />Parameter & Kontrol</Title>
              <form onSubmit={form.onSubmit(prepareCalculation)}>
                <TextInput 
                  label={<Latex>Fungsi $g(x)$ untuk $x = g(x)$</Latex>} 
                  {...form.getInputProps("equation")}
                  description="Gunakan fungsi dari AI atau masukkan manual."
                />
                <NumberInput mt="md" label="Tebakan Awal (x₀)" {...form.getInputProps("initialGuess")} step={0.1} precision={6} />
                <NumberInput mt="md" label="Toleransi Error" {...form.getInputProps("tolerance")} step={0.0001} decimalScale={8} precision={8} />
                <NumberInput mt="md" label="Maksimal Iterasi" {...form.getInputProps("maxIterations")} min={1} />
                
                <Divider my="xl" label="Kontrol Kalkulasi" labelPosition="center" />
                
                <Group grow>
                  <Button type="submit" disabled={calculationState !== null}>Siapkan</Button>
                  <Button onClick={() => handleReset(true)} color="red" leftSection={<ArrowClockwise size={16} />}>Reset</Button>
                </Group>
                <Group grow mt="md">
                  <Button onClick={handlePreviousStep} disabled={!calculationState || results.length === 0} variant="default" leftSection={<ArrowUUpLeft size={16} />} >
                    Sebelumnya
                  </Button>
                  <Button onClick={handleNextStep} disabled={!calculationState || calculationState.isFinished} leftSection={<Play size={16} />} >
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
                  <Badge mt="sm" color={results.length > 0 && results[results.length-1].error < form.values.tolerance ? 'green' : 'orange'}>
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