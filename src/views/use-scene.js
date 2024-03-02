import * as THREE from 'three'

let scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container
export default function useScene() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    // 创建场景
    scene = new THREE.Scene()

    // 添加场景雾
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950)

    // 创建相机
    aspectRatio = WIDTH / HEIGHT
    fieldOfView = 60
    nearPlane = 1
    farPlane = 10000
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    )

    // 设置相机位置
    camera.position.x = 0
    camera.position.z = 200
    camera.position.y = 100

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    })

    // 定义渲染器宽高
    renderer.setSize(WIDTH, HEIGHT)

    // 渲染阴影开启
    renderer.shadowMap.enabled = true

    // 将渲染器实例添加到#wolrd
    container = document.getElementById('world')
    container.appendChild(renderer.domElement)

    // 监听屏幕大小变化重新设置相机、渲染器
    window.addEventListener('resize', handleWindowResize, false)

    return {
        scene,
        camera,
        renderer,
        WIDTH,
        HEIGHT
    }
}

function handleWindowResize() {
    // 更新相机、渲染器
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}
