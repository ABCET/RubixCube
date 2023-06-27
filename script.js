// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a single cube
const cubeSize = 1;
const cubeSpacing = 1.01;

const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000, roughness: 0.5 }), // Red
    new THREE.MeshBasicMaterial({ color: 0x00ff00, roughness: 0.5 }), // Green
    new THREE.MeshBasicMaterial({ color: 0x0000ff, roughness: 0.5 }), // Blue
    new THREE.MeshBasicMaterial({ color: 0xffff00, roughness: 0.5 }), // Yellow
    new THREE.MeshBasicMaterial({ color: 0xff00ff, roughness: 0.5 }), // Magenta
    new THREE.MeshBasicMaterial({ color: 0x00ffff, roughness: 0.5 }), // Cyan
];

const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const cube = new THREE.Mesh(geometry, materials);

// Create the Rubik's Cube by stacking multiple cubes
const rubikSize = 3;
const rubikSpacing = cubeSize * cubeSpacing;

const rubikGroup = new THREE.Group();

for (let i = 0; i < rubikSize; i++) {
    for (let j = 0; j < rubikSize; j++) {
        for (let k = 0; k < rubikSize; k++) {
            const newCube = cube.clone();

            newCube.position.x = (i - 1) * rubikSpacing;
            newCube.position.y = (j - 1) * rubikSpacing;
            newCube.position.z = (k - 1) * rubikSpacing;

            rubikGroup.add(newCube);
        }
    }
}

scene.add(rubikGroup);

// Position and rotate the Rubik's Cube group
rubikGroup.position.set(0, 0, 0);
rubikGroup.rotation.set(0.4, 0.2, 0);

// Position the camera
camera.position.z = 5;

// Mouse interaction
const mouse = new THREE.Vector2();
const targetRotation = new THREE.Vector2();

function onDocumentMouseDown(event) {
    event.preventDefault();
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mouseup', onDocumentMouseUp);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    const canvasBoundingRect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - canvasBoundingRect.left) / canvasBoundingRect.width) * 2 - 1;
    mouse.y = -((event.clientY - canvasBoundingRect.top) / canvasBoundingRect.height) * 2 + 1;
    targetRotation.x = mouse.x * 0.5;
    targetRotation.y = mouse.y * 0.5;
}

function onDocumentMouseUp() {
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
}

renderer.domElement.addEventListener('mousedown', onDocumentMouseDown);

// Rotation animation
let rotationSpeed = 0.05;
let rotationDirection = 1;
let autoRotate = false;
let autoRotationAxis = new THREE.Vector3(1, 1, 1).normalize();
let autoRotationSpeed = 0.05;

function rotateCube() {
    scene.rotation.x += (targetRotation.y - scene.rotation.x) * rotationSpeed;
    scene.rotation.y += (targetRotation.x - scene.rotation.y) * rotationSpeed;

    if (autoRotate) {
        const rotationMatrix = new THREE.Matrix4().makeRotationAxis(autoRotationAxis, autoRotationSpeed * rotationDirection);
        rubikGroup.matrix.multiply(rotationMatrix);
        rubikGroup.rotation.setFromRotationMatrix(rubikGroup.matrix);
    }
}

// Get the controls
const speedControl = document.getElementById('speed');
const directionControl = document.getElementById('direction');
const randomizeBtn = document.getElementById('randomizeBtn');
const resetBtn = document.getElementById('resetBtn');
const autoRotateBtn = document.getElementById('autoRotateBtn');
const autoSpeedControl = document.getElementById('autoSpeed');

// Set up the control events
speedControl.addEventListener('input', function () {
    rotationSpeed = parseFloat(speedControl.value);
});

directionControl.addEventListener('change', function () {
    rotationDirection = parseInt(directionControl.value);
});

randomizeBtn.addEventListener('click', randomizeCube);
randomizeBtn.style.margin = '5px';

resetBtn.addEventListener('click', resetCube);
resetBtn.style.margin = '5px';

autoRotateBtn.addEventListener('click', toggleAutoRotate);
autoRotateBtn.style.margin = '5px';

autoSpeedControl.addEventListener('input', function () {
    autoRotationSpeed = parseFloat(autoSpeedControl.value);
});

// Randomize the cube's orientation
function randomizeCube() {
    const randomRotationX = Math.random() * 2 * Math.PI;
    const randomRotationY = Math.random() * 2 * Math.PI;
    const randomRotationZ = Math.random() * 2 * Math.PI;

    rubikGroup.rotation.set(randomRotationX, randomRotationY, randomRotationZ);
}

// Reset the cube's orientation
function resetCube() {
    targetRotation.x = 0;
    targetRotation.y = 0;
    autoRotate = false;
    autoRotateBtn.textContent = 'Toggle Auto Rotate';
    rubikGroup.rotation.set(0, 0, 0);
}

// Toggle automatic rotation
function toggleAutoRotate() {
    autoRotate = !autoRotate;
    if (autoRotate) {
        autoRotateBtn.textContent = 'Stop Auto Rotate';
    } else {
        autoRotateBtn.textContent = 'Toggle Auto Rotate';
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    rotateCube();
    renderer.render(scene, camera);
}

animate();