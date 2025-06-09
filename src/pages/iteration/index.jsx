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
import { Warning, Function, Play, ArrowClockwise, CheckCircle, ArrowUUpLeft, Sparkle, Calculator } from "@phosphor-icons/react";
import { evaluate } from "mathjs";
// import Latex from "react-latex"; // Removed dependency
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

// Component for Formula Explanation (Plain Text Version)
const FormulaExplanation = () => (
  <Paper p="md" mb="md" withBorder>
    <Title order={4} mb="sm">Konsep Metode Iterasi Titik Tetap</Title>
    <Text mb="sm">
      Metode Iterasi Titik Tetap (Fixed-Point Iteration) adalah metode terbuka untuk menemukan akar persamaan f(x) = 0. Kunci dari metode ini adalah mengubah persamaan tersebut ke dalam bentuk x = g(x).
    </Text>
    <Text mb="sm">
      Setelah mendapatkan bentuk x = g(x), kita dapat melakukan iterasi menggunakan rumus:
    </Text>
    <Paper p="xs" withBorder ta="center" mb="md" bg="gray.0">
      <Text size="lg" c="blue" ff="monospace">x(i+1) = g(x(i))</Text>
    </Paper>
    <Text mb="sm">
      Dimulai dengan tebakan awal x0, kita terus-menerus menghitung nilai x berikutnya hingga selisih antara x(i+1) dan x(i) lebih kecil dari toleransi yang ditentukan.
    </Text>
    <Alert color="blue" title="Syarat Konvergensi" icon={<CheckCircle />}>
      Agar iterasi ini konvergen (menuju ke satu titik akar), turunan dari g(x) harus memenuhi syarat: |g'(x)| &lt; 1 di sekitar akar. Jika tidak, nilai x akan divergen (menjauh dari akar).
    </Alert>
  </Paper>
);

// Component to display the detailed steps for the CURRENT iteration (Plain Text Version)
const FullIterationExplanation = ({ breakdown }) => {
  if (!breakdown) return null;

  const { step, xiValue, formula, substitution, result, gxi } = breakdown;

  return (
    <Paper p="md" withBorder mb="xl" shadow="sm" bg="white">
      <Title order={4} mb="md" c="blue.7">
        <Group gap="xs">
          <Calculator size={22} />
          <span>Langkah Selanjutnya: Menghitung x{step}</span>
        </Group>
      </Title>
      <Stack gap="sm">
        <Text>
            Pada langkah ini, kita akan menghitung nilai x untuk iterasi ke-<b>{step}</b> menggunakan nilai dari iterasi sebelumnya, x{step - 1} = {xiValue.toFixed(6)}.
        </Text>

        <Text><b>1. Rumus Umum Iterasi:</b></Text>
        <Paper p="xs" bg="gray.0" withBorder ta="center">
          <Text ff="monospace">{formula}</Text>
        </Paper>

        <Text><b>2. Substitusi Nilai x{step - 1}:</b> Ganti x dalam fungsi g(x) dengan hasil iterasi sebelumnya.</Text>
        <Paper p="xs" bg="gray.0" withBorder ta="center">
          <Text ff="monospace">{substitution}</Text>
        </Paper>

        <Text><b>3. Hasil Kalkulasi:</b> Hitung nilai numeriknya untuk mendapatkan x{step}.</Text>
        <Paper p="xs" bg="teal.0" withBorder ta="center">
          <Text fw={700} ff="monospace">{result}</Text>
        </Paper>

        <Alert mt="md" variant="light" color="blue" title="Apa Selanjutnya?" icon={<Play />}>
          Tekan tombol "Selanjutnya" untuk menjalankan kalkulasi ini. Hasil x{step} ≈ {gxi.toFixed(6)} akan ditambahkan ke tabel di bawah.
        </Alert>
      </Stack>
    </Paper>
  );
};


