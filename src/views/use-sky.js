import * as THREE from 'three'
import { Colors } from '@/config/index.js'

function Cloud() {
    // 创建一个空3d对象
    this.mesh = new THREE.Object3D()

    // 创建一个立方体
    const geom = new THREE.BoxGeometry(20,20,20)
    // 创建材质
    let mat = new THREE.MeshPhongMaterial({
        color: Colors.white
    })

    // 随机n次复制几何图形
    let nBlocs = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < nBlocs; i++ ) {
        let m = new THREE.Mesh(geom, mat)

        m.position.x = i * 15
        m.position.y = Math.random() * 10
        m.position.z = Math.random()*10
        m.rotation.z = Math.random() * Math.PI * 2
        m.rotation.y = Math.random()*Math.PI * 2
        // 设置立方体的缩放
        const s = .1 + Math.random() * .9
        m.scale.set(s, s, s)
        // 阴影设置
        m.castShadow = true
        m.receiveShadow = true

        this.mesh.add(m)
    }
}

function Sky() {
    this.mesh = new THREE.Object3D()

    // 天空中云的数量
    this.nClouds = 20
    let stepAngle = Math.PI*2 / this.nClouds

    for (let i = 0; i < this.nClouds; i++) {
        let c = new Cloud()

        let a = stepAngle * i
        let h = 750 + Math.random() * 200

        c.mesh.position.y = Math.sin(a) * h
        c.mesh.position.x = Math.cos(a) * h
        c.mesh.rotation.z = a + Math.PI / 2
        c.mesh.position.z = -400 - Math.random() * 400

        let s = 1 + Math.random() * 2
        c.mesh.scale.set(s, s, s)

        this.mesh.add(c.mesh)
    }
}

export default function useSky(scene) {
    const sky = new Sky()
    sky.mesh.position.y = -600
    scene.add(sky.mesh)

    return sky
}