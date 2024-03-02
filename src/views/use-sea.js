import * as THREE from 'three'
import { Colors } from '@/config/index.js'

class Sea {
    constructor() {
        this.waves = []
        this.mesh = null

        this.init()
    }

    init() {
        const geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10)
        // 在X轴旋转几何体
        geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
        geom.mergeVertices()
        var l = geom.vertices.length

        for (var i = 0; i < l; i++){
            var v = geom.vertices[i]

            // store some data associated to it
            this.waves.push({
                y:v.y,
                x:v.x,
                z:v.z,
                // a random angle
                ang: Math.random() * Math.PI * 2,
                // a random distance
                amp: 5 + Math.random() * 15,
                // a random speed between 0.016 and 0.048 radians / frame
                speed: 0.016 + Math.random() * 0.032
            })
        }
        // 创建材质
        let mat = new THREE.MeshPhongMaterial({
            color: Colors.blue,
            transparent: true,
            opacity: .6,
            shading: THREE.FlatShading
        })

        this.mesh = new THREE.Mesh(geom, mat)
        // 是否接受阴影
        this.mesh.receiveShadow = true
    }

    moveWaves() {
        var verts = this.mesh.geometry.vertices
        var l = verts.length;
        
        for (var i = 0; i < l; i++){
            var v = verts[i]
            var vprops = this.waves[i]
            v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp
            v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp

            // increment the angle for the next frame
            vprops.ang += vprops.speed;

        }
        this.mesh.geometry.verticesNeedUpdate = true

        this.mesh.rotation.z += .005
    }
}

export default function useSea(scene) {
    const sea = new Sea()
    sea.mesh.position.y = -600
    scene.add(sea.mesh)

    return sea
}
