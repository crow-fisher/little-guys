import { colorTest } from "./test_color.js";

console.log("You have entered hell.")

const TEST_MAIN_CANVAS = document.getElementById("test_main");
const TEST_BUTTON_COLOR = document.getElementById("test_color");

const TEST_MAIN_CONTEXT = TEST_MAIN_CANVAS.getContext('2d');

TEST_MAIN_CANVAS.width = 500;
TEST_MAIN_CANVAS.height = 500;

colorTest(TEST_BUTTON_COLOR, TEST_MAIN_CANVAS, TEST_MAIN_CONTEXT);