export const __toRadians__ = (degree) => {
  return (degree * Math.PI) / 180;
};

export const __rotatePoint__ = (
  [pointX, pointY],
  [originX, originY],
  degree
) => {
  //clockwise
  let angle = __toRadians__(degree);
  let rotatedX =
    Math.cos(angle) * (pointX - originX) -
    Math.sin(angle) * (pointY - originY) +
    originX;
  let rotatedY =
    Math.sin(angle) * (pointX - originX) +
    Math.cos(angle) * (pointY - originY) +
    originY;

  return [rotatedX, rotatedY];
};

export const mutateData = (data, type, extra = null) => {
  if (type === "mirror") {
    let rtn = [];

    for (let i = 0; i < data.length; i += 2) {
      rtn.push(data[i]);
    }

    rtn = [...rtn, ...rtn.reverse()];
    return rtn;
  }

  if (type === "shrink") {
    //resize array by % of current array
    if (extra < 1) {
      extra = data.length * extra;
    }

    let rtn = [];
    let splitAt = Math.floor(data.length / extra);

    for (let i = 1; i <= extra; i++) {
      let arraySection = data.slice(i * splitAt, i * splitAt + splitAt);
      let middle = arraySection[Math.floor(arraySection.length / 2)];
      rtn.push(middle);
    }

    return rtn;
  }

  if (type === "split") {
    let size = Math.floor(data.length / extra);
    let rtn = [];
    let temp = [];

    let track = 0;
    for (let i = 0; i <= size * extra; i++) {
      if (track === size) {
        rtn.push(temp);
        temp = [];
        track = 0;
      }

      temp.push(data[i]);
      track++;
    }

    return rtn;
  }

  if (type === "scale") {
    let scalePercent = extra / 255;
    if (extra <= 3 && extra >= 0) scalePercent = extra;
    let rtn = data.map((value) => value * scalePercent);
    return rtn;
  }

  if (type === "organize") {
    let rtn = {};
    rtn.base = data.slice(60, 120);
    rtn.vocals = data.slice(120, 255);
    rtn.mids = data.slice(255, 2000);
    return rtn;
  }

  if (type === "reverb") {
    let rtn = [];
    data.forEach((val, i) => {
      rtn.push(val - (data[i + 1] || 0));
    });
    return rtn;
  }

  if (type === "amp") {
    let rtn = [];
    data.forEach((val) => {
      rtn.push(val * (extra + 1));
    });
    return rtn;
  }

  if (type === "min") {
    let rtn = [];
    data.forEach((value) => {
      if (value < extra) value = extra;
      rtn.push(value);
    });
    return rtn;
  }
};

export const getPoints = (
  shape,
  size,
  [originX, originY],
  pointCount,
  endPoints,
  options = {}
) => {
  let { offset = 0, rotate = 0, customOrigin = [] } = options;
  let rtn = {
    start: [],
    end: [],
  };

  if (shape === "circle") {
    let degreePerPoint = 360 / pointCount;
    let radianPerPoint = __toRadians__(degreePerPoint);
    let radius = size / 2;

    for (let i = 1; i <= pointCount; i++) {
      let currentRadian = radianPerPoint * i;
      let currentEndPoint = endPoints[i - 1];
      let pointOffset = endPoints[i - 1] * (offset / 100);

      let x = originX + (radius - pointOffset) * Math.cos(currentRadian);
      let y = originY + (radius - pointOffset) * Math.sin(currentRadian);
      let point1 = __rotatePoint__([x, y], [originX, originY], rotate);

      rtn.start.push(point1);

      x =
        originX +
        (radius - pointOffset + currentEndPoint) * Math.cos(currentRadian);
      y =
        originY +
        (radius - pointOffset + currentEndPoint) * Math.sin(currentRadian);
      let point2 = __rotatePoint__([x, y], [originX, originY], rotate);

      rtn.end.push(point2);
    }

    return rtn;
  }

  if (shape === "line") {
    let increment = size / pointCount;

    originX = customOrigin[0] || originX;
    originY = customOrigin[1] || originY;

    for (let i = 0; i <= pointCount; i++) {
      let degree = rotate;
      let pointOffset = endPoints[i] * (offset / 100);

      let startingPoint = __rotatePoint__(
        [originX + i * increment, originY - pointOffset],
        [originX, originY],
        degree
      );
      rtn.start.push(startingPoint);

      let endingPoint = __rotatePoint__(
        [originX + i * increment, originY + endPoints[i] - pointOffset],
        [originX, originY],
        degree
      );
      rtn.end.push(endingPoint);
    }

    return rtn;
  }
};

// export const drawCircle = ([x, y], diameter, options = {}) => {
//   let { color, lineColor = ctx.strokeStyle } = options;

