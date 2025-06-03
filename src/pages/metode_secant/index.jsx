import React, { useState, useRef } from "react";
import { evaluate } from "mathjs";
import {
  Container,
  Paper,
  Title,
  NumberInput,
  Button,
  Group,
  Text,
  Stack,
  Box,
  Divider,
  Card,
  Grid,
  Badge,
  ActionIcon,
  Textarea,
} from "@mantine/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { Backspace } from "@phosphor-icons/react";

// Mathematical keyboard layout
const mathKeyboard = [
  [
    { label: "x", latex: "x", value: "x" },
    { label: "y", latex: "y", value: "y" },
    { label: "z", latex: "z", value: "z" },
    { label: "π", latex: "\\pi", value: "Math.PI" },
    { label: "e", latex: "e", value: "Math.E" },
  ],
  [
    { label: "ln", latex: "\\ln", value: "Math.log", needsParens: true },
    { label: "log", latex: "\\log", value: "Math.log10", needsParens: true },
    { label: "sin", latex: "\\sin", value: "Math.sin", needsParens: true },
    { label: "cos", latex: "\\cos", value: "Math.cos", needsParens: true },
    { label: "tan", latex: "\\tan", value: "Math.tan", needsParens: true },
  ],
  [
    { label: "√", latex: "\\sqrt{}", value: "Math.sqrt", needsParens: true },
    { label: "x²", latex: "x^2", value: "^2" },
    { label: "x³", latex: "x^3", value: "^3" },
    { label: "xⁿ", latex: "x^n", value: "^" },
    { label: "()", latex: "()", value: "()" },
  ],
  [
    { label: "7", latex: "7", value: "7" },
    { label: "8", latex: "8", value: "8" },
    { label: "9", latex: "9", value: "9" },
    { label: "÷", latex: "\\div", value: "/" },
    { label: "+", latex: "+", value: "+" },
  ],
  [
    { label: "4", latex: "4", value: "4" },
    { label: "5", latex: "5", value: "5" },
    { label: "6", latex: "6", value: "6" },
    { label: "×", latex: "\\times", value: "*" },
    { label: "−", latex: "-", value: "-" },
  ],
  [
    { label: "1", latex: "1", value: "1" },
    { label: "2", latex: "2", value: "2" },
    { label: "3", latex: "3", value: "3" },
    { label: ".", latex: ".", value: "." },
    { label: "0", latex: "0", value: "0" },
  ],
];

