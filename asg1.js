// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
var g_shapesList = [];
let g_selectedType = POINT;
let g_selectedSegments = 5;


// Wait for DOM to load before running main()
document.addEventListener('DOMContentLoaded', function() {
    main();
});

function main() {
  
    // set up canvas and gl variables
    setupWebGL();
  
    // set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();
  
    // set up actions for the HTML UI elements
    addActionsForHtmlUI();
  
    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

// Helper Functions

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
      }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_FragColor
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}


function click(ev) {
    // Extract the event click and return it in WebGL coordinates
    let [x, y] = convertCoordinatesEventToGL(ev);
  
    // Create and store the new object based on chosen shape
    let point;
    if(g_selectedType == POINT) {
        point = new Point();
    } else if(g_selectedType == TRIANGLE) {
        point = new Triangle();
    } else if(g_selectedType == CIRCLE) {
        point = new Circle();
        point.segment = g_selectedSegments;
    }
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);
  
    // Draw every shape that is supposed to be in the canvas
    renderAllShapes();

}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
    return([x, y]);
  }

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
      g_shapesList[i].render();
    } 

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById('htmlID');
    if(!htmlElm) {
      console.log('Failed to get the HTML element with the specified ID');
      return;
    }
    htmlElm.innerHTML = text;
}

// set up actions for the HTML UI elements
function addActionsForHtmlUI() {
    // Clear canvas
    document.getElementById("clearButton").onclick = function() { 
        g_shapesList = [];  // Clear the shapes list
        renderAllShapes();  // Redraw the empty canvas
    };
    
    // Shapes
    document.getElementById("squares").onclick = function() { g_selectedType = POINT };
    document.getElementById("circles").onclick = function() { g_selectedType = CIRCLE};
    document.getElementById("triangles").onclick = function() { g_selectedType = TRIANGLE};
    
    // Slider Events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; });
  
    // Size Slider Events
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  
    // Segments Slider Events
    document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; });

    // Opacity Slider Events
    document.getElementById("opacitySlide").addEventListener('mouseup', function() { g_selectedColor[3] = this.value / 100; });
}