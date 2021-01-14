let vertexShaderSource = `#version 300 es
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec4 a_color;

uniform mat3 u_matrix;

out vec4 v_color;

// all shaders have a main function
void main() {
  // multiply the position by the matrix
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  // copy color from the attribute to the varying
  v_color = a_color;
}
`;

let fragmentShaderSource = `#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -150,
      -100,
      150,
      -100,
      -150,
      100,
      150,
      -100,
      -150,
      100,
      150,
      100,
    ]),
    gl.STATIC_DRAW
  );
}

function setColors(gl) {
  const r1 = Math.random() * 256;
  const b1 = Math.random() * 256;
  const g1 = Math.random() * 256;
  const r2 = Math.random() * 256;
  const b2 = Math.random() * 256;
  const g2 = Math.random() * 256;

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Uint8Array([
      r1,
      b1,
      g1,
      255,
      r1,
      b1,
      g1,
      255,
      r1,
      b1,
      g1,
      255,
      r2,
      b2,
      g2,
      255,
      r2,
      b2,
      g2,
      255,
      r2,
      b2,
      g2,
      255,
    ]),
    gl.STATIC_DRAW
  );
}

function main() {
  const canvas = document.querySelector("#can");
  const gl = canvas.getContext("webgl2");
  if (gl == null) {
    console.error("WebGL not supported in this browser :(");
    return;
  }

  const program = webglUtils.createProgramFromSources(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");
  const colorLocation = gl.getAttribLocation(program, "a_color");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  setGeometry(gl);

  gl.enableVertexAttribArray(positionLocation);

  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(
    positionLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  setColors(gl);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(
    colorLocation,
    4,
    gl.UNSIGNED_BYTE,
    true,
    stride,
    offset
  );

  const translation = [200, 150];
  let angleInRadians = 0;
  const scale = [1, 1];

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    matrix = m3.translate(matrix, translation[0], translation[1]);
    matrix = m3.rotate(matrix, angleInRadians);
    matrix = m3.scale(matrix, scale[0], scale[1]);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    const count = 6;
    gl.drawArrays(gl.TRIANGLES, offset, count);
  }

  drawScene();

  function updatePosition(i) {
    return (e, ui) => {
      translation[i] = ui.value;
      drawScene();
    };
  }

  function updateScale(i) {
    return (e, ui) => {
      scale[i] = ui.value;
      drawScene();
    };
  }

  webglLessonsUI.setupSlider("#x", {
    value: translation[0],
    slide: updatePosition(0),
    max: gl.canvas.width,
  });
  webglLessonsUI.setupSlider("#y", {
    value: translation[1],
    slide: updatePosition(1),
    max: gl.canvas.height,
  });
  webglLessonsUI.setupSlider("#angle", {
    slide: (e, ui) => {
      const angleInDegrees = 360 - ui.value;
      angleInRadians = (angleInDegrees * Math.PI) / 180;
      drawScene();
    },
    max: 360,
  });
  webglLessonsUI.setupSlider("#scaleX", {
    value: scale[0],
    slide: updateScale(0),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2,
  });
  webglLessonsUI.setupSlider("#scaleY", {
    value: scale[1],
    slide: updateScale(1),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2,
  });
}

main();
