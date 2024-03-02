import * as THREE from 'three'

let hemisphereLight, shadowLight, ambientLight
export default function useLight(scene) {
    // 创建半球光
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)

    // 创建平行光
    shadowLight = new THREE.DirectionalLight(0xffffff, .9)
    // 设置平行光源位置
    shadowLight.position.set(150, 350, 350)
    // 开启灯光阴影
    shadowLight.castShadow = true
    // 定义投影可见区域
    shadowLight.shadow.camera.left = -400
    shadowLight.shadow.camera.right = 400
    shadowLight.shadow.camera.top = 400
    shadowLight.shadow.camera.bottom = -400
    shadowLight.shadow.camera.near = 1
    shadowLight.shadow.camera.far = 1000
    // 投影清晰度
    shadowLight.shadow.mapSize.width = 2048
    shadowLight.shadow.mapSize.height = 2048

    // 创建环境光
    ambientLight = new THREE.AmbientLight(0xdc8874, .5);

    scene.add(hemisphereLight)
    scene.add(shadowLight)
    scene.add(ambientLight)
}
