import { useEffect, useState, useRef } from 'react';
import { Monitor, Zap, Info, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SEO } from '@/components/SEO';

interface GPUInfo {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  maxTextureSize: number;
  maxVertexAttributes: number;
  maxFragmentUniforms: number;
  maxRenderBufferSize: number;
  maxCubeMapTextureSize: number;
  maxVertexTextureImageUnits: number;
  maxTextureImageUnits: number;
  maxViewportDims: number[];
  aliasedLineWidthRange: number[];
  aliasedPointSizeRange: number[];
}

interface BenchmarkResult {
  trianglesPerSecond: number;
  fps: number;
  duration: number;
  score: number;
}

export default function GpuTester() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gpuInfo, setGpuInfo] = useState<GPUInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    detectGPU();
  }, []);

  const detectGPU = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    const info: GPUInfo = {
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
      maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
      aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
    };
    
    setGpuInfo(info);
  };

  const runBenchmark = async () => {
    if (!canvasRef.current || !webglSupported) return;
    
    setIsTesting(true);
    setTestProgress(0);
    setBenchmarkResult(null);

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec3 a_color;
      varying vec3 v_color;
      uniform vec2 u_resolution;
      uniform float u_time;
      
      void main() {
        vec2 position = a_position + sin(u_time * 3.0 + a_position.x) * 0.1;
        vec2 zeroToOne = position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        v_color = a_color;
      }
    `;

    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 v_color;
      uniform float u_time;
      
      void main() {
        vec3 color = v_color + sin(u_time) * 0.2;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Get locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');

    // Create buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Generate triangles
    const triangleCount = 10000;
    const vertices = [];
    
    for (let i = 0; i < triangleCount; i++) {
      // Triangle vertices
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = 5 + Math.random() * 15;
      
      vertices.push(
        x, y, Math.random(), Math.random(), Math.random(),
        x + size, y, Math.random(), Math.random(), Math.random(),
        x + size/2, y + size, Math.random(), Math.random(), Math.random()
      );
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Setup attributes
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 20, 0);
    
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 20, 8);

    // Set resolution
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // Benchmark
    const startTime = performance.now();
    let frameCount = 0;
    const duration = 5000; // 5 seconds

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1) * 100;
      setTestProgress(progress);

      if (elapsed < duration) {
        // Clear canvas
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Update time uniform
        gl.uniform1f(timeLocation, elapsed * 0.001);

        // Draw triangles
        gl.drawArrays(gl.TRIANGLES, 0, triangleCount * 3);

        frameCount++;
        requestAnimationFrame(animate);
      } else {
        // Calculate results
        const endTime = performance.now();
        const actualDuration = endTime - startTime;
        const fps = (frameCount / actualDuration) * 1000;
        const trianglesPerSecond = (triangleCount * frameCount / actualDuration) * 1000;
        const score = Math.min(Math.round(fps * trianglesPerSecond / 10000), 10000);

        setBenchmarkResult({
          trianglesPerSecond: Math.round(trianglesPerSecond),
          fps: Math.round(fps),
          duration: Math.round(actualDuration),
          score
        });
        
        setIsTesting(false);
        setTestProgress(100);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <SEO 
        title="GPU Tester - Test Graphics Card Performance Online | WebGL Benchmark"
        description="Test your GPU performance with our advanced WebGL benchmark. Analyze graphics card capabilities, rendering performance, and hardware specifications. Free online GPU testing tool."
        keywords="gpu tester, graphics card test, webgl benchmark, gpu performance test, graphics performance, hardware testing, gpu specs, rendering test"
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Monitor className="h-8 w-8 text-green-600 animate-bounce-in" />
            <h1 className="text-3xl font-bold animate-fade-in-right animate-stagger-1">GPU Tester</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-stagger-2">
            Test your graphics card performance with advanced WebGL rendering benchmarks and hardware analysis.
          </p>
        </div>

        {!webglSupported ? (
          <Card className="mb-8 border-red-200 bg-red-50 animate-fade-in-up animate-stagger-3">
            <CardHeader>
              <CardTitle className="text-red-800">WebGL Not Supported</CardTitle>
              <CardDescription className="text-red-700">
                Your browser doesn't support WebGL or it's disabled. Please enable WebGL to use the GPU tester.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {/* GPU Information */}
            {gpuInfo && (
              <Card className="mb-8 animate-fade-in-up animate-stagger-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-green-600 transition-transform duration-300 hover:scale-125" />
                    Graphics Hardware Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold">GPU:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.renderer}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Vendor:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.vendor}</p>
                      </div>
                      <div>
                        <span className="font-semibold">WebGL Version:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.version}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Shading Language:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.shadingLanguageVersion}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold">Max Texture Size:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.maxTextureSize}px</p>
                      </div>
                      <div>
                        <span className="font-semibold">Max Viewport:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.maxViewportDims[0]} x {gpuInfo.maxViewportDims[1]}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Vertex Attributes:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.maxVertexAttributes}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Texture Units:</span>
                        <p className="text-sm text-muted-foreground">{gpuInfo.maxTextureImageUnits}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benchmark Test */}
            <Card className="mb-8 animate-fade-in-up animate-stagger-4 hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600 transition-transform duration-300 hover:scale-125" />
                  Performance Benchmark
                </CardTitle>
                <CardDescription>
                  Run a WebGL rendering test to measure your GPU's performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={runBenchmark} 
                    disabled={isTesting}
                    className="gap-2"
                  >
                    {isTesting ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Benchmark
                      </>
                    )}
                  </Button>
                  
                  {isTesting && (
                    <div className="flex-1 max-w-md">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(testProgress)}%</span>
                      </div>
                      <Progress value={testProgress} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Canvas */}
                <div className="border rounded-lg overflow-hidden bg-gray-900">
                  <canvas 
                    ref={canvasRef}
                    className="w-full h-96 block"
                    style={{ maxWidth: '100%', height: '384px' }}
                  />
                </div>

                {/* Results */}
                {benchmarkResult && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {benchmarkResult.score}
                      </div>
                      <div className="text-sm text-green-700">Performance Score</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {benchmarkResult.fps}
                      </div>
                      <div className="text-sm text-blue-700">Average FPS</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(benchmarkResult.trianglesPerSecond / 1000).toFixed(1)}K
                      </div>
                      <div className="text-sm text-purple-700">Triangles/sec</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(benchmarkResult.duration / 1000).toFixed(1)}s
                      </div>
                      <div className="text-sm text-orange-700">Test Duration</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Rating */}
            {benchmarkResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {benchmarkResult.score >= 5000 && (
                      <Badge className="bg-green-500">Excellent Performance</Badge>
                    )}
                    {benchmarkResult.score >= 3000 && benchmarkResult.score < 5000 && (
                      <Badge className="bg-blue-500">Good Performance</Badge>
                    )}
                    {benchmarkResult.score >= 1500 && benchmarkResult.score < 3000 && (
                      <Badge className="bg-yellow-500">Average Performance</Badge>
                    )}
                    {benchmarkResult.score < 1500 && (
                      <Badge className="bg-red-500">Below Average Performance</Badge>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {benchmarkResult.score >= 5000 && "Your GPU can handle demanding graphics tasks and modern games at high settings."}
                      {benchmarkResult.score >= 3000 && benchmarkResult.score < 5000 && "Your GPU performs well for most graphics tasks and games at medium-high settings."}
                      {benchmarkResult.score >= 1500 && benchmarkResult.score < 3000 && "Your GPU can handle basic graphics tasks and games at medium settings."}
                      {benchmarkResult.score < 1500 && "Your GPU may struggle with demanding graphics tasks. Consider upgrading for better performance."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
