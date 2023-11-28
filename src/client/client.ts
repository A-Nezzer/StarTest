import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { radians } from 'three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.zoomSpeed = 4

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    labelRenderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const sunsb9k: { [id: number]: Star } = {}
const b9kcsv = new XMLHttpRequest()
b9kcsv.open('GET', '/data/Solar_data/b9k.csv')
b9kcsv.onreadystatechange = function () {
    if (b9kcsv.readyState === 4) {
        const sunb9kData = b9kcsv.responseText.split('\n')
        const positions = new Array()
        const colors = new Array()
        const color = new THREE.Color()
        const sizes = new Array()

        sunb9kData.forEach((day) => {
            let sun: Star = {
                id: 9999,
                name: 'Sun',
                gLon: Number(day.slice(15, 24)),
                gLat: Number(day.slice(27, 36)),
                mag: -26.74,
                spectralClass: 'G',
                v: new THREE.Vector3(),
            }
            sunsb9k[sun.id] = sun
            sun.v = new THREE.Vector3().setFromSphericalCoords(
                100,
                THREE.MathUtils.degToRad(90 - sun.gLat),
                THREE.MathUtils.degToRad(sun.gLon)
            )
            positions.push(sun.v.x)
            positions.push(sun.v.y)
            positions.push(sun.v.z)
            color.setHex(0xfcffb5)

            const s = (sun.mag * 26) / 255 + 0.18
            sizes.push(s)
            colors.push(color.r, color.g, color.b, s)
        })
        const sunsGeometry = new THREE.BufferGeometry()
        sunsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        sunsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4))
        sunsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

        const sunsMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader(),
            transparent: true,
        })
        const points = new THREE.Points(sunsGeometry, sunsMaterial)
        scene.add(points)
    }
}
b9kcsv.send()

