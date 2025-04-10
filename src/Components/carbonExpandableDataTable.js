import React, { useState } from "react";
import {
    DataTable,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableExpandRow,
    TableExpandedRow,
    TableExpandHeader,
    TextInput
    //TableCell
  } from "@carbon/react";
//import "@carbon/react/css/styles.css"; // Import Carbon styles

const headers = [
  { key: "name", header: "Name" },
  { key: "age", header: "Age" },
  { key: "location", header: "Location" },
];

const initialRows = [
  { id: "1", name: "Alice", age: 28, location: "New York" },
  { id: "2", name: "Bob", age: 34, location: "San Francisco" },
  { id: "3", name: "Charlie", age: 25, location: "Chicago" },
];

const ExpandableDataTable = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = initialRows.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <TableContainer title="Expandable Data Table">
      <TextInput
        id="search"
        labelText="Search"
        placeholder="Type to search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />
      <DataTable
        rows={filteredRows}
        headers={headers}
        render={({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                <TableExpandHeader />
                {headers.map((header) => (
                  <TableHeader key={header.key} {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableExpandRow {...getRowProps({ row })}>
                    {/* <TableCell /> */}
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableExpandRow>
                  {row.isExpanded && (
                    <TableExpandedRow colSpan={headers.length + 1}>
                      {/* <TableCell colSpan={headers.length + 1}> */}
                        Additional details about {row.id}
                      {/* </TableCell> */}
                    </TableExpandedRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      />
    </TableContainer>
  );
};

export default ExpandableDataTable;