// Parse math expression for evaluation
function parseMathExpr(expr) {
  return expr
    .replace(/(\d)\s*\(\s*x\^(\d+)\s*\)/g, (m, coef, pow) => 
      `${coef}*Math.pow(x,${pow})`
    )
    .replace(/e\^\s*(-?\w+|\([^\)]+\))/g, (m, pow) => `Math.exp(${pow})`)
    .replace(/Math\.PI/g, Math.PI)
    .replace(/Math\.E/g, Math.E)
    .replace(/(\d*\.?\d*)x\^(\d+)/g, (m, coef, pow) =>
      `${coef === "" ? 1 : coef}*Math.pow(x,${pow})`
    )
    .replace(/(\d*\.?\d*)x/g, (m, coef) => 
      `${coef === "" ? 1 : coef}*x`
    )
    .replace(/x\^/g, "Math.pow(x,")
    .replace(/\^(\d+)/g, (m, pow) => `,${pow})`)
    .replace(/Math\.log\(/g, "Math.log(")
    .replace(/Math\.log10\(/g, "Math.log10(")
    .replace(/Math\.sin\(/g, "Math.sin(")
    .replace(/Math\.cos\(/g, "Math.cos(")
    .replace(/Math\.tan\(/g, "Math.tan(")
    .replace(/Math\.sqrt\(/g, "Math.sqrt(");
}

// Convert user input to readable math display
function userInputToMath(expr) {
  if (!expr || expr.trim() === "") return "";

  try {
    return expr
      .replace(/Math\.PI/g, "π")
      .replace(/Math\.E/g, "e")
      .replace(/Math\.log10\(/g, "log(")
      .replace(/Math\.log\(/g, "ln(")
      .replace(/Math\.sin\(/g, "sin(")
      .replace(/Math\.cos\(/g, "cos(")
      .replace(/Math\.tan\(/g, "tan(")
      .replace(/Math\.sqrt\(/g, "√(")
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³")
      .replace(/\^(\d+)/g, (match, num) => {
        const superscriptMap = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
        return num.split('').map(digit => superscriptMap[digit] || digit).join('');
      })
      .replace(/\*/g, " ⋅ ")
      .replace(/\//g, " ÷ ")
      .replace(/\s+/g, " ")
      .trim();
  } catch (error) {
    return expr;
  }
}

function safeEval(expr, x) {
  try {
    // mathjs supports implicit multiplication, e, ^, etc.
    // We define 'x' and 'e' in the scope for mathjs
    return evaluate(expr, { x, e: Math.E });
  } catch {
    return NaN;
  }
}

function generateChartData(expr, center, range = 2, points = 200) {
  const a = center - range;
  const b = center + range;
  const step = (b - a) / (points - 1);
  return Array.from({ length: points }, (_, i) => {
    const x = a + i * step;
    return { x: Number(x.toFixed(6)), y: safeEval(expr, x) };
  });
}

// Secant method implementation
function secantMethodSteps(expr, x0, x1, tol = 1e-6, maxSteps = 20) {
  const steps = [];
  let xPrev = x0;
  let xCurr = x1;

  for (let i = 0; i < maxSteps; i++) {
    const fPrev = safeEval(expr, xPrev);
    const fCurr = safeEval(expr, xCurr);

    if (isNaN(fPrev) || isNaN(fCurr)) break;

    const slope = (fCurr - fPrev) / (xCurr - xPrev);
    if (Math.abs(slope) < 1e-15) break;

    const xNext = xCurr - fCurr / slope;
    const fNext = safeEval(expr, xNext);

    steps.push({
      step: i + 1,
      xPrev: Number(xPrev.toFixed(8)),
      xCurr: Number(xCurr.toFixed(8)),
      xNext: Number(xNext.toFixed(8)),
      fPrev: Number(fPrev.toFixed(8)),
      fCurr: Number(fCurr.toFixed(8)),
      fNext: Number(fNext.toFixed(8)),
      slope: Number(slope.toFixed(8)),
      error: Math.abs(xNext - xCurr),
      relativeError: Math.abs((xNext - xCurr) / xNext) * 100
    });

    if (Math.abs(fNext) < tol || Math.abs(xNext - xCurr) < tol) break;

    xPrev = xCurr;
    xCurr = xNext;
  }

  return steps;
}

// Generate secant line data for visualization
function generateSecantLineData(slope, intercept, xStart, xEnd, points = 50) {
  const step = (xEnd - xStart) / (points - 1);
  return Array.from({ length: points }, (_, i) => {
    const x = xStart + i * step;
    return { 
      x: Number(x.toFixed(6)), 
      y: slope * x + intercept 
    };
  });
}

const defaultExpr = "x^2 - x - 1";

export default function MetodeSecant() {
  const [expr, setExpr] = useState(defaultExpr);
  const [x0, setX0] = useState(0.8);
  const [x1, setX1] = useState(0.9);
  const [tol, setTol] = useState(1e-6);
  const [maxSteps, setMaxSteps] = useState(20);
  const [steps, setSteps] = useState([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [zoomDomain, setZoomDomain] = useState(null);
  
  const textareaRef = useRef(null);

  // Generate chart data centered around the initial guesses
  const chartCenter = (x0 + x1) / 2;
  const chartRange = Math.max(2, Math.abs(x1 - x0) * 3);
  const chartData = generateChartData(expr, chartCenter, chartRange, 200);

  const [brushRange, setBrushRange] = useState([0, chartData.length - 1]);

  React.useEffect(() => {
    setZoomDomain(null);
    setBrushRange([0, chartData.length - 1]);
  }, [expr, x0, x1]);

  const handleKeyboardInput = (key) => {
    const { value, needsParens } = key;
    const before = expr.substring(0, cursorPosition);
    const after = expr.substring(cursorPosition);
    
    let newExpr;
    let newCursorPos;

    if (needsParens) {
      newExpr = before + value + "(" + after;
      newCursorPos = cursorPosition + value.length + 1;
    } else if (value === "()") {
      newExpr = before + "()" + after;
      newCursorPos = cursorPosition + 1;
    } else {
      newExpr = before + value + after;
      newCursorPos = cursorPosition + value.length;
    }

    setExpr(newExpr);
    setCursorPosition(newCursorPos);
  };

  const handleBackspace = () => {
    if (cursorPosition > 0) {
      const before = expr.substring(0, cursorPosition - 1);
      const after = expr.substring(cursorPosition);
      const newExpr = before + after;
      setExpr(newExpr);
      setCursorPosition(cursorPosition - 1);
    }
  };

  const handleBrushChange = (e) => {
    if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
      const startX = chartData[e.startIndex]?.x;
      const endX = chartData[e.endIndex]?.x;
      setZoomDomain([startX, endX]);
      setBrushRange([e.startIndex, e.endIndex]);
    } else {
      setZoomDomain(null);
      setBrushRange([0, chartData.length - 1]);
    }
  };

  const handleClear = () => {
    setExpr("");
    setCursorPosition(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    const s = secantMethodSteps(
      expr,
      Number(x0),
      Number(x1),
      Number(tol),
      Number(maxSteps)
    );
    setSteps(s);
    setCurrentIteration(0);
    setShowKeyboard(false);
  };

  const currentStep = steps[currentIteration] || {};
  const finalRoot = steps.length > 0 ? steps[steps.length - 1].xNext : null;

  // Generate secant line data for current iteration
  const secantLineData = currentStep.secantLine ? 
    generateSecantLineData(
      currentStep.slope,
      currentStep.secantLine.intercept,
      Math.min(currentStep.xPrev, currentStep.xCurr) - 0.5,
      Math.max(currentStep.xPrev, currentStep.xCurr) + 0.5
    ) : [];

  return (
    <Container size="xl" py="xl">
      <Paper shadow="md" radius="lg" p="xl" withBorder>
        <Title align="center" order={2} mb="md">
          Metode Secant (Secant Method)
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <div>
              <Text size="sm" weight={500} mb={4}>
                Fungsi f(x)
              </Text>
              
              {/* Math Display */}
              <Paper p="md" withBorder mb="sm" style={{ minHeight: 60, display: "flex", alignItems: "center" }}>
                {expr.trim() ? (
                  <Text size="lg" style={{ fontFamily: 'serif', fontSize: '18px' }}>
                    f(x) = {userInputToMath(expr)}
                  </Text>
                ) : (
                  <Text size="lg" color="dimmed">
                    Masukkan fungsi matematika...
                  </Text>
                )}
              </Paper>

              {/* Input Field */}
              <Textarea
                ref={textareaRef}
                placeholder="Contoh: x^2 - x - 1"
                value={expr}
                onChange={(e) => {
                  setExpr(e.target.value);
                  setCursorPosition(e.target.selectionStart);
                }}
                onClick={(e) => setCursorPosition(e.target.selectionStart)}
                onKeyUp={(e) => setCursorPosition(e.target.selectionStart)}
                minRows={2}
                required
              />

              <Group position="apart" mt="sm">
                <Button
                  variant="outline"
                  onClick={() => setShowKeyboard(!showKeyboard)}
                >
                  {showKeyboard ? "Sembunyikan" : "Tampilkan"} Keyboard Matematika
                </Button>
                <Group>
                  <Button variant="subtle" onClick={handleClear}>
                    Clear
                  </Button>
                  <ActionIcon onClick={handleBackspace} variant="subtle">
                    <Backspace size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              {/* Mathematical Keyboard */}
              {showKeyboard && (
                <Paper p="md" mt="md" withBorder>
                  <Text size="sm" weight={500} mb="md">
                    Keyboard Matematika
                  </Text>
                  <Stack spacing="xs">
                    {mathKeyboard.map((row, rowIndex) => (
                      <Group key={rowIndex} spacing="xs" position="center">
                        {row.map((key, keyIndex) => (
                          <Button
                            key={keyIndex}
                            variant="default"
                            size="sm"
                            onClick={() => handleKeyboardInput(key)}
                            style={{ minWidth: 50, height: 40 }}
                          >
                            {key.label}
                          </Button>
                        ))}
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              )}
            </div>

            {/* Parameter inputs */}
            <Group grow>
              <NumberInput
                label="Tebakan awal x₀ *"
                value={x0}
                onChange={setX0}
                precision={4}
                step={0.1}
                required
              />
              <NumberInput
                label="Tebakan kedua x₁ *"
                value={x1}
                onChange={setX1}
                precision={4}
                step={0.1}
                required
              />
            </Group>

            <Group grow>
              <NumberInput
                label="Toleransi (ε) *"
                value={tol}
                onChange={setTol}
                precision={6}
                step={0.001}
                min={0.000001}
                max={1}
                required
              />
              <NumberInput
                label="Maksimal Iterasi *"
                value={maxSteps}
                onChange={setMaxSteps}
                min={1}
                max={100}
                required
              />
            </Group>

            <Button type="submit" fullWidth size="lg">
              Hitung dengan Metode Secant
            </Button>
          </Stack>
        </form>

        {/* Display Root Result */}
        {finalRoot !== null && (
          <Paper p="md" mt="md" withBorder style={{ backgroundColor: "#e7f5ff" }}>
            <Group position="center">
              <Text size="lg" weight={600}>
                Akar yang ditemukan: 
              </Text>
              <Text size="xl" weight={700} color="blue">
                x ≈ {finalRoot}
              </Text>
            </Group>
            <Text align="center" size="sm" color="dimmed" mt="xs">
              Konvergen setelah {steps.length} iterasi
            </Text>
          </Paper>
        )}

        {/* Display error message if calculation fails */}
        {hasSubmitted && steps.length === 0 && expr && x0 !== null && x1 !== null && (
          <Paper p="md" mt="md" withBorder style={{ backgroundColor: "#fff5f5" }}>
            <Group position="center">
              <Text size="lg" weight={600} color="red">
                Error: Metode tidak konvergen atau terjadi pembagian dengan nol!
              </Text>
            </Group>
            <Text align="center" size="sm" color="dimmed" mt="xs">
              f({x0}) = {safeEval(parsedExpr, x0).toFixed(6)}, f({x1}) = {safeEval(parsedExpr, x1).toFixed(6)}
            </Text>
          </Paper>
        )}

        {steps.length > 0 && (
          <Grid mt="xl" gutter="xl" align="flex-start">
            <Grid.Col span={12} md={7}>
              <Card shadow="sm" radius="md" p="lg" withBorder>
                <Group position="apart" mb="md">
                  <Title order={4}>
                    Iterasi {currentStep.step} dari {steps.length}
                  </Title>
                  <Badge color="blue" variant="light">
                    Metode Secant
                  </Badge>
                </Group>
                <Divider mb="md" />
                
                <Stack spacing="md">
                  <Text>
                    <strong>Langkah 1.</strong> x₍ₙ₋₁₎ = {currentStep.xPrev}, f(x₍ₙ₋₁₎) = {currentStep.fPrev}
                  </Text>
                  <Text>
                    <strong>Langkah 2.</strong> xₙ = {currentStep.xCurr}, f(xₙ) = {currentStep.fCurr}
                  </Text>
                  <Text>
                    <strong>Langkah 3.</strong> Hitung gradien garis secant:
                  </Text>
                  <Box pl="md">
                    <Text size="sm" style={{ fontFamily: 'monospace' }}>
                      f'(xₙ) ≈ [f(xₙ) - f(x₍ₙ₋₁₎)] / [xₙ - x₍ₙ₋₁₎]
                    </Text>
                    <Text size="sm" style={{ fontFamily: 'monospace' }}>
                      f'({currentStep.xCurr}) ≈ [{currentStep.fCurr} - {currentStep.fPrev}] / [{currentStep.xCurr} - {currentStep.xPrev}]
                    </Text>
                    <Text size="sm" style={{ fontFamily: 'monospace' }}>
                      f'({currentStep.xCurr}) ≈ {currentStep.slope}
                    </Text>
                  </Box>
                  <Text>
                    <strong>Langkah 4.</strong> Hitung x₍ₙ₊₁₎ menggunakan rumus Secant:
                  </Text>
                  <Box pl="md">
                    <Text size="sm" style={{ fontFamily: 'monospace' }}>
                      x₍ₙ₊₁₎ = xₙ - f(xₙ) / f'(xₙ)
                    </Text>
                    <Text size="sm" style={{ fontFamily: 'monospace' }}>
                      x₍ₙ₊₁₎ = {currentStep.xCurr} - {currentStep.fCurr} / {currentStep.slope}
                    </Text>
                    <Text size="sm" style={{ fontFamily: 'monospace' }}>
                      x₍ₙ₊₁₎ = {currentStep.xNext}
                    </Text>
                  </Box>
                  <Text>
                    <strong>Langkah 5.</strong> f(x₍ₙ₊₁₎) = f({currentStep.xNext}) = {currentStep.fNext}
                  </Text>
                  
                  {/* Show convergence check */}
                  <Box p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
                    <Text size="sm">
                      <strong>Cek konvergensi:</strong>
                    </Text>
                    <Text size="xs">
                      |f(x₍ₙ₊₁₎)| = |{currentStep.fNext}| = {Math.abs(currentStep.fNext).toFixed(6)}
                    </Text>
                    <Text size="xs">
                      |x₍ₙ₊₁₎ - xₙ| = |{currentStep.xNext} - {currentStep.xCurr}| = {currentStep.error.toFixed(6)}
                    </Text>
                    <Text size="xs">
                      Error relatif = {currentStep.relativeError.toFixed(4)}%
                    </Text>
                    <Text size="xs" color={Math.abs(currentStep.fNext) < tol ? "green" : "orange"}>
                      {Math.abs(currentStep.fNext) < tol 
                        ? `✓ |f(x₍ₙ₊₁₎)| < ${tol} → Konvergen!` 
                        : `✗ |f(x₍ₙ₊₁₎)| ≥ ${tol} → Lanjut iterasi`
                      }
                    </Text>
                  </Box>
                </Stack>

                {/* Navigation Buttons */}
                <Group position="between" mt="lg">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setCurrentIteration(Math.max(0, currentIteration - 1))}
                    disabled={currentIteration === 0}
                  >
                    Sebelumnya
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => setCurrentIteration(Math.min(steps.length - 1, currentIteration + 1))}
                    disabled={currentIteration === steps.length - 1}
                  >
                    Selanjutnya
                  </Button>
                </Group>
              </Card>

              {/* Chart */}
              <Paper p="md" mt="md" withBorder>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setZoomDomain(null);
                    setBrushRange([0, chartData.length - 1]);
                  }}
                  style={{ marginBottom: 8 }}
                >
                  Reset Zoom
                </Button>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="x"
                      type="number"
                      domain={zoomDomain ? zoomDomain : ['dataMin', 'dataMax']}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value?.toFixed(4), "f(x)"]}
                      labelFormatter={(value) => `x = ${value?.toFixed(4)}`}
                    />
                    
                    {/* Function curve */}
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                      name="f(x)"
                    />
                    
                    {/* Secant line */}
                    {secantLineData.length > 0 && (
                      <Line
                        data={secantLineData}
                        type="monotone"
                        dataKey="y"
                        stroke="#ff7300"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Garis Secant"
                      />
                    )}
                    
                    {/* Reference lines */}
                    <ReferenceLine x={0} stroke="#000" strokeDasharray="2 2" />
                    <ReferenceLine y={0} stroke="#000" strokeDasharray="2 2" />
                    
                    {/* Current iteration points */}
                    <ReferenceLine
                      x={currentStep.xPrev}
                      stroke="green"
                      strokeWidth={3}
                      label={{ value: `x₍ₙ₋₁₎ = ${currentStep.xPrev}`, position: "topLeft" }}
                    />
                    <ReferenceLine
                      x={currentStep.xCurr}
                      stroke="orange"
                      strokeWidth={3}
                      label={{ value: `xₙ = ${currentStep.xCurr}`, position: "top" }}
                    />
                    <ReferenceLine
                      x={currentStep.xNext}
                      stroke="red"
                      strokeWidth={3}
                      label={{ value: `x₍ₙ₊₁₎ = ${currentStep.xNext}`, position: "topRight" }}
                    />
                    
                    <Brush
                      dataKey="x"
                      height={30}
                      stroke="#8884d8"
                      onChange={handleBrushChange}
                      startIndex={brushRange[0]}
                      endIndex={brushRange[1]}
                      travellerWidth={10}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <Text mt="md" size="sm" color="dimmed" align="center">
                  {steps.length > 0 
                    ? `Iterasi ${currentStep.step}: Garis secant menghubungkan (${currentStep.xPrev}, ${currentStep.fPrev}) dan (${currentStep.xCurr}, ${currentStep.fCurr})`
                    : "Grafik fungsi f(x)"
                  }
                </Text>
              </Paper>
            </Grid.Col>

            {/* Right Side - Method explanation */}
            <Grid.Col span={12} md={5}>
              <Card shadow="sm" radius="md" p="lg" withBorder>
                <Title order={4} mb="md">Metode Secant</Title>
                <Divider mb="md" />
                
                <Stack spacing="sm">
                  <Text size="sm">
                    <strong>Rumus:</strong> x₍ₙ₊₁₎ = xₙ - f(xₙ) × [xₙ - x₍ₙ₋₁₎] / [f(xₙ) - f(x₍ₙ₋₁₎)]
                  </Text>
                  
                  <Text size="sm">
                    <strong>Gradien Secant:</strong> f'(xₙ) ≈ [f(xₙ) - f(x₍ₙ₋₁₎)] / [xₙ - x₍ₙ₋₁₎]
                  </Text>
                  
                  <Text size="xs" color="dimmed">
                    Metode Secant menggunakan dua titik untuk memperkirakan gradien, 
                    tidak memerlukan turunan eksplisit seperti metode Newton-Raphson.
                  </Text>
                  
                  <Text size="sm">
                    <strong>Langkah-langkah:</strong>
                  </Text>
                  
                  <Box pl="md">
                    <Text size="sm">1. Mulai dengan dua tebakan x₀ dan x₁</Text>
                    <Text size="sm">2. Hitung f(x₀) dan f(x₁)</Text>
                    <Text size="sm">3. Hitung gradien garis secant</Text>
                    <Text size="sm">4. Hitung x₂ menggunakan rumus secant</Text>
                    <Text size="sm">5. Set x₀ = x₁, x₁ = x₂</Text>
                    <Text size="sm">6. Ulangi hingga konvergen</Text>
                  </Box>
                  
                  <Divider my="sm" />
                  
                  <Text size="sm">
                    <strong>Status iterasi saat ini:</strong>
                  </Text>
                  <Text size="xs" color="dimmed">
                    Gradien secant: {currentStep.slope?.toFixed(6)}
                  </Text>
                  <Text size="xs" color="dimmed">
                    Error absolut: {currentStep.error?.toFixed(6)}
                  </Text>
                  <Text size="xs" color="dimmed">
                    Error relatif: {currentStep.relativeError?.toFixed(4)}%
                  </Text>
                </Stack>
              </Card>

              {/* All iterations table */}
              <Card shadow="sm" radius="md" p="lg" withBorder mt="md">
                <Title order={5} mb="md">Semua Iterasi</Title>
                <Stack spacing="xs">
                  {steps.map((step, index) => (
                    <Box 
                      key={index}
                      p="xs" 
                      style={{ 
                        backgroundColor: index === currentIteration ? "#e7f5ff" : "transparent",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}
                      onClick={() => setCurrentIteration(index)}
                    >
                      <Group position="apart">
                        <Text size="sm" weight={500}>
                          Iterasi {step.step}
                        </Text>
                        <Text size="xs" color="dimmed">
                          x = {step.xNext}
                        </Text>
                      </Group>
                      <Text size="xs" color="dimmed">
                        Error: {step.error.toFixed(6)}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Card>

              {/* Convergence Analysis */}
              <Card shadow="sm" radius="md" p="lg" withBorder mt="md">
                <Title order={5} mb="md">Analisis Konvergensi</Title>
                <Stack spacing="xs">
                  <Text size="sm">
                    <strong>Orde konvergensi:</strong> ≈ 1.618 (Golden Ratio)
                  </Text>
                  <Text size="sm">
                    <strong>Kecepatan:</strong> Lebih cepat dari Bisection, lebih lambat dari Newton-Raphson
                  </Text>
                  <Text size="sm">
                    <strong>Keunggulan:</strong> Tidak memerlukan turunan fungsi
                  </Text>
                  <Text size="sm">
                    <strong>Kelemahan:</strong> Memerlukan dua tebakan awal
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        )}
      </Paper>
    </Container>
  );
}