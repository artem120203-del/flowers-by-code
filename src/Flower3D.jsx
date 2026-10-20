import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

function seededRandom(seed) {
  let t = seed + 0x6d2b79f5

  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makePetal(width, length, bend = 0.18) {
  const shape = new THREE.Shape()

  shape.moveTo(0, 0)
  shape.bezierCurveTo(
    -width * 0.78, length * 0.18,
    -width * 0.62, length * 0.82,
    0, length
  )
  shape.bezierCurveTo(
    width * 0.62, length * 0.82,
    width * 0.78, length * 0.18,
    0, 0
  )

  const geometry = new THREE.ShapeGeometry(shape, 24)
  const position = geometry.attributes.position

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const t = Math.max(0, Math.min(1, y / length))

    const z =
      Math.sin(t * Math.PI) * 0.13 +
      (x * x / (width * width + 0.001)) * bend -
      t * t * 0.05

    position.setZ(i, z)
  }

  geometry.computeVertexNormals()
  return geometry
}

function petalMaterial(color, sheenColor) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.36,
    metalness: 0,
    sheen: 0.65,
    sheenColor: new THREE.Color(sheenColor),
    sheenRoughness: 0.45,
    side: THREE.DoubleSide,
  })
}

function addStem(group, height = 1.5, color = '#3f6f3c') {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.03, -height * 0.35, 0),
    new THREE.Vector3(-0.03, -height * 0.7, 0),
    new THREE.Vector3(0.02, -height, 0),
  ])

  group.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(curve, 20, 0.028, 7, false),
      new THREE.MeshStandardMaterial({ color, roughness: 0.72 })
    )
  )
}

function addLeaf(group, x, y, rotation, scale = 1) {
  const shape = new THREE.Shape()

  shape.moveTo(0, 0)
  shape.quadraticCurveTo(0.42, 0.38, 0.85, 0.13)
  shape.quadraticCurveTo(0.48, -0.12, 0, 0)
  shape.closePath()

  const leaf = new THREE.Mesh(
    new THREE.ShapeGeometry(shape, 16),
    new THREE.MeshStandardMaterial({
      color: '#477b42',
      roughness: 0.5,
      side: THREE.DoubleSide,
    })
  )

  leaf.position.set(x, y, 0.02)
  leaf.rotation.z = rotation
  leaf.scale.setScalar(scale)
  group.add(leaf)
}

function makeRose() {
  const flower = new THREE.Group()
  const material = petalMaterial('#c91545', '#ffb2c4')
  const innerMaterial = petalMaterial('#a80e37', '#ff9db4')

  for (let i = 0; i < 12; i++) {
    const angle = i * 2.399
    const radius = 0.07 + i * 0.02

    const petal = new THREE.Mesh(
      makePetal(0.18 + i * 0.004, 0.4 + i * 0.008, 0.2),
      innerMaterial
    )

    petal.position.set(
      Math.cos(angle) * radius,
      0.34 + (i % 3) * 0.025,
      Math.sin(angle) * radius
    )
    petal.rotation.y = -angle
    petal.rotation.x = -0.22 + (i % 4) * 0.08
    flower.add(petal)
  }

  const layers = [
    { count: 9, radius: 0.18, width: 0.28, length: 0.68, tilt: 0.22 },
    { count: 12, radius: 0.34, width: 0.33, length: 0.86, tilt: 0.5 },
    { count: 14, radius: 0.52, width: 0.36, length: 0.96, tilt: 0.78 },
  ]

  layers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.count; i++) {
      const angle =
        (i / layer.count) * Math.PI * 2 + layerIndex * 0.36

      const petal = new THREE.Mesh(
        makePetal(layer.width, layer.length, 0.16 + layerIndex * 0.09),
        material
      )

      petal.position.set(
        Math.cos(angle) * layer.radius,
        0.25 - layerIndex * 0.06,
        Math.sin(angle) * layer.radius
      )
      petal.rotation.y = -angle
      petal.rotation.x = -layer.tilt
      flower.add(petal)
    }
  })

  addStem(flower, 1.5)
  addLeaf(flower, -0.05, -0.7, 2.65, 0.9)
  addLeaf(flower, 0.02, -1.1, 0.3, 0.8)

  return flower
}

