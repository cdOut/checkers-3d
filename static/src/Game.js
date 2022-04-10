class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, $("#checkers-frame").width() / $("#checkers-frame").height(), 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(0x080808);
        this.renderer.setSize($("#checkers-frame").width(), $("#checkers-frame").height());
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.camera.position.set(800, 650, 0);
        this.camera.updateProjectionMatrix();
        this.camera.lookAt(this.scene.position);
        $("#checkers-frame").append(this.renderer.domElement);

        $(window).on('resize', this, function(e) {
            e.data.camera.aspect = $("#checkers-frame").width() / $("#checkers-frame").height();
            e.data.camera.updateProjectionMatrix();
            e.data.renderer.setSize($("#checkers-frame").width(), $("#checkers-frame").height());
        });

        this.createLight();
        this.createBoard();

        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();

        this.color = undefined;
        this.pieces = undefined;
        this.selected = undefined;
        this.highlightBlocks = [];
        this.paused = true;

        $(document).mousedown($.proxy(function(e) {
            if(!this.paused) {
                this.mouseVector.x = (e.clientX / $(window).width()) * 2 - 1;
                this.mouseVector.y = -(e.clientY / $(window).height()) * 2 + 1;
                this.raycaster.setFromCamera(this.mouseVector, this.camera);

                let intersects = this.raycaster.intersectObjects(this.scene.children);
                if(intersects.length > 0) {
                    if(intersects[0].object.geometry.type == "CylinderGeometry") {
                        if(intersects[0].object.material.color.getHexString() == this.color) {
                            let pieceGeometry = new THREE.CylinderGeometry(40, 40, 25, 32);
                            let blockGeometry = new THREE.BoxGeometry(100, 30, 100);
                            let material = new THREE.MeshBasicMaterial({
                                side: THREE.DoubleSide,
                                transparent: true,
                                color: 0xFF007F,
                                opacity: 0.3,
                            });

                            this.selected = intersects[0].object;
                            this.scene.remove(this.highlightPiece);
                            this.highlightPiece = new THREE.Mesh(pieceGeometry, material);
                            this.highlightPiece.position.copy(intersects[0].object.position);

                            this.highlightBlocks.forEach(block => {
                                this.scene.remove(block);
                            });
                            this.highlightBlocks = [];
                            for(let i = -1; i <= 1; i += 2) {
                                let block = new THREE.Mesh(blockGeometry, material);
                                block.position.copy(this.selected.position);
                                block.position.y = 0;
                                block.position.z += i * 100;
                                block.position.x += (this.color == 'aaaaaa' ? -1 : 1) * 100;
                                if(this.pieces[(block.position.x + 50) / 100 + 3][(block.position.z + 50) / 100 + 3] == (this.color == 'aaaaaa' ? 2 : 1)) {
                                    block.position.z += i * 100;
                                    block.position.x += (this.color == 'aaaaaa' ? -1 : 1) * 100;
                                    if(this.pieces[(block.position.x + 50) / 100 + 3][(block.position.z + 50) / 100 + 3] != 0 ||
                                    (block.position.x > 350 || block.position.x < -350 || block.position.z > 350 || block.position.z < -350)) {
                                        continue;
                                    }
                                } else if(this.pieces[(block.position.x + 50) / 100 + 3][(block.position.z + 50) / 100 + 3] != 0 ||
                                (block.position.x > 350 || block.position.x < -350 || block.position.z > 350 || block.position.z < -350)) {
                                    continue;
                                }
                                this.highlightBlocks.push(block);
                            }

                            this.highlightBlocks.forEach(block => {
                                this.scene.add(block);
                            });
                            this.scene.add(this.highlightPiece);
                        }
                    } else if(intersects[0].object.geometry.type == "BoxGeometry") {
                        if(intersects[0].object.material.color.getHexString() == '363732') {
                            if(this.selected != undefined) {
                                if(this.highlightBlocks.find(block => { return block.position.equals(intersects[0].object.position); }) != undefined) {
                                    this.pieces[(intersects[0].object.position.x + 50) / 100 + 3][(intersects[0].object.position.z + 50) / 100 + 3] = this.color == 'aaaaaa' ? 1 : 2;
                                    this.pieces[(this.selected.position.x + 50) / 100 + 3][(this.selected.position.z + 50) / 100 + 3] = 0;
                                    
                                    if(Math.abs(this.selected.position.z - intersects[0].object.position.z) == 200) {
                                        let x = this.selected.position.x + (intersects[0].object.position.x - this.selected.position.x) / 2;
                                        let z = this.selected.position.z + (intersects[0].object.position.z - this.selected.position.z) / 2;
                                        this.scene.remove(this.scene.children.find(obj => { return obj.name == 'piece' && obj.position.x == x && obj.position.z == z}));
                                        this.pieces[(x + 50) / 100 + 3][(z + 50) / 100 + 3] = 0;
                                    }
                                    
                                    this.selected.position.copy(intersects[0].object.position);
                                    this.selected.position.y = 25;
                                    this.selected = undefined;
                                    this.scene.remove(this.highlightPiece);
                                    this.highlightPiece = undefined;
                                    this.highlightBlocks.forEach(block => {
                                        this.scene.remove(block);
                                    });
                                    this.highlightBlocks = [];
                                    ui.previewArray(this.pieces, this.color);
                                    net.sendData('END_TURN', JSON.stringify(this.pieces));
                                }
                            }
                        }
                    }
                }
            }
        }, this));

        this.render();
    }
    createLight() {
        let light1 = new THREE.SpotLight(0xaaccff, 0.5);
        light1.position.set(-500, 300, -500);
        light1.lookAt(this.scene.position);
        light1.shadow.camera.far = 5000;
        light1.castShadow = true;
        this.scene.add(light1);

        let light2 = new THREE.SpotLight(0xffccaa, 0.5);
        light2.position.set(500, 300, 500);
        light2.lookAt(this.scene.position);
        light2.shadow.camera.far = 5000;
        light2.castShadow = true;
        this.scene.add(light2);

        let light3 = new THREE.SpotLight(0xffffff, 0.2);
        light3.position.set(-1000, 600, 0);
        light3.lookAt(this.scene.position);
        light3.shadow.camera.far = 5000;
        light3.castShadow = true;
        this.scene.add(light3);

        let light4 = new THREE.SpotLight(0xffffff, 0.2);
        light4.position.set(1000, 600, 0);
        light4.lookAt(this.scene.position);
        light4.shadow.camera.far = 5000;
        light4.castShadow = true;
        this.scene.add(light4);
    }
    createBoard() {
        let geometry = new THREE.BoxGeometry(100, 30, 100);
        let material = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load('mats/marble.jpg'),
            specular: 0xffffff,
            shininess: 10,
            side: THREE.DoubleSide
        });
        for(let z = 0; z < 8; z++) {
            for(let x = 0; x < 8; x++) {
                let block = new THREE.Mesh(geometry);
                block.material = material.clone();
                block.material.color.setHex((x + z % 2) % 2 == 0 ? 0x363732 : 0xf0eff4);
                block.receiveShadow = true;
                block.position.set(x * 100 - 8 / 2 * 100 + 50, 0, z * 100 - 8 / 2 * 100 + 50);
                this.scene.add(block);
            }
        }
    }
    adjustCamera(side) {
        if(side == 'black') {
            this.camera.position.z = 800 * Math.cos(Math.PI * 1.5);
            this.camera.position.x = 800 * Math.sin(Math.PI * 1.5);
            this.camera.updateProjectionMatrix();
            this.camera.lookAt(this.scene.position);
        }
    }
    displayPieces() {
        ui.previewArray(this.pieces, this.color);
        this.scene.children.filter(obj => { 
            return obj.name == 'piece'; 
        }).forEach(obj => { 
            this.scene.remove(obj); 
        });
        
        for(let z = 0; z < 8; z++) {
            for(let x = 0; x < 8; x++) {
                if(this.pieces[x][z] == 1) {
                    let white = new Piece(true);
                    white.position.set((x - 3) * 100 - 50, 25, (z - 3) * 100 - 50);
                    white.name = 'piece';
                    this.scene.add(white);
                } else if(this.pieces[x][z] == 2) {
                    let black = new Piece(false);
                    black.position.set((x - 3) * 100 - 50, 25, (z - 3) * 100 - 50);
                    black.name = 'piece';
                    this.scene.add(black);
                }
            }
        }
    }
    render() {
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}