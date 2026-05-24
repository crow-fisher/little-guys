import { hsvToHex } from "../color/color.js";
import { HUEMAP } from "../color/hue.js";

export function colorTest(button, canvas, context) {
    button.onclick = () => {
        context.font = "24px courier";
        let keys = Array.from(Object.keys(HUEMAP));
        for (let i = 0; i < keys.length; i++) {
            setTimeout(() => {
                context.fillStyle = hsvToHex(HUEMAP[keys[i]], .5, .5)
                context.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
                context.fillStyle = hsvToHex(0, 0, 0);
                context.fillText(keys[i], 0, 24);
            }, i * 50);
        };
    }
}