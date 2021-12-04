import { circle } from "@thi.ng/geom";
import { fit } from "@thi.ng/math";
import * as dx from "./snod/drawer";

const settings = {
  animated: true,
  clearColor: "black",
};

let circ;

function update(time) {
  let rad = fit(Math.sin(time / 1000), -1, 1, 0.2, 0.8);
  circ = circle([0, 0], rad);
}

function render({ ctx, canvasScale }) {
  ctx.strokeWidth(12);
  ctx.strokeStyle = "#fff";
  dx.circle(ctx, circ.pos, circ.r, true);
}

export { settings, update, render };