function makeTulip() {
  const flower = new THREE.Group()
  const material = petalMaterial('#e0446f', '#ffa8bd')

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2

    const petal = new THREE.Mesh(
      makePetal(0.24, 0.55, 0.1),
      material
    )

    petal.position.set(
      Math.cos(angle) * 0.03,
      0.1,
      Math.sin(angle) * 0.03
    )
    petal.rotation.set(0.2, angle, 0)
    flower.add(petal)
  }

  addStem(flower, 1.5, '#41803a')
  addLeaf(flower, -0.04, -0.75, 2.7, 0.9)

  return flower
}

function makeSunflower() {
  const flower = new THREE.Group()
  const material = petalMaterial('#e89500', '#ffd75e')

  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2

    const petal = new THREE.Mesh(
      makePetal(0.1, 0.5, 0.08),
      material
    )

    petal.position.set(
      Math.cos(angle) * 0.07,
      0.1,
      Math.sin(angle) * 0.07
    )
    petal.rotation.set(-Math.PI / 2 + 0.3, angle, 0)
    flower.add(petal)
  }

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 24, 18),
    new THREE.MeshStandardMaterial({ color: '#4b2d10', roughness: 0.85 })
  )
  center.position.y = 0.12
  center.scale.z = 0.45
  flower.add(center)

  addStem(flower, 1.5, '#4c7c31')
  addLeaf(flower, -0.05, -0.8, 2.6, 0.9)

  return flower
}

function makeLavender() {
  const flower = new THREE.Group()

  addStem(flower, 1.5, '#5d7f4a')

  const material = new THREE.MeshStandardMaterial({
    color: '#8a6fd1',
    roughness: 0.55,
  })

  for (let i = 0; i < 16; i++) {
    const bud = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 8),
      material
    )

    const angle = i * 1.8
    bud.position.set(
      Math.cos(angle) * 0.05,
      0.42 - i * 0.055,
      Math.sin(angle) * 0.05
    )
    bud.scale.set(1, 1.35, 1)
    flower.add(bud)
  }

  addLeaf(flower, -0.04, -0.8, 2.7, 0.7)

  return flower
}

function makeSakura() {
  const flower = new THREE.Group()
  const branchMaterial = new THREE.MeshStandardMaterial({
    color: '#5b4034',
    roughness: 0.85,
  })

  const branch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.035, 1.4, 8),
    branchMaterial
  )
  branch.position.y = -0.35
  flower.add(branch)

  const material = petalMaterial('#ffb7cb', '#ffe3ec')

  for (let b = 0; b < 7; b++) {
    const blossom = new THREE.Group()
    const angle = b * 1.7
    const radius = 0.16 + (b % 3) * 0.05

    blossom.position.set(
      Math.cos(angle) * radius,
      0.35 - (b % 4) * 0.16,
      Math.sin(angle) * radius
    )

    for (let p = 0; p < 5; p++) {
      const petal = new THREE.Mesh(
        makePetal(0.08, 0.13, 0.05),
        material
      )

      const petalAngle = (p / 5) * Math.PI * 2
      petal.position.set(
        Math.cos(petalAngle) * 0.025,
        0,
        Math.sin(petalAngle) * 0.025
      )
      petal.rotation.y = -petalAngle
      petal.rotation.x = -0.4
      blossom.add(petal)
    }

    flower.add(blossom)
  }

  return flower
}

const FLOWER_BUILDERS = {
  roses: makeRose,
  tulips: makeTulip,
  sunflowers: makeSunflower,
  lavender: makeLavender,
  sakura: makeSakura,
}

