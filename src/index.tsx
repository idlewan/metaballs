import React, { useState}  from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

import { MetaballsQuad } from './metaballs';

// check webgl support. If not supported, show error message, otherwise init
try {
    let canvas = document.createElement('canvas')
    let webgl_support = !! window.WebGLRenderingContext && (
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'))
    if (!webgl_support) {
        throw "NO_WEBGL";
    }
    init();
} catch (e) {
    if (e == "NO_WEBGL") {
        document.getElementById("no-webgl")!.classList.remove("hidden");
    } else {
        document.getElementById("generic-error")!.classList.remove("hidden");
    }
    throw e;
}

function init() {
    createRoot(document.getElementById('root')!).render(
        <App />
    );
}
type ErrorInfo = { error: Error, info: {componentStack: string} };
function ShowError(props: ErrorInfo) {
    return <p className="error">
        {'' + props.error}
        <br />
        {props.info.componentStack}
    </p>;
}

function App() {
    const [state, setState] = useState({} as ErrorInfo);
    if (state.error) {
        return <ShowError error={state.error} info={state.info}/>;
    }

    return <Canvas camera={{ position: [-6, 0, 5] }} dpr={1} >
        <ErrorBoundary
            fallbackRender={() => <></>}
            onError={(error, info) => setState({error, info})}
        >

            <SceneContent />

        </ErrorBoundary>
    </Canvas>;
}

function SceneContent() {
    return <>
        {/* these only light the debug spheres when they are visible */}
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <directionalLight position={[0, 0, 5]} color="red" />

        <MetaballsQuad />

        {/* // useful objects to debug if unsure how camera/things are moving/updating
            // notably autoRotate

        <axesHelper />

        <Grid renderOrder={-1} infiniteGrid
            position={[0, -1.85, 0]}
            cellSize={0.5} sectionSize={2.5}
            sectionColor={0xffffff}
            cellThickness={0.5} sectionThickness={1.5}
            fadeDistance={30} />
        */}

        <OrbitControls makeDefault
            autoRotate autoRotateSpeed={0.75} enableZoom={true}
        />
    </>;
}
