import { useState } from "react";
import type { TableBlock } from "@rindrics/tblparse";

function App() {
	const [blocks, setBlocks] = useState<TableBlock[]>([]);
	const [fileName, setFileName] = useState<string>("");

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setFileName(file.name);

		// Dynamic import to avoid SSR issues with xlsx
		const XLSX = await import("xlsx");
		const { detectTableBlocks } = await import("@rindrics/tblparse");

		const arrayBuffer = await file.arrayBuffer();
		const workbook = XLSX.read(arrayBuffer, { type: "array" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];

		const detectedBlocks = detectTableBlocks(sheet);
		setBlocks(detectedBlocks);
	};

	return (
		<div className="container">
			<header className="header">
				<h1>tblparse Demo</h1>
				<p className="subtitle">Excel/CSV ファイルからテーブルブロックを検出</p>
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
						<span className="file-input-button">ファイルを選択</span>
						{fileName && <span className="file-name">{fileName}</span>}
					</label>
				</section>

				{blocks.length > 0 && (
					<section className="results-section">
						<h2>検出されたブロック: {blocks.length}件</h2>
						<div className="blocks-grid">
							{blocks.map((block, index) => (
								<div key={`block-${block.startRow}`} className="block-card">
									<div className="block-header">
										<span className="block-number">Block {index + 1}</span>
										<span className="block-range">
											行 {block.startRow} - {block.endRow}
										</span>
									</div>
									<div className="block-stats">
										<div className="stat">
											<span className="stat-label">行数</span>
											<span className="stat-value">{block.rows.length}</span>
										</div>
										<div className="stat">
											<span className="stat-label">最大列数</span>
											<span className="stat-value">{block.maxColumnCount}</span>
										</div>
									</div>
									<div className="block-rows">
										{block.rows.slice(0, 5).map((row) => (
											<div key={`row-${row.row}`} className="row-item">
												<span className="row-number">#{row.row}</span>
												<span className="row-label">
													{row.labelValue || "(empty)"}
												</span>
												<span className="row-cols">{row.columnCount}列</span>
											</div>
										))}
										{block.rows.length > 5 && (
											<div className="row-more">
												... 他 {block.rows.length - 5} 行
											</div>
										)}
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
						href="https://github.com/rindrics/muramasa"
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

export default App;
