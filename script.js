const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let painting = false;
let erasing = false;

let undoStack = [];
let redoStack = [];

function startPosition(e) {
  painting = true;
  saveState();
  draw(e);
}

function endPosition() {
  painting = false;
  ctx.beginPath();
}

function draw(e) {
  if (!painting) return;

  ctx.lineWidth = document.getElementById('brushSize').value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = erasing ? '#ffffff' : document.getElementById('colorPicker').value;

  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function saveState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 50) undoStack.shift(); // limit memory
  redoStack = [];
}

function restoreState(stack, altStack) {
  if (stack.length === 0) return;
  altStack.push(canvas.toDataURL());
  const img = new Image();
  img.src = stack.pop();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}

// Event listeners
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mouseout', endPosition);
canvas.addEventListener('mousemove', draw);

document.getElementById('clearBtn').addEventListener('click', () => {
  saveState();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();
  link.click();
});

document.getElementById('undoBtn').addEventListener('click', () => restoreState(undoStack, redoStack));
document.getElementById('redoBtn').addEventListener('click', () => restoreState(redoStack, undoStack));

document.getElementById('brushBtn').addEventListener('click', () => erasing = false);
document.getElementById('eraserBtn').addEventListener('click', () => erasing = true);

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z') restoreState(undoStack, redoStack);
  if (e.ctrlKey && e.key === 'y') restoreState(redoStack, undoStack);
  if (e.key === 'b') erasing = false;
  if (e.key === 'e') erasing = true;
});