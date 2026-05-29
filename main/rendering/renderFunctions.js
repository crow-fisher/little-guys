export function renderLine(context, v1, v2, size, color) {
    context.beginPath();
    context.lineWidth = size;
    context.strokeStyle = color;
    context.moveTo(v1[0], v1[1]);
    context.lineTo(v2[0], v2[1]);
    context.stroke();
}

export function renderPointLabel(context, x, y, z, size, color, label) {
    if (size < 0 || z < 0) {
        return;
    }
    context.beginPath();
    context.fillStyle = color;
    context.arc(x, y, size, 0, 2 * Math.PI, false);
    context.fill();

    if (label) { 
        context.font = "24px courier";
        context.fillText(label, x + 24, y);
    }
}