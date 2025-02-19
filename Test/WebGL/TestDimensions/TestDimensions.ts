namespace RenderManagerRendering {
    import ƒ = FudgeCore;
    window.addEventListener("load", init);
    let uiRectangles: { [name: string]: UI.Rectangle } = {};
    let canvas: HTMLCanvasElement;
    let viewPort: ƒ.Viewport = new ƒ.Viewport();
    let camera: ƒ.Node;
    let uiCamera: UI.Camera;

    function init(): void {
        // create asset
        let branch: ƒ.Node = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());

        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        // initialize viewports
        canvas = document.getElementsByTagName("canvas")[0];
        camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);


        let menu: HTMLDivElement = document.getElementsByTagName("div")[0];
        menu.innerHTML = "Set render-rectangles by hand,<br/>automatic rectangle transformation and camera adustment is turned off";
        uiCamera = new UI.Camera();
        menu.appendChild(uiCamera);
        appendUIRectangle(menu, "RenderCanvas");
        appendUIRectangle(menu, "RenderViewport");
        appendUIRectangle(menu, "ViewportSource");
        appendUIRectangle(menu, "ViewportDestination");
        appendUIRectangle(menu, "DomCanvas");
        appendUIRectangle(menu, "CSSRectangle");

        setAll({ x: 0, y: 0, width: 300, height: 300 });
        update();
        uiCamera.addEventListener("input", hndChangeOnCamera);
        setCamera();
        viewPort.adjustingFrames = false;
        viewPort.adjustingCamera = false;

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
        ƒ.Loop.start();
        function animate(_event: Event): void {
            update();
            branch.cmpTransform.local.rotateY(1);
            ƒ.RenderManager.update();
            // prepare and draw viewport
            //viewPort.prepare();
            viewPort.draw();
        }

    }

    function appendUIRectangle(_parent: HTMLElement, _name: string): void {
        let uiRectangle: UI.Rectangle = new UI.Rectangle(_name);
        uiRectangle.appendButton("all");
        uiRectangle.addEventListener("click", hndClickOnRect);
        uiRectangle.addEventListener("input", hndChangeOnRect);

        uiRectangle.appendCheckbox("lock");

        _parent.appendChild(uiRectangle);
        uiRectangles[_name] = uiRectangle;
    }

    function hndClickOnRect(_event: Event): void {
        if ((<HTMLElement>_event.target).tagName != "BUTTON")
            return;
        let current: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setAll(<ƒ.Rectangle>current.get());
    }

    function hndChangeOnRect(_event: Event): void {
        let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setRect(target);
    }

    function hndChangeOnCamera(_event: Event): void {
        //let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setCamera();
    }

    function setAll(_rect: ƒ.Rectangle): void {
        for (let name in uiRectangles) {
            let uiRectangle: UI.Rectangle = uiRectangles[name];
            if (uiRectangle.isLocked())
                continue;
            uiRectangle.set(_rect);
            setRect(uiRectangle);
        }
    }

    function setRect(_uiRectangle: UI.Rectangle): void {
        let rect: ƒ.Rectangle = <ƒ.Rectangle>_uiRectangle.get();
        switch (_uiRectangle.name) {
            case "RenderCanvas":
                ƒ.RenderManager.setCanvasSize(rect.width, rect.height);
                break;
            case "RenderViewport":
                ƒ.RenderManager.setViewportRectangle(rect);
                break;
            case "ViewportSource":
                viewPort.rectSource = rect;
                break;
            case "ViewportDestination":
                viewPort.rectDestination = rect;
                break;
            case "DomCanvas":
                canvas.width = rect.width;
                canvas.height = rect.height;
                break;
            case "CSSRectangle":
                canvas.style.left = rect.x + "px";
                canvas.style.top = rect.y + "px";
                canvas.style.width = rect.width + "px";
                canvas.style.height = rect.height + "px";
                break;
            default:
                throw (new Error("Invalid name: " + _uiRectangle.name));
        }
    }

    function setCamera(): void {
        let params: UI.ParamsCamera = uiCamera.get();
        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(params.aspect, params.fieldOfView);
    }

    function update(): void {
        uiRectangles["RenderCanvas"].set(ƒ.RenderManager.getCanvasRect());
        uiRectangles["RenderViewport"].set(ƒ.RenderManager.getViewportRectangle());
        uiRectangles["ViewportSource"].set(viewPort.rectSource);
        uiRectangles["ViewportDestination"].set(viewPort.rectDestination);
        uiRectangles["DomCanvas"].set({ x: 0, y: 0, width: canvas.width, height: canvas.height });
        let client: ClientRect = canvas.getBoundingClientRect();
        uiRectangles["CSSRectangle"].set({ x: client.left, y: client.top, width: client.width, height: client.height });

        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView() });
    }
}