import { Icons } from '@mezon/ui';
import { ImageSourceObject } from '@mezon/utils';
import React, { useEffect, useRef, useState } from 'react';

interface ImageEditorProps {
	imageSource: ImageSourceObject;
	onClose: () => void;
	setImageObject: React.Dispatch<React.SetStateAction<ImageSourceObject | null>>;
	setImageCropped: React.Dispatch<React.SetStateAction<File | null>>;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSource, onClose, setImageObject, setImageCropped }) => {
	const [zoom, setZoom] = useState<number>(1);
	const [rotation, setRotation] = useState<number>(0);
	const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
	const [dragging, setDragging] = useState<boolean>(false);
	const [start, setStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

	const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const bgCanvas = bgCanvasRef.current;
		const overlayCanvas = overlayCanvasRef.current;
		if (!bgCanvas || !overlayCanvas) return;

		const bgCtx = bgCanvas.getContext('2d');
		const overlayCtx = overlayCanvas.getContext('2d');
		if (!bgCtx || !overlayCtx) return;

		const img = new Image();
		img.src = imageSource?.url;
		img.onload = () => {
			bgCanvas.width = overlayCanvas.width = 500;
			bgCanvas.height = overlayCanvas.height = 500;
			setupCanvases(bgCanvas, overlayCanvas, img, zoom, rotation, offset);
		};
	}, [imageSource, zoom, rotation, offset]);
	const setupCanvases = (
		bgCanvas: HTMLCanvasElement,
		overlayCanvas: HTMLCanvasElement,
		img: HTMLImageElement,
		zoom: number,
		rotation: number,
		offset: { x: number; y: number }
	) => {
		const bgCtx = bgCanvas.getContext('2d')!;
		const overlayCtx = overlayCanvas.getContext('2d')!;

		// Clear the canvas before redrawing
		bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
		bgCtx.save();

		// Increase the default zoom level (e.g., 3 to enlarge the image more than usual)
		const baseZoomFactor = 1;
		const scaleX = (bgCanvas.width / img.width) * baseZoomFactor;
		const scaleY = (bgCanvas.height / img.height) * baseZoomFactor;
		const scaleFactor = Math.min(scaleX, scaleY) * zoom; // Take the smaller ratio to fit the image within the frame

		const imgWidth = img.width * scaleFactor;
		const imgHeight = img.height * scaleFactor;

		// Center the image within the canvas
		const centerX = bgCanvas.width / 2;
		const centerY = bgCanvas.height / 2;

		bgCtx.translate(centerX + offset.x, centerY + offset.y);
		bgCtx.rotate((rotation * Math.PI) / 180);
		bgCtx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
		bgCtx.restore();

		// *** Draw overlay ***
		overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
		overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

		// Remove the circular area in the center
		const radius = 140;
		overlayCtx.globalCompositeOperation = 'destination-out';
		overlayCtx.beginPath();
		overlayCtx.arc(overlayCanvas.width / 2, overlayCanvas.height / 2, radius, 0, Math.PI * 2);
		overlayCtx.fill();
		overlayCtx.globalCompositeOperation = 'source-over';

		// White border for the circular area
		overlayCtx.beginPath();
		overlayCtx.arc(overlayCanvas.width / 2, overlayCanvas.height / 2, radius, 0, Math.PI * 2);
		overlayCtx.strokeStyle = 'white';
		overlayCtx.lineWidth = 3;
		overlayCtx.stroke();
	};

	const handleZoom = (event: React.ChangeEvent<HTMLInputElement>) => {
		setZoom(parseFloat(event.target.value));
	};

	const handleWheelZoom = (event: WheelEvent) => {
		event.preventDefault();
		setZoom((prev) => Math.min(2, Math.max(0.5, prev - event.deltaY * 0.001)));
	};

	useEffect(() => {
		const canvas = bgCanvasRef.current;
		if (canvas) {
			canvas.addEventListener('wheel', handleWheelZoom);
			return () => canvas.removeEventListener('wheel', handleWheelZoom);
		}
	}, []);

	const handleRotate = () => {
		setRotation((prev) => prev + 90);
	};

	const handleReset = () => {
		setZoom(1);
		setRotation(0);
		setOffset({ x: 0, y: 0 });
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		setDragging(true);
		setStart({ x: e.clientX, y: e.clientY });
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!dragging) return;
		setOffset((prev) => ({
			x: prev.x + (e.clientX - start.x),
			y: prev.y + (e.clientY - start.y)
		}));
		setStart({ x: e.clientX, y: e.clientY });
	};

	const handleMouseUp = () => {
		setDragging(false);
	};

	const handleClose = () => {
		setImageObject(null);
		setDragging(false);
		onClose();
	};

	const handleApply = () => {
		const bgCanvas = bgCanvasRef.current;
		if (!bgCanvas) return;

		const tempCanvas = document.createElement('canvas');
		const ctx = tempCanvas.getContext('2d');
		if (!ctx) return;

		// Size of the cropped canvas
		const radius = 140;
		const diameter = radius * 2;
		tempCanvas.width = diameter;
		tempCanvas.height = diameter;

		// Determine the position of the circle on the original canvas
		const centerX = bgCanvas.width / 2;
		const centerY = bgCanvas.height / 2;

		// Crop the image inside the circle
		ctx.beginPath();
		ctx.arc(radius, radius, radius, 0, Math.PI * 2);
		ctx.closePath();

		// Draw the cropped image onto the temporary canvas
		ctx.drawImage(bgCanvas, centerX - radius, centerY - radius, diameter, diameter, 0, 0, diameter, diameter);

		// Export the cropped image
		tempCanvas.toBlob((blob) => {
			if (!blob) return;
			const file = new File([blob], `${imageSource.filename}+cropped`, { type: 'image/png' });
			setImageCropped(file);
			handleClose();
		}, 'image/png');
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
			<div className="bg-[#313338] rounded-lg text-white text-center flex flex-col items-center w-[600px] h-fit">
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-5 rounded-t-lg w-full font-semibold text-lg">
					<span>Edit Image</span>
					<button onClick={handleClose} className="text-gray-400 hover:text-white text-xl" title="Close">
						✕
					</button>
				</div>

				{/* Canvas */}
				<div className="relative flex justify-center items-center w-[500px] h-[500px]">
					<canvas
						ref={bgCanvasRef}
						className="cursor-move absolute"
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						title="Move Image"
					></canvas>
					<canvas ref={overlayCanvasRef} className="absolute pointer-events-none"></canvas>
				</div>

				{/* Controls */}
				<div className="p-0.5">
					<div className="flex flex-row items-center gap-2">
						<Icons.ImageThumbnail defaultSize="w-3 h-3" />
						<input
							type="range"
							min="0.5"
							max="2"
							step="0.1"
							value={zoom}
							onChange={handleZoom}
							className="w-[150px] my-4 cursor-pointer"
							title="Adjust Zoom"
						/>
						<Icons.ImageThumbnail defaultSize="w-5 h-5" />
						<Icons.RotateIcon onClick={handleRotate} className="cursor-pointer w-5 h-5 text-[#AEAEAE] hover:text-gray-300" />
					</div>
				</div>

				{/* Footer Actions */}
				<div className="flex items-center justify-between px-4 py-5 bg-[#2B2D31] rounded-b-lg w-full">
					<button onClick={handleReset} className="text-gray-400 hover:text-gray-300 text-sm" title="Reset Changes">
						Reset
					</button>
					<div className="flex gap-2">
						<button onClick={handleClose} className="text-white text-sm hover:underline" title="Cancel Editing">
							Cancel
						</button>
						<button
							onClick={handleApply}
							className="bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm px-4 py-2 rounded-md"
							title="Apply Changes"
						>
							Apply
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ImageEditor;
