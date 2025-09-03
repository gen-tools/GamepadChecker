import { useEffect, useState, useCallback } from 'react';
import { Gamepad2, Zap, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';
import { createHowToStructuredData } from '@/components/SEO';

interface GamepadState {
  connected: boolean;
  id: string;
  index: number;
  buttons: boolean[];
  axes: number[];
  timestamp: number;
  hapticActuators?: any[];
  pose?: any;
  hand?: string;
}

interface InputStats {
  buttonPresses: number;
  totalInputTime: number;
  averageReactionTime: number;
  maxStickDistance: number;
}

export default function GamepadTester() {
  const [gamepads, setGamepads] = useState<GamepadState[]>([]);
  const [isVibrating, setIsVibrating] = useState(false);
  const [inputStats, setInputStats] = useState<InputStats>({
    buttonPresses: 0,
    totalInputTime: 0,
    averageReactionTime: 0,
    maxStickDistance: 0,
  });
  const [isLatencyTest, setIsLatencyTest] = useState(false);
  const [latencyTestStart, setLatencyTestStart] = useState<number>(0);
  const [latencyResults, setLatencyResults] = useState<number[]>([]);
  const [previousButtons, setPreviousButtons] = useState<boolean[]>([]);

  const updateGamepadState = useCallback(() => {
    const gamepadList = navigator.getGamepads();
    const newGamepads: GamepadState[] = [];

    for (let i = 0; i < gamepadList.length; i++) {
      const gamepad = gamepadList[i];
      if (gamepad) {
        const currentButtons = gamepad.buttons.map(button => button.pressed);

        // Track button presses for statistics
        if (previousButtons.length > 0) {
          const newPresses = currentButtons.filter((pressed, index) =>
            pressed && !previousButtons[index]
          ).length;

          if (newPresses > 0) {
            setInputStats(prev => ({
              ...prev,
              buttonPresses: prev.buttonPresses + newPresses,
              totalInputTime: prev.totalInputTime + 16, // Assuming 60fps updates
            }));

            // Latency test logic
            if (isLatencyTest && latencyTestStart > 0) {
              const latency = Date.now() - latencyTestStart;
              setLatencyResults(prev => [...prev, latency]);
              setIsLatencyTest(false);
              setLatencyTestStart(0);
            }
          }
        }

        // Track max stick distance
        if (gamepad.axes.length >= 2) {
          const stickDistance = Math.sqrt(gamepad.axes[0] ** 2 + gamepad.axes[1] ** 2);
          setInputStats(prev => ({
            ...prev,
            maxStickDistance: Math.max(prev.maxStickDistance, stickDistance),
          }));
        }

        setPreviousButtons(currentButtons);

        newGamepads.push({
          connected: gamepad.connected,
          id: gamepad.id,
          index: gamepad.index,
          buttons: currentButtons,
          axes: Array.from(gamepad.axes),
          timestamp: gamepad.timestamp,
        });
      }
    }

    setGamepads(newGamepads);
  }, [previousButtons, isLatencyTest, latencyTestStart]);

  const testVibration = async (gamepadIndex: number) => {
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (gamepad && gamepad.vibrationActuator) {
      setIsVibrating(true);
      try {
        await gamepad.vibrationActuator.playEffect('dual-rumble', {
          duration: 1000,
          strongMagnitude: 0.5,
          weakMagnitude: 0.3,
        });
      } catch (error) {
        console.log('Vibration not supported on this gamepad');
      }
      setTimeout(() => setIsVibrating(false), 1000);
    }
  };

  const startLatencyTest = () => {
    setIsLatencyTest(true);
    setLatencyTestStart(Date.now());
  };

  const resetStats = () => {
    setInputStats({
      buttonPresses: 0,
      totalInputTime: 0,
      averageReactionTime: 0,
      maxStickDistance: 0,
    });
    setLatencyResults([]);
  };

  const averageLatency = latencyResults.length > 0
    ? latencyResults.reduce((a, b) => a + b, 0) / latencyResults.length
    : 0;

  const testDeadZone = (gamepadIndex: number) => {
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (!gamepad) return;

    // Test for stick drift by monitoring small movements
    const leftStickX = gamepad.axes[0];
    const leftStickY = gamepad.axes[1];
    const rightStickX = gamepad.axes[2];
    const rightStickY = gamepad.axes[3];

    const deadZoneThreshold = 0.1;
    const leftStickDrift = Math.sqrt(leftStickX ** 2 + leftStickY ** 2);
    const rightStickDrift = Math.sqrt(rightStickX ** 2 + rightStickY ** 2);

    return {
      leftStickDrift: leftStickDrift < deadZoneThreshold ? 'Good' : 'Possible Drift',
      rightStickDrift: rightStickDrift < deadZoneThreshold ? 'Good' : 'Possible Drift',
      leftStickPrecision: Math.abs(leftStickX) + Math.abs(leftStickY),
      rightStickPrecision: Math.abs(rightStickX) + Math.abs(rightStickY)
    };
  };

  const getGamepadBrand = (id: string) => {
    const lowerID = id.toLowerCase();
    if (lowerID.includes('xbox') || lowerID.includes('microsoft')) return 'Xbox';
    if (lowerID.includes('sony') || lowerID.includes('playstation') || lowerID.includes('dualshock') || lowerID.includes('dualsense')) return 'PlayStation';
    if (lowerID.includes('nintendo') || lowerID.includes('switch')) return 'Nintendo';
    if (lowerID.includes('steam')) return 'Steam';
    return 'Generic';
  };

  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('Gamepad connected:', e.gamepad.id);
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    const interval = setInterval(updateGamepadState, 16); // ~60fps

    return () => {
      clearInterval(interval);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [updateGamepadState]);

  const renderJoystick = (x: number, y: number, label: string) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative w-24 h-24 bg-muted rounded-full border-2 border-border">
        <div
          className="absolute w-4 h-4 bg-primary rounded-full transform -translate-x-2 -translate-y-2 transition-all"
          style={{
            left: `${((x + 1) / 2) * 100}%`,
            top: `${((y + 1) / 2) * 100}%`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-border rounded-full" />
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        X: {x.toFixed(2)} Y: {y.toFixed(2)}
      </div>
    </div>
  );

  const howToStructuredData = createHowToStructuredData(
    'How to Test Your Gamepad',
    [
      'Connect your gamepad via USB or Bluetooth',
      'Press any button on your controller to activate it',
      'View real-time button presses and joystick movements',
      'Test vibration functionality with the vibration button'
    ]
  );

  const faqData = [
    {
      question: 'Why isn\'t my gamepad being detected?',
      answer: 'Make sure your gamepad is properly connected and press any button to activate it. Some wireless controllers need to be paired first.'
    },
    {
      question: 'Which gamepads are supported?',
      answer: 'Most modern gamepads including Xbox, PlayStation, and generic USB controllers are supported through the browser\'s Gamepad API.'
    },
    {
      question: 'Why doesn\'t vibration work?',
      answer: 'Vibration support varies by browser and gamepad model. Chrome and Edge have the best support for the Vibration API.'
    }
  ];

  const faqStructuredData = faqData;

  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Gamepad Tester - Check Your Controller Online</title>
        <meta name="description" content="Test your gamepad and controller inputs online in real time." />
        <meta name="keywords" content="gamepad tester, controller tester, joystick test, gamepad checker" />
        <link rel="canonical" href="https://gamepadchecker.com/gamepad-tester" />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="h-8 w-8 text-primary animate-bounce-in" />
            <h1 className="text-3xl font-bold animate-fade-in-right animate-stagger-1">Gamepad Tester</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-stagger-2">
            Test your gaming controllers with real-time input detection, button mapping, and vibration feedback.
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-8 animate-fade-in-up animate-stagger-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className={cn("h-5 w-5 transition-colors duration-500", gamepads.length > 0 ? "text-green-500 animate-pulse" : "text-muted-foreground")} />
              Connection Status
            </CardTitle>
            <CardDescription className={gamepads.length > 0 ? "animate-fade-in" : ""}>
              {gamepads.length > 0
                ? `${gamepads.length} gamepad(s) detected`
                : 'No gamepads detected. Please connect a controller and press any button.'
              }
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Unique Testing Features */}
        {gamepads.length > 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 animate-fade-in-up animate-stagger-4 hover-glow">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                Advanced Testing Features
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Unique features to test your gamepad's performance and responsiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{inputStats.buttonPresses}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Button Presses</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(inputStats.maxStickDistance * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Max Stick Range</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {averageLatency ? `${averageLatency.toFixed(0)}ms` : '--'}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Avg Latency</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{latencyResults.length}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Tests Complete</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={startLatencyTest}
                  disabled={isLatencyTest}
                  variant="outline"
                  size="sm"
                >
                  {isLatencyTest ? 'Press Any Button!' : 'Test Latency'}
                </Button>
                <Button onClick={resetStats} variant="outline" size="sm">
                  Reset Stats
                </Button>
              </div>
              {isLatencyTest && (
                <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <div className="text-yellow-800 dark:text-yellow-200 font-semibold">
                    Latency Test Active - Press any button as fast as you can!
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {gamepads.length === 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
                How to Connect Your Gamepad
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-orange-700 dark:text-orange-300">
              <div className="flex items-start gap-2 animate-fade-in-left animate-stagger-1">
                <span className="font-semibold">1.</span>
                <span>Connect your gamepad via USB or Bluetooth</span>
              </div>
              <div className="flex items-start gap-2 animate-fade-in-left animate-stagger-2">
                <span className="font-semibold">2.</span>
                <span>Press any button on your controller to activate it</span>
              </div>
              <div className="flex items-start gap-2 animate-fade-in-left animate-stagger-3">
                <span className="font-semibold">3.</span>
                <span>Your gamepad will appear below once detected</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gamepad Display */}
        {gamepads.map((gamepad) => (
          <Card key={gamepad.index} className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">#{gamepad.index}</Badge>
                    Gamepad Connected
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {gamepad.id}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => testVibration(gamepad.index)}
                  disabled={isVibrating}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {isVibrating ? 'Vibrating...' : 'Test Vibration'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Controller Visualization */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Controller Status</h3>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Button Status Cards */}
                  <div className="lg:col-span-1">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Button Status</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {gamepad.buttons.slice(0, 16).map((pressed, index) => (
                          <div
                            key={index}
                            className={cn(
                              "aspect-square rounded-md border flex items-center justify-center text-xs font-medium transition-all",
                              pressed
                                ? "bg-green-500 text-white border-green-500 shadow-md"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            )}
                          >
                            {index + 1}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {gamepad.buttons.filter(Boolean).length} of {gamepad.buttons.length} buttons active
                      </div>
                    </div>
                  </div>

                  {/* Controller Visual */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 rounded-xl p-6 border">
                      <div className="relative w-full max-w-sm mx-auto">
                        {/* Controller body */}
                        <div className="relative bg-gray-300 rounded-2xl px-8 py-4 shadow-lg">
                          {/* D-pad */}
                          <div className="absolute top-4 left-4">
                            <div className="relative w-12 h-12">
                              <div className={cn("absolute top-0 left-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-x-1/2", gamepad.buttons[12] && "bg-green-500")}></div>
                              <div className={cn("absolute bottom-0 left-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-x-1/2", gamepad.buttons[13] && "bg-green-500")}></div>
                              <div className={cn("absolute left-0 top-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-y-1/2", gamepad.buttons[14] && "bg-green-500")}></div>
                              <div className={cn("absolute right-0 top-1/2 w-4 h-4 bg-gray-400 rounded-sm transform -translate-y-1/2", gamepad.buttons[15] && "bg-green-500")}></div>
                            </div>
                          </div>

                          {/* Face buttons */}
                          <div className="absolute top-4 right-4">
                            <div className="relative w-12 h-12">
                              <div className={cn("absolute top-0 left-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-x-1/2", gamepad.buttons[3] && "bg-green-500")}></div>
                              <div className={cn("absolute bottom-0 left-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-x-1/2", gamepad.buttons[0] && "bg-green-500")}></div>
                              <div className={cn("absolute left-0 top-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-y-1/2", gamepad.buttons[2] && "bg-green-500")}></div>
                              <div className={cn("absolute right-0 top-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-y-1/2", gamepad.buttons[1] && "bg-green-500")}></div>
                            </div>
                          </div>

                          {/* Analog sticks */}
                          <div className="absolute bottom-2 left-6">
                            <div className={cn("w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500", gamepad.buttons[10] && "bg-green-500")}></div>
                          </div>
                          <div className="absolute bottom-2 right-6">
                            <div className={cn("w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500", gamepad.buttons[11] && "bg-green-500")}></div>
                          </div>

                          {/* Shoulder buttons */}
                          <div className="absolute -top-2 left-4">
                            <div className={cn("w-8 h-3 bg-gray-400 rounded-t-lg", gamepad.buttons[4] && "bg-green-500")}></div>
                          </div>
                          <div className="absolute -top-2 right-4">
                            <div className={cn("w-8 h-3 bg-gray-400 rounded-t-lg", gamepad.buttons[5] && "bg-green-500")}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Connection</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Connected</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Input Count</h4>
                        <div className="text-2xl font-bold">{inputStats.buttonPresses}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Latency</h4>
                        <div className="text-lg font-semibold">
                          {averageLatency ? `${averageLatency.toFixed(0)}ms` : '--'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analog Sticks */}
              {gamepad.axes.length >= 4 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Analog Sticks</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
                    {renderJoystick(gamepad.axes[0], gamepad.axes[1], "Left Stick")}
                    {renderJoystick(gamepad.axes[2], gamepad.axes[3], "Right Stick")}
                  </div>
                </div>
              )}

              {/* Triggers */}
              {gamepad.axes.length > 4 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Triggers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gamepad.axes.slice(4).map((value, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Trigger {index + 1}</span>
                          <span>{((value + 1) / 2 * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(value + 1) / 2 * 100} className="h-3" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Why isn't my gamepad being detected?</h4>
              <p className="text-sm text-muted-foreground">
                Make sure your gamepad is properly connected and press any button to activate it. 
                Some wireless controllers need to be paired first.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Which gamepads are supported?</h4>
              <p className="text-sm text-muted-foreground">
                Most modern gamepads including Xbox, PlayStation, and generic USB controllers are supported 
                through the browser's Gamepad API.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Why doesn't vibration work?</h4>
              <p className="text-sm text-muted-foreground">
                Vibration support varies by browser and gamepad model. Chrome and Edge have the best support 
                for the Vibration API.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