//   ctx.beginPath();
//   ctx.arc(x, y, diameter / 2, 0, 2 * Math.PI);
//   ctx.strokeStyle = lineColor;
//   ctx.stroke();
//   ctx.fillStyle = color;
//   if (color) ctx.fill();
// };

// export const drawOval = ([x, y], height, width, options = {}) => {
//   let { rotation = 0, color, lineColor = ctx.strokeStyle } = options;
//   if (rotation) rotation = __toRadians__(rotation);

//   ctx.beginPath();
//   ctx.ellipse(x, y, width, height, rotation, 0, 2 * Math.PI);
//   ctx.strokeStyle = lineColor;
//   ctx.stroke();
//   ctx.fillStyle = color;
//   if (color) ctx.fill();
// };

// export const drawSquare = ([x, y], diameter, options = {}) => {
//   drawRectangle([x, y], diameter, diameter, options);
// };

// export const drawRectangle = ([x, y], height, width, options = {}) => {
//   let { color, lineColor = ctx.strokeStyle, radius = 0, rotate = 0 } = options;

//   // if (width < 2 * radius) radius = width / 2;
//   // if (height < 2 * radius) radius = height / 2;

//   ctx.beginPath();
//   ctx.moveTo(x + radius, y);
//   let p1 = __rotatePoint__([x + width, y], [x, y], rotate);
//   let p2 = __rotatePoint__([x + width, y + height], [x, y], rotate);
//   ctx.arcTo(p1[0], p1[1], p2[0], p2[1], radius);

//   let p3 = __rotatePoint__([x + width, y + height], [x, y], rotate);
//   let p4 = __rotatePoint__([x, y + height], [x, y], rotate);
//   ctx.arcTo(p3[0], p3[1], p4[0], p4[1], radius);

//   let p5 = __rotatePoint__([x, y + height], [x, y], rotate);
//   let p6 = __rotatePoint__([x, y], [x, y], rotate);
//   ctx.arcTo(p5[0], p5[1], p6[0], p6[1], radius);

//   let p7 = __rotatePoint__([x, y], [x, y], rotate);
//   let p8 = __rotatePoint__([x + width, y], [x, y], rotate);
//   ctx.arcTo(p7[0], p7[1], p8[0], p8[1], radius);
//   ctx.closePath();

//   ctx.strokeStyle = lineColor;
//   ctx.stroke();
//   ctx.fillStyle = color;
//   if (color) ctx.fill();
// };

// export const drawLine = ([fromX, fromY], [toX, toY], options = {}) => {
//   let { lineColor = ctx.strokeStyle } = options;

//   ctx.beginPath();
//   ctx.moveTo(fromX, fromY);
//   ctx.lineTo(toX, toY);
//   ctx.strokeStyle = lineColor;
//   ctx.stroke();
// };

// export const drawPolygon = (points, options = {}) => {
//   let {
//     color,
//     lineColor = ctx.strokeStyle,
//     radius = 0,
//     close = false,
//   } = options;

//   function getRoundedPoint(x1, y1, x2, y2, radius, first) {
//     let total = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
//     let idx = first ? radius / total : (total - radius) / total;

//     return [x1 + idx * (x2 - x1), y1 + idx * (y2 - y1)];
//   }

//   function getRoundedPoints(pts, radius) {
//     let len = pts.length;
//     let res = new Array(len);

//     for (let i2 = 0; i2 < len; i2++) {
//       let i1 = i2 - 1;
//       let i3 = i2 + 1;

//       if (i1 < 0) i1 = len - 1;
//       if (i3 == len) i3 = 0;

//       let p1 = pts[i1];
//       let p2 = pts[i2];
//       let p3 = pts[i3];

//       let prevPt = getRoundedPoint(p1[0], p1[1], p2[0], p2[1], radius, false);
//       let nextPt = getRoundedPoint(p2[0], p2[1], p3[0], p3[1], radius, true);
//       res[i2] = [prevPt[0], prevPt[1], p2[0], p2[1], nextPt[0], nextPt[1]];
//     }
//     return res;
//   }

//   if (radius > 0) {
//     points = getRoundedPoints(points, radius);
//   }

//   let i,
//     pt,
//     len = points.length;
//   for (i = 0; i < len; i++) {
//     pt = points[i];
//     if (i == 0) {
//       ctx.beginPath();
//       ctx.moveTo(pt[0], pt[1]);
//     } else {
//       ctx.lineTo(pt[0], pt[1]);
//     }
//     if (radius > 0) {
//       ctx.quadraticCurveTo(pt[2], pt[3], pt[4], pt[5]);
//     }
//   }

//   if (close) ctx.closePath();
//   ctx.strokeStyle = lineColor;
//   ctx.stroke();

//   ctx.fillStyle = color;
//   if (color) ctx.fill();
// };
