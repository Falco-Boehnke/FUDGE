namespace RenderManagerRendering {
    import ƒ = FudgeCore;
    window.addEventListener("load", init);

    function init(): void {
        // create asset
        let branch: ƒ.Node = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());

        ƒ.RenderManager.initialize();

        // initialize viewports
        let posCameras: ƒ.Vector3[] = [new ƒ.Vector3(0.1, 0, 5), new ƒ.Vector3(0.1, 5, 0), new ƒ.Vector3(5, 0.1, 0), new ƒ.Vector3(3, 3, 5)];
        let canvasList: HTMLCollectionOf<HTMLCanvasElement> = document.getElementsByTagName("canvas");
        let viewPorts: ƒ.Viewport[] = [];
        for (let i: number = 0; i < canvasList.length; i++) {
            let camera: ƒ.Node = Scenes.createCamera(posCameras[i]);
            let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
            cmpCamera.projectCentral(1, 45);
            let viewPort: ƒ.Viewport = new ƒ.Viewport();
            viewPort.initialize(canvasList[i].id, branch, cmpCamera, canvasList[i]);
            viewPorts.push(viewPort);
        }

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
        ƒ.Loop.start();

        function animate(_event: Event): void {
            branch.cmpTransform.local.rotateY(1);
            ƒ.RenderManager.update();
            // prepare and draw viewport
            for (let viewPort of viewPorts) {
                //viewPort.prepare();
                viewPort.draw();
            }
        }
    }
}