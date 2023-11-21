import * as THREE from 'three';

function createStarSphere(starsData) {
    // Create a scene
    const scene = new THREE.Scene();

    // Create a camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Create a renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a sphere
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Plot stars on the sphere
    starsData.forEach((star) => {
        const starGeometry = new THREE.SphereGeometry(0.1);
        const starMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(star.v.x, star.v.y, star.v.z) });
        const starMesh = new THREE.Mesh(starGeometry, starMaterial);

        // Convert spherical coordinates to Cartesian coordinates
        const x = Math.cos(star.gLon) * Math.cos(star.gLat);
        const y = Math.sin(star.gLon) * Math.cos(star.gLat);
        const z = Math.sin(star.gLat);

        starMesh.position.set(x, y, z).multiplyScalar(5); // Scale by the radius of the sphere
        sphere.add(starMesh);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    });

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);

        // Rotate the sphere (optional)
        sphere.rotation.x += 0.005;
        sphere.rotation.y += 0.005;

        renderer.render(scene, camera);
    };

    animate();
}

// Example usage
const starsData = [
    // Replace this with your star data
    {
        id: 1,
        name: 'Star1',
        gLon: 0.5,
        gLat: 0.3,
        mag: 5.0,
        spectralClass: 'G',
        v: new THREE.Vector3(1, 0, 0),
    },
    {
        id: 2,
        name: 'Star2',
        gLon: -0.3,
        gLat: -0.2,
        mag: 4.5,
        spectralClass: 'A',
        v: new THREE.Vector3(0, 1, 0),
    },
];

createStarSphere(starsData);
