import React from "react";
import { Paper, Title, Table, Text, ScrollArea, Badge } from "@mantine/core";
import Latex from "react-latex";

const IterationTable = ({ data }) => {
  const formatNumber = (num) => {
    if (Math.abs(num) < 0.000001) {
      return num.toExponential(3);
    }
    return num.toFixed(6);
  };

  const getErrorColor = (error) => {
    if (error < 0.001) return "green";
    if (error < 0.01) return "yellow";
    return "red";
  };

  // Safe LaTeX rendering function
  const SafeLatex = ({ children }) => {
    try {
      return <Latex>{children}</Latex>;
    } catch (error) {
      console.error("LaTeX rendering error:", error);
      return <span>{children.replace(/\$|\{|\}/g, "")}</span>;
    }
  };

  return (
    <Paper shadow="sm" p="md" radius="md" mb="md">
      <Title order={4} mb="md">
        📊 Tabel Iterasi Newton-Raphson
      </Title>

      <Text size="sm" c="dimmed" mb="md">
        Setiap baris menunjukkan satu langkah iterasi dalam proses pencarian
        akar
      </Text>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta="center">Iterasi</Table.Th>
              <Table.Th ta="center">
                <SafeLatex>{"$x_n$"}</SafeLatex>
              </Table.Th>
              <Table.Th ta="center">
                <SafeLatex>{"$f(x_n)$"}</SafeLatex>
              </Table.Th>
              <Table.Th ta="center">
                <SafeLatex>{"$f'(x_n)$"}</SafeLatex>
              </Table.Th>
              <Table.Th ta="center">
                <SafeLatex>{"$x_{n+1}$"}</SafeLatex>
              </Table.Th>
              <Table.Th ta="center">Error</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row, index) => (
              <Table.Tr key={index}>
                <Table.Td ta="center">
                  <Badge variant="light" color="blue">
                    {row.iteration}
                  </Badge>
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.x)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.fx)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.fpx)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.xNext)}
                </Table.Td>
                <Table.Td ta="center">
                  <Badge
                    variant="light"
                    color={getErrorColor(row.error)}
                    size="sm"
                  >
                    {formatNumber(row.error)}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <Text size="sm" fw={500} mb="xs">
          🔍 Cara Membaca Tabel:
        </Text>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • <SafeLatex>{"$x_n$"}</SafeLatex>: Nilai tebakan pada iterasi ke-n
          </li>
          <li>
            • <SafeLatex>{"$f(x_n)$"}</SafeLatex>: Nilai fungsi pada titik
            tersebut
          </li>
          <li>
            • <SafeLatex>{"$f'(x_n)$"}</SafeLatex>: Nilai turunan (kemiringan
            garis singgung)
          </li>
          <li>
            • <SafeLatex>{"$x_{n+1}$"}</SafeLatex>: Tebakan baru menggunakan
            rumus Newton-Raphson
          </li>
          <li>
            • Error: Selisih antara <SafeLatex>{"$x_{n+1}$"}</SafeLatex> dan{" "}
            <SafeLatex>{"$x_n$"}</SafeLatex>
          </li>
        </ul>
      </div>
    </Paper>
  );
};

export default IterationTable;
