import React from "react";
import { Paper, Title, Text, Divider, Alert } from "@mantine/core";
import { Lightbulb } from "@phosphor-icons/react";
import Latex from "react-latex";
import { derivative, parse } from "mathjs";

const FormulaExplanation = ({ equation }) => {
  let derivativeStr = "";
  try {
    const expr = parse(equation);
    const derivativeExpr = derivative(expr, "x");
    derivativeStr = derivativeExpr.toString();
  } catch (error) {
    derivativeStr = "Error dalam menghitung turunan";
  }

  // Safe LaTeX rendering function
  const SafeLatex = ({ children, displayMode = false }) => {
    try {
      return <Latex displayMode={displayMode}>{children}</Latex>;
    } catch (error) {
      console.error("LaTeX rendering error:", error);
      return <span>{children.replace(/\$|\{|\}/g, "")}</span>;
    }
  };

  return (
    <Paper shadow="sm" p="md" radius="md" mb="md">
      <Title order={4} mb="md">
        📚 Penjelasan Metode Newton-Raphson
      </Title>

      <Alert icon={<Lightbulb size={16} />} color="blue" mb="md">
        <Text fw={500} mb="xs">
          Konsep Dasar:
        </Text>
        <Text size="sm">
          Metode Newton-Raphson menggunakan garis singgung untuk mendekati akar
          persamaan. Setiap iterasi memberikan tebakan yang lebih baik!
        </Text>
      </Alert>

      <div className="space-y-4">
        <div>
          <Text fw={500} mb="xs">
            1. Rumus Newton-Raphson:
          </Text>
          <div className="bg-gray-50 p-3 rounded text-center">
            <SafeLatex displayMode={true}>
              {`$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$$`}
            </SafeLatex>
          </div>
        </div>

        <div>
          <Text fw={500} mb="xs">
            2. Untuk persamaan Anda:
          </Text>
          <div className="bg-blue-50 p-3 rounded">
            <Text size="sm" mb="xs">
              <SafeLatex>{`$f(x) = ${equation}$`}</SafeLatex>
            </Text>
            <Text size="sm">
              <SafeLatex>{`$f'(x) = ${derivativeStr}$`}</SafeLatex>
            </Text>
          </div>
        </div>

        <div>
          <Text fw={500} mb="xs">
            3. Langkah-langkah:
          </Text>
          <div className="bg-green-50 p-3 rounded">
            <ol className="text-sm space-y-1">
              <li>1. Mulai dengan tebakan awal x₀</li>
              <li>2. Hitung f(xₙ) dan f'(xₙ)</li>
              <li>3. Gunakan rumus: xₙ₊₁ = xₙ - f(xₙ)/f'(xₙ)</li>
              <li>4. Ulangi sampai error &lt; toleransi</li>
            </ol>
          </div>
        </div>

        <Divider />

        <div className="bg-yellow-50 p-3 rounded">
          <Text fw={500} size="sm" mb="xs">
            ⚠️ Hal yang Perlu Diperhatikan:
          </Text>
          <ul className="text-sm space-y-1">
            <li>• Turunan tidak boleh nol (f'(x) ≠ 0)</li>
            <li>• Tebakan awal mempengaruhi konvergensi</li>
            <li>• Metode mungkin tidak konvergen untuk semua fungsi</li>
          </ul>
        </div>
      </div>
    </Paper>
  );
};

export default FormulaExplanation;
