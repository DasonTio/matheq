import React, { useState, useRef } from "react";
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
  Tabs,
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
    .replace(/(\d)\s*\(\s*x\^(\d+)\s*\)/g, (m, coef, pow) => `${coef}*Math.pow(x,${pow})`)
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
      // Handle constants
      .replace(/Math\.PI/g, "π")
      .replace(/Math\.E/g, "e")
      
      // Handle functions
      .replace(/Math\.log10\(/g, "log(")
      .replace(/Math\.log\(/g, "ln(")
      .replace(/Math\.sin\(/g, "sin(")
      .replace(/Math\.cos\(/g, "cos(")
      .replace(/Math\.tan\(/g, "tan(")
      .replace(/Math\.sqrt\(/g, "√(")
      
      // Handle exponents - convert ^2 to superscript
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³")
      .replace(/\^(\d+)/g, (match, num) => {
        const superscriptMap = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
        return num.split('').map(digit => superscriptMap[digit] || digit).join('');
      })
      
      // Handle multiplication
      .replace(/\*/g, " ⋅ ")
      
      // Handle division  
      .replace(/\//g, " ÷ ")
      
      // Clean up extra spaces
      .replace(/\s+/g, " ")
      .trim();
  } catch (error) {
    return expr;
  }
}

function safeEval(expr, x) {
  try {
    // eslint-disable-next-line no-new-func
    return Function("x", `return ${expr}`)(x);
  } catch {
    return NaN;
  }
}

function generateChartData(expr, a, b, points = 100) {
  const step = (b - a) / (points - 1);
  return Array.from({ length: points }, (_, i) => {
    const x = a + i * step;
    return { x: Number(x.toFixed(6)), y: safeEval(expr, x) };
  });
}

// Updated function to handle both Bisection and Regula Falsi methods
function rootFindingSteps(expr, a, b, tol = 1e-6, maxSteps = 20, method = "bisection") {
  const steps = [];
  let fa = safeEval(expr, a);
  let fb = safeEval(expr, b);

  if (isNaN(fa) || isNaN(fb) || fa * fb > 0) return [];

  for (let i = 0; i < maxSteps; i++) {
    let c;
    
    // The main difference between the two methods
    if (method === "bisection") {
      c = (a + b) / 2;
    } else { // regula-falsi
      c = (a * fb - b * fa) / (fb - fa);
    }
    
    const fc = safeEval(expr, c);

    steps.push({
      step: i + 1,
      a: Number(a.toFixed(6)),
      b: Number(b.toFixed(6)),
      c: Number(c.toFixed(6)),
      fa: Number(fa.toFixed(6)),
      fb: Number(fb.toFixed(6)),
      fc: Number(fc.toFixed(6)),
      interval: [a, b],
      chosen: fa * fc < 0 ? "left" : "right",
      method: method,
    });

    if (Math.abs(fc) < tol || Math.abs(b - a) < tol) break;

    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
  }
  return steps;
}

// Changed back to the original default expression you requested
const defaultExpr = "-0.9*x^2 + 1.7*x + 2.5";

export default function MetodeAkarPersamaan() {
  const [method, setMethod] = useState("bisection");
  const [expr, setExpr] = useState(defaultExpr);
  const [a, setA] = useState(2.8); // Changed back to original values
  const [b, setB] = useState(3);   // Changed back to original values
  const [tol, setTol] = useState(1e-6); // Changed back to original tolerance
  const [maxSteps, setMaxSteps] = useState(20);
  const [steps, setSteps] = useState([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [zoomDomain, setZoomDomain] = useState(null);
  
  const textareaRef = useRef(null);
  const parsedExpr = parseMathExpr(expr);

  // Generate chart data
  const chartMargin = Math.abs(b - a) * 0.3;
  const chartA = Math.min(a, b) - chartMargin;
  const chartB = Math.max(a, b) + chartMargin;
  const chartData = generateChartData(parsedExpr, chartA, chartB, 10);

  const [brushRange, setBrushRange] = useState([0, chartData.length - 1]);

  // After you update chartData (e.g., after setExpr, setA, setB, etc)
  React.useEffect(() => {
    setZoomDomain(null);
    setBrushRange([0, chartData.length - 1]);
  }, [expr, a, b]);


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
    setHasSubmitted(true); // <-- add this
    const s = rootFindingSteps(
      parsedExpr,
      Number(a),
      Number(b),
      Number(tol),
      Number(maxSteps),
      method
    );
    setSteps(s);
    setCurrentIteration(0);
    setShowKeyboard(false);
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    setSteps([]); // Clear previous results when switching methods
    setCurrentIteration(0);
  };

  const currentStep = steps[currentIteration] || {};
  const finalRoot = steps.length > 0 ? steps[steps.length - 1].c : null;

  // Method-specific configurations
  const methodConfig = {
    bisection: {
      title: "Metode Biseksi (Bisection Method)",
      formula: "c = (a + b) / 2",
      description: "Membagi interval menjadi dua bagian sama besar"
    },
    "regula-falsi": {
      title: "Metode Regula Falsi (False Position Method)", 
      formula: "c = (a⋅f(b) - b⋅f(a)) / (f(b) - f(a))",
      description: "Menggunakan interpolasi linear untuk menentukan titik potong"
    }
  };

  const getCCalculationText = () => {
    if (method === "bisection") {
      return `c = (a + b) / 2 = (${currentStep.a} + ${currentStep.b}) / 2 = ${currentStep.c}`;
    } else {
      return `c = (a⋅f(b) - b⋅f(a)) / (f(b) - f(a)) = (${currentStep.a}⋅${currentStep.fb} - ${currentStep.b}⋅${currentStep.fa}) / (${currentStep.fb} - ${currentStep.fa}) = ${currentStep.c}`;
    }
  };


  return (
    <Container size="xl" py="xl">
      <Paper shadow="md" radius="lg" p="xl" withBorder>
        {/* Method Selection Tabs */}
        <Tabs value={method} onChange={handleMethodChange} mb="xl">
          <Tabs.List position="center">
            <Tabs.Tab value="bisection">Metode Biseksi</Tabs.Tab>
            <Tabs.Tab value="regula-falsi">Metode Regula Falsi</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Title align="center" order={2} mb="md">
          {methodConfig[method].title}
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
                placeholder="Contoh: -0.9*x^2 + 1.7*x + 2.5"
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
                label="Batas bawah (a) *"
                value={a}
                onChange={setA}
                precision={4}
                step={0.1}
                required
              />
              <NumberInput
                label="Batas atas (b) *"
                value={b}
                onChange={setB}
                precision={4}
                step={0.1}
                required
              />
            </Group>

            <Group grow>
              <NumberInput
                label="Toleransi (e) *"
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
              Hitung
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
          </Paper>
        )}

        {/* Display error message if no valid interval */}
        {hasSubmitted && steps.length === 0 && expr && a && b && (
          <Paper p="md" mt="md" withBorder style={{ backgroundColor: "#fff5f5" }}>
            <Group position="center">
              <Text size="lg" weight={600} color="red">
                Error: f(a) × f(b) harus &lt; 0 untuk metode ini!
              </Text>
            </Group>
            <Text align="center" size="sm" color="dimmed" mt="xs">
              f({a}) = {safeEval(parsedExpr, a).toFixed(6)}, f({b}) = {safeEval(parsedExpr, b).toFixed(6)}
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
                    {method === "bisection" ? "Biseksi" : "Regula Falsi"}
                  </Badge>
                </Group>
                <Divider mb="md" />
                
                <Stack spacing="md">
                  <Text>
                    <strong>Langkah 1.</strong> f(a) = f({currentStep.a}) = {currentStep.fa}
                  </Text>
                  <Text>
                    <strong>Langkah 2.</strong> f(b) = f({currentStep.b}) = {currentStep.fb}
                  </Text>
                  <Text>
                    <strong>Langkah 3.</strong> {getCCalculationText()}
                  </Text>
                  <Text>
                    <strong>Langkah 4.</strong> f(c) = f({currentStep.c}) = {currentStep.fc}
                  </Text>
                  
                  {/* Show convergence check */}
                  <Box p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
                    <Text size="sm">
                      <strong>Cek konvergensi:</strong> |f(c)| = |{currentStep.fc}| = {Math.abs(currentStep.fc).toFixed(6)}
                    </Text>
                    <Text size="xs" color={Math.abs(currentStep.fc) < tol ? "green" : "orange"}>
                      {Math.abs(currentStep.fc) < tol 
                        ? `✓ |f(c)| < ${tol} → Konvergen!` 
                        : `✗ |f(c)| ≥ ${tol} → Lanjut iterasi`
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
                      domain={zoomDomain ? zoomDomain : [chartA, chartB]}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value?.toFixed(4), "f(x)"]}
                      labelFormatter={(value) => `x = ${value?.toFixed(4)}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="y"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />
                    {/* Reference lines */}
                    <ReferenceLine x={0} stroke="#000" strokeDasharray="2 2" />
                    <ReferenceLine y={0} stroke="#000" strokeDasharray="2 2" />
                    <ReferenceLine
                      x={currentStep.a}
                      stroke="green"
                      strokeWidth={3}
                      label={{ value: `a = ${currentStep.a}`, position: "topLeft" }}
                    />
                    <ReferenceLine
                      x={currentStep.b}
                      stroke="orange"
                      strokeWidth={3}
                      label={{ value: `b = ${currentStep.b}`, position: "topRight" }}
                    />
                    <ReferenceLine
                      x={currentStep.c}
                      stroke="red"
                      strokeWidth={3}
                      label={{ value: `c = ${currentStep.c}`, position: "top" }}
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
                    ? `Interval: [${currentStep.a}, ${currentStep.b}] | Metode: ${method === "bisection" ? "Biseksi" : "Regula Falsi"}`
                    : "Grafik fungsi f(x)"
                  }
                </Text>
              </Paper>
            </Grid.Col>

            {/* Right Side - Method-specific explanation */}
            <Grid.Col span={12} md={5}>
              <Card shadow="sm" radius="md" p="lg" withBorder>
                <Title order={4} mb="md">{methodConfig[method].title.split(' (')[0]}</Title>
                <Divider mb="md" />
                
                <Stack spacing="sm">
                  <Text size="sm">
                    <strong>Syarat:</strong> f(a) × f(b) &lt; 0
                  </Text>
                  
                  <Text size="sm">
                    <strong>Formula:</strong> {methodConfig[method].formula}
                  </Text>
                  
                  <Text size="xs" color="dimmed">
                    {methodConfig[method].description}
                  </Text>
                  
                  <Text size="sm">
                    <strong>Langkah-langkah:</strong>
                  </Text>
                  
                  <Box pl="md">
                    <Text size="sm">1. Hitung f(a) dan f(b)</Text>
                    <Text size="sm">2. Tentukan c menggunakan formula</Text>
                    <Text size="sm">3. Hitung f(c)</Text>
                    <Text size="sm">4. Pilih interval baru:</Text>
                    <Box pl="md">
                      <Text size="xs" color="dimmed">• Jika f(a) × f(c) &lt; 0 → [a, c]</Text>
                      <Text size="xs" color="dimmed">• Jika f(c) × f(b) &lt; 0 → [c, b]</Text>
                    </Box>
                    <Text size="sm">5. Ulangi hingga |f(c)| &lt; toleransi</Text>
                  </Box>
                  
                  <Divider my="sm" />
                  
                  <Text size="sm">
                    <strong>Status saat ini:</strong>
                  </Text>
                  <Text size="xs" color="dimmed">
                    f(a) × f(c) = {(currentStep.fa * currentStep.fc).toFixed(6)}
                  </Text>
                  <Text size="xs" color="dimmed">
                    f(c) × f(b) = {(currentStep.fc * currentStep.fb).toFixed(6)}
                  </Text>
                  <Text size="xs" weight={500} color={currentStep.chosen === "left" ? "green" : "orange"}>
                    Pilih interval: {currentStep.chosen === "left" ? "[a, c]" : "[c, b]"}
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
                          c = {step.c}
                        </Text>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        )}
      </Paper>
    </Container>
  );
}
