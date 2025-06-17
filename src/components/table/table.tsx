import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ChatButton, DeleteButton } from "./tableButtons";
import CustomTablePagination from "./tablePagination";

type fileDataType = {
  name: string;
  date: string;
  chunks: string[];
  id: number;
  texts: string[];
};
export default function FilesTable({
  tableData,
  indexed,
  refetchLocal,
  refetchIndex,
  sessionId,
}: {
  tableData: fileDataType[];
  indexed: string[];
  refetchLocal: () => void;
  refetchIndex: () => void;
  sessionId: string;
}) {
  const isLight = true;
  if (indexed && indexed.length > 0)
    console.log(
      tableData[0].name,
      indexed,
      indexed.some((value) => value === tableData[0].name)
    );
  return (
    <div>
      <Paper className="meetings-paper">
        <TableContainer className="table-container">
          <Table
            stickyHeader
            aria-label="meetings table"
            style={{
              borderTop: "2px solid #ccc",
              borderBottom: "2px solid #ccc",
            }}
          >
            <TableHead>
              {/* Apply styles directly to TableCells instead of TableRow */}
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Date Added</TableCell>
                <TableCell>Chunks</TableCell>
                {/* <TableCell>Link</TableCell> */}
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData &&
                tableData.map((file: fileDataType, index: number) => (
                  <TableRow
                    key={file.date}
                    className={index % 2 === 0 ? "row-even" : "row-odd"}
                    style={{
                      backgroundColor: isLight
                        ? index % 2 === 0
                          ? "#ffffff"
                          : "#f9f9f9"
                        : "#121212",
                    }}
                  >
                    <TableCell style={{ color: isLight ? "black" : "white" }}>
                      {file.name}
                    </TableCell>
                    <TableCell style={{ color: isLight ? "black" : "white" }}>
                      {file.date
                        ? new Date(file.date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell style={{ color: isLight ? "black" : "white" }}>
                      {file.chunks ? file.chunks.length : 0}
                    </TableCell>
                    <TableCell style={{ color: isLight ? "black" : "white" }}>
                      <DeleteButton
                        id={file.id}
                        disabled={!file.chunks || file.chunks.length === 0}
                        aria-label="Delete file"
                        refetch={refetchLocal}
                      />
                      <ChatButton
                        disabled={
                          !(
                            indexed &&
                            indexed.some((value) => value === tableData[0].name)
                          )
                        }
                        chunks={file.chunks}
                        fileName={file.name}
                        sessionId={sessionId}
                        texts={file.texts}
                        refetch={refetchIndex}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <CustomTablePagination dataLength={tableData.length} />
        </TableContainer>
      </Paper>
    </div>
  );
}
