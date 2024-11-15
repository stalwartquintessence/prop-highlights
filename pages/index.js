import Head from "next/head";
import { useState, useEffect, useRef } from "react";

export default function Home() {
	const [highlights, setHighlights] = useState([]);
	const [draggedItemIndex, setDraggedItemIndex] = useState(null);
	const inputRefs = useRef({});

	useEffect(() => {
		fetchHighlights();
	}, []);

	async function fetchHighlights() {
		try {
			const response = await fetch("/api/highlights");
			if (!response.ok) throw new Error("Failed to fetch highlights");
			const data = await response.json();
			setHighlights(data);
		} catch (error) {
			console.error("Fetch error:", error);
		}
	}

	async function handleAddHighlight() {
		try {
			const newHighlight = { text: "" };
			const response = await fetch("/api/highlights", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newHighlight),
			});
			if (!response.ok) throw new Error("Failed to add highlight");
			fetchHighlights();
		} catch (error) {
			console.error("Add error:", error);
		}
	}

	async function handleInputBlur(id) {
		try {
			const text = inputRefs.current[id]?.value || "";
			if (text) {
				setHighlights((prev) =>
					prev.map((highlight) =>
						highlight.id === id ? { ...highlight, text } : highlight
					)
				);
				const response = await fetch(`/api/highlights/${id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text }),
				});
				if (!response.ok) throw new Error("Failed to update highlight");
			}
		} catch (error) {
			console.error("Update error:", error);
		}
	}

	async function handleDelete(id) {
		try {
			const response = await fetch(`/api/highlights/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete highlight");
			fetchHighlights();
		} catch (error) {
			console.error("Delete error:", error);
		}
	}

	function handleDragStart(index) {
		setDraggedItemIndex(index);
		const item = document.querySelectorAll(".highlight-list__item")[index];
		item.classList.add("dragging");
	}

	function handleDragEnter(index) {
		const item = document.querySelectorAll(".highlight-list__item")[index];
		item.classList.add("drag-over");
	}

	function handleDragLeave(index) {
		const item = document.querySelectorAll(".highlight-list__item")[index];
		item.classList.remove("drag-over");
	}

	function handleDragOver(e) {
		e.preventDefault();
	}

	async function handleDrop(index) {
		try {
			const item = document.querySelectorAll(".highlight-list__item")[draggedItemIndex];
			item.classList.remove("dragging");

			if (draggedItemIndex !== null && draggedItemIndex !== index) {
				const reorderedHighlights = [...highlights];
				const draggedItem = reorderedHighlights[draggedItemIndex];
				reorderedHighlights.splice(draggedItemIndex, 1);
				reorderedHighlights.splice(index, 0, draggedItem);
				setHighlights(reorderedHighlights);
				await reorderHighlights(reorderedHighlights);
			}
			setDraggedItemIndex(null);
		} catch (error) {
			console.error("Reorder error:", error);
		}
	}

	async function reorderHighlights(updatedHighlights) {
		try {
			const response = await fetch("/api/highlights/reorder", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ highlights: updatedHighlights }),
			});
			if (!response.ok) throw new Error("Failed to reorder highlights");
		} catch (error) {
			console.error("Reorder error:", error);
		}
	}

	return (
		<div className="container">
			<Head>
				<title>Property Highlights</title>
			</Head>
			<div className="highlight-list__header">
				<p className="highlight-list__title">
					Property highlights
					<span>
						<img src="assets/info-icon.svg" alt="info icon" />
					</span>
				</p>
				<button
					className="highlight-list__add-btn"
					onClick={handleAddHighlight}
				>
					<img
						className="highlight-list__add-icon"
						src="assets/add-icon.svg"
						alt="add icon"
					/>
					Add Highlight
				</button>
			</div>

			{highlights.length > 0 && (
				<ul className="highlight-list__items">
					{highlights.map((highlight, index) => (
						<li
							key={highlight.id}
							className="highlight-list__item"
							draggable
							onDragStart={() => handleDragStart(index)}
							onDragOver={handleDragOver}
							onDrop={() => handleDrop(index)}
							onDragEnter={() => handleDragEnter(index)}
							onDragLeave={() => handleDragLeave(index)}
						>
							<img
								src="assets/drag-icon.svg"
								alt="drag icon"
								draggable="false"
							/>
							<input
								ref={(el) => (inputRefs.current[highlight.id] = el)}
								type="text"
								defaultValue={highlight.text}
								placeholder="New Highlight"
								onBlur={() => handleInputBlur(highlight.id)}
							/>
							<img
								className="highlight-list__delete-icon"
								src="assets/delete-icon.svg"
								alt="delete icon"
								draggable="false"
								onClick={() => handleDelete(highlight.id)}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}