const stars: { [id: number]: Star } = {}
//bsc5.dat @ http://tdc-www.harvard.edu/catalogs/bsc5.readme
const bsc5dat = new XMLHttpRequest()
bsc5dat.open('GET', '/data/bsc5.dat')
bsc5dat.onreadystatechange = function () {
    if (bsc5dat.readyState === 4) {
        const starData = bsc5dat.responseText.split('\n')
        const positions = new Array()
        const colors = new Array()
        const color = new THREE.Color()
        const sizes = new Array()

        starData.forEach((row) => {
            let star: Star = {
                id: Number(row.slice(0, 4)),
                name: row.slice(4, 14).trim(),
                gLon: Number(row.slice(14, 96)),
                gLat: Number(row.slice(96, 102)),
                mag: Number(row.slice(102, 107)),
                spectralClass: row.slice(129, 130),
                v: new THREE.Vector3(),
            }

            stars[star.id] = star
            star.v = new THREE.Vector3().setFromSphericalCoords(
                100,
                THREE.MathUtils.degToRad(90 - star.gLat),
                THREE.MathUtils.degToRad(star.gLon)
            )

            positions.push(star.v.x)
            positions.push(star.v.y)
            positions.push(star.v.z)

            switch (star.spectralClass) {
                case 'O':
                    color.setHex(0x91b5ff)
                    break
                case 'B':
                    color.setHex(0xa7c3ff)
                    break
                case 'A':
                    color.setHex(0xd0ddff)
                    break
                case 'F':
                    color.setHex(0xf1f1fd)
                    break
                case 'G':
                    color.setHex(0xfdefe7)
                    break
                case 'K':
                    color.setHex(0xffddbb)
                    break
                case 'M':
                    color.setHex(0xffb466)
                    break
                case 'L':
                    color.setHex(0xff820e)
                    break
                case 'T':
                    color.setHex(0xff3a00)
                    break
                default:
                    color.setHex(0xffffff)
            }

            const s = (star.mag * 26) / 255 + 0.18
            sizes.push(s)
            colors.push(color.r, color.g, color.b, s)
        })

        const starsGeometry = new THREE.BufferGeometry()
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4))
        starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

        const starsMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader(),
            transparent: true,
        })

        const points = new THREE.Points(starsGeometry, starsMaterial)
        scene.add(points)

        // load constellationlines
        // load constellation data
        const constellationLinesDat = new XMLHttpRequest();
        constellationLinesDat.open('GET', '/data/ConstellationLines.dat');
        constellationLinesDat.onreadystatechange = function () {
            if (constellationLinesDat.readyState === 4) {
                const constellationLinesData = constellationLinesDat.responseText.split('\n');
                constellationLinesData.forEach((row) => {
                    if (!row.startsWith('#') && row.length > 1) {
                        const rowData = row.split(/[ ,]+/);
                        var points = [];
                        var lineColor = 0x008888; // Default color is green

                        // Check for additional data (t or f) after stars data
                        if (rowData.length > 2) {
                            var additionalData = rowData[rowData.length - 1].trim();
                            if (additionalData.toLowerCase() === 't') {
                                lineColor = 0xff0000; // Change color to red if 't' is present
                            } else if (additionalData.toLowerCase() === 'f') {
                                // You can add additional conditions for other cases
                                lineColor = 0x008888; // Default to green if 'f' is present
                            }
                        }

                        for (let i = 0; i < rowData.length - 2; i++) {
                            let starId = parseInt(rowData[i + 2].trim());
                            if (starId in stars) {
                                const star = stars[starId];
                                points.push(star.v);

                                // Create star label
                                var starDiv = document.createElement('div');
                                starDiv.className = 'starLabel';
                                starDiv.textContent = star.name.substr(0, star.name.length - 3);
                                var starLabel = new CSS2DObject(starDiv);
                                starLabel.position.set(star.v.x, star.v.y, star.v.z);
                                starLabel.userData.type = 'starName';
                                scene.add(starLabel);
                            }
                        }

                        const constellationGeometry = new THREE.BufferGeometry().setFromPoints(
                            points
                        );
                        const constellationMaterial = new THREE.LineBasicMaterial({
                            color: lineColor, // Use the determined color
                        });
                        const constellationLine = new THREE.Line(
                            constellationGeometry,
                            constellationMaterial
                        );
                        constellationLine.userData.type = 'constellationLine';
                        scene.add(constellationLine);

                        // Create constellation label
                        let constellationLineBox: THREE.Box3 = new THREE.Box3().setFromObject(
                            constellationLine
                        )
                        const center = new THREE.Vector3()
                        constellationLineBox.getCenter(center)
                        var constellationDiv = document.createElement('div')
                        constellationDiv.className = 'constellationLabel'
                        constellationDiv.textContent = rowData[0]
                        var constellationLabel = new CSS2DObject(constellationDiv)
                        constellationLabel.position.set(center.x, center.y, center.z)
                        constellationLabel.userData.type = 'constellationName'
                        scene.add(constellationLabel)
                    }
                });
                scene.rotation.x = 0.5;
                scene.rotation.z = 1.0;
            }
        };
        constellationLinesDat.send();

    }
}
bsc5dat.send()

function vertexShader() {
    return `
        attribute float size;
        attribute vec4 color;
        varying vec4 vColor;
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_PointSize = size * ( 250.0 / -mvPosition.z );
            gl_Position = projectionMatrix * mvPosition;
        }
    `
}

function fragmentShader() {
    return `
        varying vec4 vColor;
            void main() {
                gl_FragColor = vec4( vColor );
            }
    `
}

const stats = new Stats()
document.body.appendChild(stats.dom)

const guiData = {
    starNames: true,
    constellationLines: true,
    constellationNames: true,
}

const gui = new GUI()
gui.add(guiData, 'starNames').onChange(() => {
    scene.children.forEach((c: THREE.Object3D) => {
        if (c.userData.type === 'starName') {
            c.visible = guiData.starNames
        }
    })
})
gui.add(guiData, 'constellationLines').onChange(() => {
    scene.children.forEach((c: THREE.Object3D) => {
        if (c.userData.type === 'constellationLine') {
            c.visible = guiData.constellationLines
        }
    })
})
gui.add(guiData, 'constellationNames').onChange(() => {
    scene.children.forEach((c: THREE.Object3D) => {
        if (c.userData.type === 'constellationName') {
            c.visible = guiData.constellationNames
        }
    })
})

const animate = function () {
    requestAnimationFrame(animate)

    controls.update()

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
}

animate()
