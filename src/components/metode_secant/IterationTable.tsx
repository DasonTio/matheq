import React from "react";
import { Paper, Title, Table, Text, ScrollArea, Badge } from "@mantine/core";

const IterationTable = ({ data }) => {
  const formatNumber = (num) => {
    if (Math.abs(num) < 0.000001) {
      return num.toExponential(3);
    }
    return num.toFixed(8);
  };

  const getErrorColor = (error) => {
    if (error < 0.000001) return "green";
    if (error < 0.001) return "yellow";
    return "red";
  };

  return (
    <Paper shadow="sm" p="md" radius="md" mb="md">
      <Title order={4} mb="md">
        📊 Tabel Iterasi Metode Secant
      </Title>

      <Text size="sm" c="dimmed" mb="md">
        Setiap baris menunjukkan satu langkah iterasi dalam proses pencarian akar
      </Text>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta="center">Iterasi</Table.Th>
              <Table.Th ta="center">x₍ₙ₋₁₎</Table.Th>
              <Table.Th ta="center">xₙ</Table.Th>
              <Table.Th ta="center">x₍ₙ₊₁₎</Table.Th>
              <Table.Th ta="center">f(x₍ₙ₋₁₎)</Table.Th>
              <Table.Th ta="center">f(xₙ)</Table.Th>
              <Table.Th ta="center">f(x₍ₙ₊₁₎)</Table.Th>
              <Table.Th ta="center">Gradien</Table.Th>
              <Table.Th ta="center">Error</Table.Th>
              <Table.Th ta="center">Error %</Table.Th>
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
                  {formatNumber(row.xPrev)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.xCurr)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.xNext)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.fPrev)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.fCurr)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.fNext)}
                </Table.Td>
                <Table.Td ta="center" ff="monospace">
                  {formatNumber(row.slope)}
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
                <Table.Td ta="center">
                  <Badge
                    variant="light"
                    color={getErrorColor(row.relativeError / 100)}
                    size="sm"
                  >
                    {row.relativeError.toFixed(4)}%
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <ul className="space-y-1">
            <li>• <strong>x₍ₙ₋₁₎, xₙ:</strong> Dua titik untuk aproksimasi gradien</li>
            <li>• <strong>x₍ₙ₊₁₎:</strong> Titik baru hasil metode secant</li>
            <li>• <strong>f(x):</strong> Nilai fungsi di titik tersebut</li>
            <li>• <strong>Gradien:</strong> Aproksimasi turunan menggunakan secant</li>
          </ul>
          <ul className="space-y-1">
            <li>• <strong>Error:</strong> |x₍ₙ₊₁₎ - xₙ| (error absolut)</li>
            <li>• <strong>Error %:</strong> Error relatif dalam persen</li>
            <li>• <strong>Warna Badge:</strong> Hijau = konvergen, Kuning = mendekati, Merah = jauh</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <Text size="sm" fw={500} mb="xs">
          💡 Interpretasi Metode Secant:
        </Text>
        <Text size="sm" c="dimmed">
          Setiap iterasi menggunakan dua titik terakhir untuk memperkirakan gradien, 
          kemudian mencari titik baru di mana garis secant memotong sumbu x. 
          Proses berulang hingga konvergensi tercapai.
        </Text>
      </div>
    </Paper>
  );
};

export default IterationTable;