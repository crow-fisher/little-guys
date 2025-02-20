export function keydown(e) {
    e.preventDefault();
    if (e.key == "Shift") {
        shiftPressed = true;
    }
    if (e.key == "w") {
        doZoom(-0.1);
    }
    if (e.key == "s") {
        doZoom(0.1);
    }
    if (e.key == "a") {
        global_theta_base += 0.1;
    }
    if (e.key == "d") {
        global_theta_base -= 0.1;
    }

    if (e.key == "Escape") {
        CANVAS_VIEWPORT_CENTER_X = (CANVAS_SQUARES_X * BASE_SIZE) / 2;
        CANVAS_VIEWPORT_CENTER_Y = (CANVAS_SQUARES_Y * BASE_SIZE) / 2;
        CANVAS_SQUARES_ZOOM = 1;
    }
}

export function keyup(e) {
}