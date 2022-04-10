class Piece extends THREE.Mesh {
    constructor(isWhite) {
        super();
        let geometry = new THREE.CylinderGeometry(40, 40, 25, 32);
        let material = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load('mats/marble.jpg'),
            specular: 0xffffff,
            color: isWhite ? 0xaaaaaa : 0x222222,
            shininess: 10,
            side: THREE.DoubleSide
        });
        this.geometry = geometry;
        this.material = material;
        this.castShadow = true;
    }
}