export default function Flower3D({ items = [], seed = 1 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let renderer
    let animationFrame = 0
    let observer
    let disposed = false

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0.05, 7.4)
    camera.lookAt(0, -0.55, 0)

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      })
    } catch {
      mount.textContent = '3D-букет не поддерживается этим браузером.'
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.setClearColor(0x000000, 0)

    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight('#fff4ee', '#45302a', 2.2))

    const keyLight = new THREE.DirectionalLight('#fff0dc', 3.4)
    keyLight.position.set(-3, 5, 5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight('#ffb0c5', 1.5)
    fillLight.position.set(3, 1, 4)
    scene.add(fillLight)

    const rimLight = new THREE.PointLight('#f5a5bd', 16, 12)
    rimLight.position.set(3, 1.5, -2)
    scene.add(rimLight)

    const bouquet = new THREE.Group()
    scene.add(bouquet)

    const random = seededRandom(seed * 977 + items.length * 31)
    const seedOffset = random() * Math.PI * 2

    const flowers = []

    items.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        flowers.push(item.type)
      }
    })

    for (let i = flowers.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[flowers[i], flowers[j]] = [flowers[j], flowers[i]]
    }

    flowers.forEach((type, index) => {
      const builder = FLOWER_BUILDERS[type]
      if (!builder) return

      const flower = builder()
      const angle = index * 2.399 + seedOffset
      const radius = 0.16 + 0.15 * Math.sqrt(index)
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      flower.position.set(x * 0.85, 0.12 + random() * 0.1, z * 0.85)
      flower.rotation.y = random() * Math.PI * 2
      flower.rotation.z = (random() - 0.5) * 0.16
      flower.rotation.x = (random() - 0.5) * 0.12
      flower.scale.setScalar(0.62)

      bouquet.add(flower)

      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x * 0.85, 0.05, z * 0.85),
        new THREE.Vector3(x * 0.55, -0.55, z * 0.55),
        new THREE.Vector3(x * 0.28, -1, z * 0.28),
        new THREE.Vector3(x * 0.08, -1.32, z * 0.08),
      ])

      bouquet.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(stemCurve, 22, 0.02, 6, false),
          new THREE.MeshStandardMaterial({ color: '#3f6f3c', roughness: 0.75 })
        )
      )
    })

    const paper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 1.05, 1.35, 30, 1, true),
      new THREE.MeshStandardMaterial({
        color: '#f8dbe4',
        roughness: 0.82,
        side: THREE.DoubleSide,
      })
    )
    paper.position.y = -1.08
    paper.rotation.y = 0.3
    bouquet.add(paper)

    const ribbon = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.035, 10, 40),
      new THREE.MeshStandardMaterial({
        color: '#d94c78',
        roughness: 0.45,
      })
    )
    ribbon.position.y = -0.72
    ribbon.rotation.x = Math.PI / 2
    bouquet.add(ribbon)

    bouquet.scale.setScalar(0.92)
    bouquet.position.y = 0.18

    function resize() {
      if (disposed) return

      const width = Math.max(mount.clientWidth, 1)
      const height = Math.max(mount.clientHeight, 1)

      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(resize)
      observer.observe(mount)
    }

    resize()

    const clock = new THREE.Clock()

    function animate() {
      if (disposed) return

      animationFrame = requestAnimationFrame(animate)

      const time = clock.getElapsedTime()
      bouquet.rotation.y = Math.sin(time * 0.32) * 0.16
      bouquet.position.y = 0.18 + Math.sin(time * 0.8) * 0.015

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      observer?.disconnect()

      scene.traverse(object => {
        object.geometry?.dispose()

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material]

          materials.forEach(material => material.dispose())
        }
      })

      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [items, seed])

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '300px',
        overflow: 'hidden',
        borderRadius: '24px',
        background: 'transparent',
      }}
      aria-label="Объёмный 3D-букет"
    />
  )
}
