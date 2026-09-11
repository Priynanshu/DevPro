import { useEffect, useRef } from "react"

// Vertex shader: just passes a full-screen quad through untouched.
const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

// Fragment shader: layered simplex noise (fbm) drawn as glowing
// blood-orange energy ribbons over a dark grid, warped by the mouse.
const FRAGMENT_SHADER = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                        -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float t = u_time * 0.25;

    vec2 mouseSt = (u_mouse - 0.5 * u_resolution.xy) / u_resolution.y;
    float distToMouse = length(st - mouseSt);
    float mouseInfluence = smoothstep(0.6, 0.0, distToMouse) * 0.4;

    float n1 = snoise(st * 2.2 + vec2(t * 0.3, t * 0.15) + mouseInfluence);
    float n2 = snoise(st * 4.5 - vec2(t * 0.4, -t * 0.2) + n1 * 0.6);
    float n3 = snoise(st * 9.0 + vec2(-t * 0.2, t * 0.5) + n2 * 0.3);

    float combinedNoise = (n1 * 0.5 + n2 * 0.35 + n3 * 0.15);

    vec2 gridUV = fract(uv * vec2(40.0, 40.0 * (u_resolution.y / u_resolution.x)));
    float gridLine = smoothstep(0.97, 0.99, gridUV.x) + smoothstep(0.97, 0.99, gridUV.y);

    vec3 bgBase = vec3(0.039, 0.039, 0.043);
    vec3 bloodOrange = vec3(1.0, 0.301, 0.0);
    vec3 orangeGlow = vec3(1.0, 0.18, 0.0);
    vec3 darkCrimson = vec3(0.18, 0.04, 0.01);
    vec3 cyanSpark = vec3(0.0, 0.9, 0.85);

    float ribbon1 = smoothstep(0.12, 0.0, abs(combinedNoise - 0.15));
    float ribbon2 = smoothstep(0.08, 0.0, abs(n2 + 0.1));
    float focalGlow = smoothstep(0.8, 0.0, length(st - vec2(0.2, 0.1) - mouseSt * 0.3));

    vec3 col = bgBase;
    col += vec3(0.08, 0.08, 0.09) * gridLine * 0.25;
    col += darkCrimson * (combinedNoise * 0.5 + 0.5) * 0.6;
    col += bloodOrange * ribbon1 * 0.75;
    col += orangeGlow * ribbon2 * 0.45;
    col += bloodOrange * focalGlow * 0.22;
    col += cyanSpark * mouseInfluence * ribbon1 * 0.5;

    float vignette = smoothstep(1.4, 0.35, length(st));
    col *= vignette;

    gl_FragColor = vec4(col, 1.0);
}`

// Compiles one shader (vertex or fragment) from source text.
const compileShader = (gl, type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
}

// Full-screen animated shader background. Sits behind the hero content
// with pointer-events disabled so it never blocks clicks.
const WebGLShaderBackground = ({ className = "" }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        if (!gl) return

        const syncSize = () => {
            const width = canvas.clientWidth || 1280
            const height = canvas.clientHeight || 720
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width
                canvas.height = height
            }
        }
        syncSize()

        const resizeObserver = new ResizeObserver(syncSize)
        resizeObserver.observe(canvas)

        const program = gl.createProgram()
        gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER))
        gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
        gl.linkProgram(program)
        gl.useProgram(program)

        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

        const positionLocation = gl.getAttribLocation(program, "a_position")
        gl.enableVertexAttribArray(positionLocation)
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

        const uTime = gl.getUniformLocation(program, "u_time")
        const uResolution = gl.getUniformLocation(program, "u_resolution")
        const uMouse = gl.getUniformLocation(program, "u_mouse")

        const mouse = { x: canvas.width / 2, y: canvas.height / 2 }

        const handleMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect()
            if (rect.width && rect.height) {
                const nx = (event.clientX - rect.left) / rect.width
                const ny = 1.0 - (event.clientY - rect.top) / rect.height
                mouse.x = nx * canvas.width
                mouse.y = ny * canvas.height
            }
        }
        window.addEventListener("mousemove", handleMouseMove)

        let animationFrameId

        const render = (timeMs) => {
            gl.viewport(0, 0, canvas.width, canvas.height)
            gl.uniform1f(uTime, timeMs * 0.001)
            gl.uniform2f(uResolution, canvas.width, canvas.height)
            gl.uniform2f(uMouse, mouse.x, mouse.y)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
            animationFrameId = requestAnimationFrame(render)
        }
        animationFrameId = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener("mousemove", handleMouseMove)
            resizeObserver.disconnect()
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{ display: "block", width: "100%", height: "100%" }}
        />
    )
}

export default WebGLShaderBackground
