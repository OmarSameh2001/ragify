"use client";
import { TablePagination } from "@mui/material";
import { useState } from "react";

export default function CustomTablePagination({ dataLength }: any) {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const handleChangePage = (event: any, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  return (
    <TablePagination
      rowsPerPageOptions={[5, 10, 25, 100]}
      component="div"
      count={dataLength}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      className="pagination"
    />
  );
}