const FixedPointIterationPage = () => {
  // --- State for the AI feature ---
  const [fxEquation, setFxEquation] = useState("x^3 - 2*x - 5 = 0");
  const [isFindingGx, setIsFindingGx] = useState(false);
  const [aiError, setAiError] = useState("");
  const [gxSuggestions, setGxSuggestions] = useState([]);

  // --- State for the main calculation ---
  const [results, setResults] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState("");
  const [stepExplanation, setStepExplanation] = useState("");
  const [calculationState, setCalculationState] = useState(null);
  const [stepByStepBreakdown, setStepByStepBreakdown] = useState(null);

  const form = useForm({
    initialValues: {
      equation: "(2*x + 5)^(1/3)",
      initialGuess: 2,
      tolerance: 0.0001,
      maxIterations: 20,
    },
  });

  // Helper to generate chart data
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

  // Helper to generate the step-by-step breakdown explanation (Plain Text Version)
  const generateStepBreakdown = (current_x, iteration_i, g_x_function) => {
    try {
      const g_xi = evaluate(g_x_function, { x: current_x });
      if (typeof g_xi !== 'number' || !isFinite(g_xi)) {
        throw new Error(`Hasil g(${current_x}) tidak valid.`);
      }
      
      const next_iteration_num = iteration_i + 1;
      // Use plain text for the equation, replacing '*' for better readability
      const plainTextEquation = g_x_function.replace(/\*/g, ' * ');

      return {
        step: next_iteration_num,
        xiValue: current_x,
        gxi: g_xi, // The result of g(x(i))
        formula: `x${next_iteration_num} = g(x${iteration_i})`,
        substitution: `x${next_iteration_num} = ${plainTextEquation.replace(/x/g, `(${current_x.toFixed(6)})`)}`,
        result: `x${next_iteration_num} ≈ ${g_xi.toFixed(6)}`
      };
    } catch (e) {
      setError(`Error saat mempersiapkan langkah ${iteration_i + 1}: ${e.message}`);
      return null;
    }
  };
  
  // --- AI Functionality ---
  const handleFindGx = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setAiError("Kunci API OpenAI tidak ditemukan. Pastikan Anda sudah mengatur file .env.local dengan benar.");
      return;
    }
    setIsFindingGx(true);
    setAiError("");
    setGxSuggestions([]);
    const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
    const prompt = `Given the equation f(x) = ${fxEquation}, rearrange it into several different forms of x = g(x) that can be used for fixed-point iteration. Provide a numbered list of possible expressions for g(x). Each line should contain only the mathematical expression for g(x), without the "g(x) =" part. The expressions must be compatible with the mathjs library. For example, for 'x^2 - x - 2 = 0', a valid response would be:\n1. x + 2\n2. 2/(x-1)\n3. sqrt(x+2)`;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that is an expert in mathematics and numerical methods. You provide concise, machine-readable answers in a numbered list format." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3, n: 1,
      });
      const responseText = completion.choices[0].message.content;
      const suggestions = responseText.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(line => line.length > 0);
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

  // --- Core Calculation Control ---
  const prepareCalculation = (values) => {
    handleReset(false); 
    const { initialGuess, equation } = values;

    const breakdown = generateStepBreakdown(initialGuess, 0, equation);
    if (breakdown) {
      setStepByStepBreakdown(breakdown);
      setCalculationState({
        x: parseFloat(initialGuess),
        iteration: 0,
        config: values,
        allSteps: [],
        isFinished: false,
      });
      setStepExplanation(`Kalkulasi siap. Rincian untuk menghitung x1 ditampilkan di bawah. Klik "Selanjutnya" untuk memulai iterasi dari x0 = ${initialGuess}.`);
    } else {
      setStepByStepBreakdown(null);
    }
  };

  const handleNextStep = () => {
    if (!calculationState || calculationState.isFinished) return;

    let { x, iteration, config, allSteps } = calculationState;
    const { equation, tolerance, maxIterations, initialGuess } = config;

    const breakdown = generateStepBreakdown(x, iteration, equation);
    if (!breakdown) {
        setCalculationState({ ...calculationState, isFinished: true });
        setStepByStepBreakdown(null);
        return;
    }
    const g_x = breakdown.gxi;

    const newStep = { iteration: iteration + 1, xi: x, gxi: g_x, error: Math.abs(g_x - x) };
    const updatedAllSteps = [...allSteps, newStep];
    const converged = newStep.error < tolerance;
    const maxIterReached = newStep.iteration >= maxIterations;
    const isNowFinished = converged || maxIterReached;

    setResults(updatedAllSteps);
    setChartData(generateChartData(updatedAllSteps, equation, initialGuess));
    
    if (converged) {
      setStepExplanation(`✅ Konvergen! Pada iterasi ${newStep.iteration}, error (${newStep.error.toExponential(4)}) lebih kecil dari toleransi. Akar ditemukan di ~${newStep.gxi.toFixed(6)}.`);
      setStepByStepBreakdown(null); 
    } else if (maxIterReached) {
      setStepExplanation(`🟡 Selesai. Maksimal ${maxIterations} iterasi tercapai. Nilai terakhir adalah ${newStep.gxi.toFixed(6)}.`);
      setStepByStepBreakdown(null);
    } else {
       setStepExplanation(`Iterasi ${newStep.iteration} selesai. Hasil x(${newStep.iteration+1}) = ${newStep.gxi.toFixed(6)}. Sekarang, lihat di bawah cara menghitung iterasi berikutnya.`);
       const nextBreakdown = generateStepBreakdown(newStep.gxi, newStep.iteration, equation);
       setStepByStepBreakdown(nextBreakdown);
    }

    setCalculationState({ ...calculationState, x: newStep.gxi, iteration: newStep.iteration, allSteps: updatedAllSteps, isFinished: isNowFinished });
  };

  const handlePreviousStep = () => {
    if (!calculationState || calculationState.allSteps.length === 0) return;
    const { config, allSteps } = calculationState;
    
    const newVisibleSteps = allSteps.slice(0, allSteps.length - 1);
    setResults(newVisibleSteps);
    setChartData(generateChartData(newVisibleSteps, config.equation, config.initialGuess));

    let previousX, previousIteration;
    if (newVisibleSteps.length === 0) {
        previousX = config.initialGuess;
        previousIteration = 0;
        setStepExplanation(`Kembali ke awal. Rincian untuk menghitung x1 ditampilkan di bawah. Klik "Selanjutnya" untuk memulai.`);
    } else {
        const lastVisibleStep = newVisibleSteps[newVisibleSteps.length - 1];
        previousX = lastVisibleStep.gxi;
        previousIteration = lastVisibleStep.iteration;
        setStepExplanation(`Mundur ke akhir iterasi ${previousIteration}. Lihat di bawah cara menghitung iterasi berikutnya.`);
    }

    const nextBreakdown = generateStepBreakdown(previousX, previousIteration, config.equation);
    setStepByStepBreakdown(nextBreakdown);
    
    setCalculationState({
        ...calculationState,
        x: previousX,
        iteration: previousIteration,
        allSteps: newVisibleSteps,
        isFinished: false
    });
  };

  const handleJumpToStep = (stepIndex) => {
    if (!calculationState || stepIndex < 0) return;
    const { config, allSteps } = calculationState;
    if (stepIndex >= allSteps.length) return;

    const newVisibleSteps = allSteps.slice(0, stepIndex + 1);
    const lastVisibleStep = newVisibleSteps[stepIndex];

    setResults(newVisibleSteps);
    setChartData(generateChartData(newVisibleSteps, config.equation, config.initialGuess));

    const converged = lastVisibleStep.error < config.tolerance;
    const maxIterReached = lastVisibleStep.iteration >= config.maxIterations;
    const isNowFinished = converged || maxIterReached;
    
    setCalculationState({ ...calculationState, x: lastVisibleStep.gxi, iteration: lastVisibleStep.iteration, isFinished: isNowFinished });

    if (isNowFinished) {
        setStepExplanation(`Lompat ke iterasi akhir (${lastVisibleStep.iteration}). Perhitungan selesai.`);
        setStepByStepBreakdown(null);
    } else {
        setStepExplanation(`Lompat ke akhir iterasi ${lastVisibleStep.iteration}. Lihat di bawah cara menghitung iterasi berikutnya.`);
        const nextBreakdown = generateStepBreakdown(lastVisibleStep.gxi, lastVisibleStep.iteration, config.equation);
        setStepByStepBreakdown(nextBreakdown);
    }
  };

  const handleReset = (resetForm = true) => {
    setResults([]);
    setChartData([]);
    setError("");
    setCalculationState(null);
    setStepExplanation("");
    setStepByStepBreakdown(null);
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
            <Button onClick={handleFindGx} loading={isFindingGx} leftSection={<Sparkle size={18} />}>
              Cari g(x)
            </Button>
          </Group>
          {aiError && <Alert color="red" title="AI Error" mt="md">{aiError}</Alert>}
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
                  label="Fungsi g(x) untuk x = g(x)"
                  {...form.getInputProps("equation")}
                  description="Gunakan fungsi dari AI atau masukkan manual."
                />
                <NumberInput mt="md" label="Tebakan Awal (x0)" {...form.getInputProps("initialGuess")} step={0.1} precision={6} />
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
                <Text fw={500} mb="xs">Status Kalkulasi</Text>
                <Text size="sm" c="dimmed">{stepExplanation}</Text>
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
          
          {/* Render the full iteration breakdown here. */}
          {stepByStepBreakdown && <FullIterationExplanation breakdown={stepByStepBreakdown} />}

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