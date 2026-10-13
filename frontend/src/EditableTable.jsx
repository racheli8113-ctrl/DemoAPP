

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    themeQuartz,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const initialRows = [
    { name: "ישראל ישראלי", group: "משפחה", seats: 3 },
    { name: "משה כהן", group: "חברים", seats: 2 },
    { name: "דוד לוי", group: "עבודה", seats: 1 },
];

const columns = [
    { field: "name", headerName: "שם", editable: true },
    { field: "group", headerName: "קבוצה", editable: true },
    {
        field: "seats",
        headerName: "מספר מקומות",
        editable: true,
        cellDataType: "number",
    },
];

export default function EditableTable() {
    const [rows, setRows] = useState(initialRows);

    return (
        <div dir="rtl" style={{ height: 400, width: "100%" }}>
            <AgGridReact
                theme={themeQuartz}
                rowData={rows}
                columnDefs={columns}
                defaultColDef={{
                    sortable: true,
                    filter: true,
                    resizable: true,
                    flex: 1,
                    minWidth: 120,
                }}
                onCellValueChanged={(event) => {
                    setRows((previous) =>
                        previous.map((row) =>
                            row === event.data ? { ...event.data } : row
                        )
                    );
                }}
            />
        </div>
    );
}
