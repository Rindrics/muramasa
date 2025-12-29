import type { TableBlock } from "@rindrics/tblparse";
import { useState } from "react";
import type { WorkSheet } from "xlsx";

interface BlockWithData {
	block: TableBlock;
	title: string | undefined;
	data: string[][];
}

function App() {
	const [blocksWithData, setBlocksWithData] = useState<BlockWithData[]>([]);
	const [fileName, setFileName] = useState<string>("");

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setFileName(file.name);

		const XLSX = await import("xlsx");
		const { detectTableBlocks, analyzeBlockStructure } = await import(
			"@rindrics/tblparse"
		);

		const arrayBuffer = await file.arrayBuffer();
		const workbook = XLSX.read(arrayBuffer, { type: "array" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];

		const detectedBlocks = detectTableBlocks(sheet);

		// Extract cell data for each block
		const blocksData = detectedBlocks.map((block) => {
			const structure = analyzeBlockStructure(block);
			const data = extractBlockData(XLSX, sheet, block);
			return {
				block,
				title: structure.titleRow?.labelValue,
				data,
			};
		});

		setBlocksWithData(blocksData);
	};

	return (
		<div className="container">
			<header className="header">
				<h1>tblparse Demo</h1>
				<p className="subtitle">Detect table blocks from Excel/CSV files</p>
			</header>

			<main className="main">
				<section className="upload-section">
					<label className="file-input-label">
						<input
							type="file"
							accept=".xlsx,.xls,.csv"
							onChange={handleFileChange}
							className="file-input"
						/>
						<span className="file-input-button">Select file</span>
						{fileName && <span className="file-name">{fileName}</span>}
					</label>
				</section>

				{blocksWithData.length > 0 && (
					<section className="results-section">
						<h2>Detected {blocksWithData.length} blocks</h2>
						<div className="blocks-list">
							{blocksWithData.map(({ block, title, data }, index) => (
								<div key={`block-${block.startRow}`} className="block-card">
									<div className="block-header">
										<span className="block-title">
											{title || `Block ${index + 1}`}
										</span>
										<span className="block-range">
											Rows {block.startRow} - {block.endRow}
										</span>
									</div>
									<div className="table-wrapper">
										<table className="data-table">
											<tbody>
												{(title ? data.slice(1) : data).map((row, rowIdx) => (
													<tr key={`row-${block.startRow}-${rowIdx}`}>
														{row.map((cell, colIdx) => (
															<td
																key={`cell-${block.startRow}-${rowIdx}-${colIdx}`}
															>
																{cell}
															</td>
														))}
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							))}
						</div>
					</section>
				)}
			</main>

			<footer className="footer">
				<p>
					Powered by{" "}
					<a
						href="https://www.npmjs.com/package/@rindrics/tblparse"
						target="_blank"
						rel="noopener noreferrer"
					>
						@rindrics/tblparse
					</a>
				</p>
			</footer>
		</div>
	);
}

function extractBlockData(
	XLSX: typeof import("xlsx"),
	sheet: WorkSheet,
	block: TableBlock,
): string[][] {
	const data: string[][] = [];

	for (let row = block.startRow; row <= block.endRow; row++) {
		const rowData: string[] = [];
		for (let col = 0; col < block.maxColumnCount; col++) {
			const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col });
			const cell = sheet[cellAddress];
			rowData.push(cell?.v !== undefined ? String(cell.v) : "");
		}
		data.push(rowData);
	}

	return data;
}

export default App;
