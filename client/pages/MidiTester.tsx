import { useEffect, useState, useCallback } from 'react';
import { Music, Piano, Volume2, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';

interface MIDIDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  version: string;
  type: 'input' | 'output';
  state: 'connected' | 'disconnected';
}

interface MIDIMessage {
  timestamp: number;
  type: 'noteOn' | 'noteOff' | 'controlChange' | 'pitchBend' | 'programChange' | 'aftertouch' | 'other';
  channel: number;
  note?: number;
  velocity?: number;
  controller?: number;
  value?: number;
  raw: number[];
}

interface NoteInfo {
  note: number;
  name: string;
  octave: number;
  frequency: number;
  isActive: boolean;
  velocity: number;
}

export default function MidiTester() {
  const [midiAccess, setMidiAccess] = useState<any>(null);
  const [devices, setDevices] = useState<MIDIDeviceInfo[]>([]);
  const [messages, setMessages] = useState<MIDIMessage[]>([]);
  const [activeNotes, setActiveNotes] = useState<Map<number, NoteInfo>>(new Map());
  const [midiSupported, setMidiSupported] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const getNoteInfo = (midiNote: number): { name: string; octave: number; frequency: number } => {
    const name = noteNames[midiNote % 12];
    const octave = Math.floor(midiNote / 12) - 1;
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    return { name, octave, frequency };
  };

  const getMIDIMessageType = (status: number): MIDIMessage['type'] => {
    const messageType = status & 0xF0;
    switch (messageType) {
      case 0x80: return 'noteOff';
      case 0x90: return 'noteOn';
      case 0xB0: return 'controlChange';
      case 0xC0: return 'programChange';
      case 0xD0: return 'aftertouch';
      case 0xE0: return 'pitchBend';
      default: return 'other';
    }
  };

  const handleMIDIMessage = useCallback((event: any) => {
    const data = Array.from(event.data);
    const status = data[0];
    const channel = (status & 0x0F) + 1;
    const type = getMIDIMessageType(status);

    const message: MIDIMessage = {
      timestamp: event.timeStamp,
      type,
      channel,
      raw: data
    };

    if (type === 'noteOn' || type === 'noteOff') {
      const note = data[1];
      const velocity = data[2];
      message.note = note;
      message.velocity = velocity;

      const noteInfo = getNoteInfo(note);
      
      setActiveNotes(prev => {
        const newMap = new Map(prev);
        if (type === 'noteOn' && velocity > 0) {
          newMap.set(note, {
            note,
            name: `${noteInfo.name}${noteInfo.octave}`,
            octave: noteInfo.octave,
            frequency: noteInfo.frequency,
            isActive: true,
            velocity
          });
        } else {
          newMap.delete(note);
        }
        return newMap;
      });
    } else if (type === 'controlChange') {
      message.controller = data[1];
      message.value = data[2];
    } else if (type === 'pitchBend') {
      message.value = (data[2] << 7) | data[1];
    } else if (type === 'programChange') {
      message.value = data[1];
    }

    setMessages(prev => [message, ...prev.slice(0, 49)]); // Keep last 50 messages
    setTotalMessages(prev => prev + 1);
  }, []);

  const requestMIDIAccess = async () => {
    try {
      if (!navigator.requestMIDIAccess) {
        setMidiSupported(false);
        return;
      }

      const access = await navigator.requestMIDIAccess({ sysex: false });
      setMidiAccess(access);
      setIsConnected(true);

      // Get initial devices
      updateDeviceList(access);

      // Set up device change listeners
      access.onstatechange = () => updateDeviceList(access);

      // Set up input listeners
      setupInputListeners(access);

    } catch (error) {
      console.error('MIDI access failed:', error);
      setMidiSupported(false);
    }
  };

  const updateDeviceList = (access: any) => {
    const deviceList: MIDIDeviceInfo[] = [];
    
    // Add inputs
    for (const input of access.inputs.values()) {
      deviceList.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || 'Unknown',
        version: input.version || '1.0',
        type: 'input',
        state: input.state
      });
    }

    // Add outputs
    for (const output of access.outputs.values()) {
      deviceList.push({
        id: output.id,
        name: output.name || 'Unknown Device',
        manufacturer: output.manufacturer || 'Unknown',
        version: output.version || '1.0',
        type: 'output',
        state: output.state
      });
    }

    setDevices(deviceList);
  };

  const setupInputListeners = (access: any) => {
    for (const input of access.inputs.values()) {
      input.onmidimessage = handleMIDIMessage;
    }
  };

  const sendTestNote = () => {
    if (!midiAccess) return;

    const outputs = Array.from(midiAccess.outputs.values());
    if (outputs.length === 0) return;

    const output = outputs[0];
    const note = 60; // Middle C
    const velocity = 64;
    const channel = 0;

    // Note on
    output.send([0x90 | channel, note, velocity]);
    
    // Note off after 500ms
    setTimeout(() => {
      output.send([0x80 | channel, note, 0]);
    }, 500);
  };

  const clearMessages = () => {
    setMessages([]);
    setTotalMessages(0);
  };

  const formatMIDIData = (data: number[]) => {
    return data.map(byte => byte.toString(16).padStart(2, '0').toUpperCase()).join(' ');
  };

  useEffect(() => {
    requestMIDIAccess();
  }, []);

  const renderPianoKey = (note: number, isBlack: boolean = false) => {
    const noteInfo = activeNotes.get(note);
    const isActive = noteInfo?.isActive || false;
    
    return (
      <div
        key={note}
        className={`
          ${isBlack 
            ? 'w-8 h-24 bg-gray-800 absolute transform -translate-x-1/2 z-10' 
            : 'w-12 h-40 bg-white border border-gray-300'
          }
          ${isActive 
            ? isBlack ? 'bg-purple-600' : 'bg-blue-200' 
            : ''
          }
          transition-colors duration-100 rounded-b-md
        `}
        style={isBlack ? { left: '50%' } : {}}
      >
        {isActive && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="text-xs text-center">
              <div className="font-bold">{noteInfo.name}</div>
              <div className="text-[10px]">{noteInfo.velocity}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPianoKeyboard = () => {
    const whiteKeys = [];
    const blackKeys = [];
    
    // Render 2 octaves starting from C4 (note 60)
    for (let octave = 0; octave < 2; octave++) {
      const baseNote = 60 + (octave * 12);
      
      // White keys
      [0, 2, 4, 5, 7, 9, 11].forEach((offset, index) => {
        whiteKeys.push(
          <div key={baseNote + offset} className="relative">
            {renderPianoKey(baseNote + offset)}
          </div>
        );
      });
      
      // Black keys
      [1, 3, 6, 8, 10].forEach(offset => {
        blackKeys.push(
          <div 
            key={baseNote + offset} 
            className="absolute"
            style={{ 
              left: `${(offset === 1 ? 8.5 : offset === 3 ? 25.5 : offset === 6 ? 56 : offset === 8 ? 73 : 90) + (octave * 84)}px`
            }}
          >
            {renderPianoKey(baseNote + offset, true)}
          </div>
        );
      });
    }

    return (
      <div className="relative flex bg-gray-100 p-4 rounded-lg overflow-x-auto">
        <div className="flex relative">
          {whiteKeys}
          {blackKeys}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <SEO 
        title="MIDI Tester - Test MIDI Devices Online | MIDI Input Monitor"
        description="Test your MIDI devices online with real-time message monitoring, note visualization, and device detection. Perfect for testing MIDI keyboards, controllers, and interfaces."
        keywords="midi tester, midi device test, midi keyboard test, midi input monitor, midi controller test, midi message analyzer"
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="h-8 w-8 text-purple-600 animate-bounce-in" />
            <h1 className="text-3xl font-bold animate-fade-in-right animate-stagger-1">MIDI Tester</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-stagger-2">
            Test your MIDI devices with real-time message monitoring, note visualization, and device detection.
          </p>
        </div>

        {!midiSupported ? (
          <Card className="mb-8 border-red-200 bg-red-50 animate-fade-in-up animate-stagger-3">
            <CardHeader>
              <CardTitle className="text-red-800">MIDI Not Supported</CardTitle>
              <CardDescription className="text-red-700">
                Your browser doesn't support the Web MIDI API. Please use Chrome, Edge, or Opera for MIDI testing.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {/* Connection Status */}
            <Card className="mb-8 animate-fade-in-up animate-stagger-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className={`h-5 w-5 transition-colors duration-500 ${isConnected ? 'text-green-500 animate-pulse' : 'text-red-500'}`} />
                  MIDI Connection Status
                </CardTitle>
                <CardDescription>
                  {isConnected 
                    ? `Connected to MIDI system - ${devices.length} device(s) detected`
                    : 'Not connected to MIDI system'
                  }
                </CardDescription>
              </CardHeader>
              {!isConnected && (
                <CardContent>
                  <Button onClick={requestMIDIAccess} className="gap-2">
                    <Zap className="h-4 w-4" />
                    Connect to MIDI
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Devices */}
            {devices.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>MIDI Devices</CardTitle>
                  <CardDescription>Connected MIDI input and output devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.map(device => (
                      <div key={device.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{device.name}</h4>
                          <div className="flex gap-2">
                            <Badge variant={device.type === 'input' ? 'default' : 'secondary'}>
                              {device.type}
                            </Badge>
                            <Badge variant={device.state === 'connected' ? 'default' : 'destructive'}>
                              {device.state}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Manufacturer: {device.manufacturer}</div>
                          <div>Version: {device.version}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {devices.some(d => d.type === 'output') && (
                    <div className="mt-4">
                      <Button onClick={sendTestNote} variant="outline" className="gap-2">
                        <Piano className="h-4 w-4" />
                        Send Test Note
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Active Notes Display */}
            {activeNotes.size > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Active Notes</CardTitle>
                  <CardDescription>Currently pressed keys and their information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from(activeNotes.values()).map(note => (
                      <div key={note.note} className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {note.name}
                        </div>
                        <div className="text-sm text-purple-700">
                          <div>MIDI Note: {note.note}</div>
                          <div>Velocity: {note.velocity}</div>
                          <div>Frequency: {note.frequency.toFixed(1)}Hz</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Piano Visualization */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Piano Visualization</CardTitle>
                <CardDescription>Virtual piano showing active notes in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                {renderPianoKeyboard()}
              </CardContent>
            </Card>

            {/* Statistics */}
            {totalMessages > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>MIDI Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalMessages}</div>
                      <div className="text-sm text-blue-700">Total Messages</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{activeNotes.size}</div>
                      <div className="text-sm text-green-700">Active Notes</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {devices.filter(d => d.type === 'input' && d.state === 'connected').length}
                      </div>
                      <div className="text-sm text-purple-700">Active Inputs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Message Log */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>MIDI Message Log</CardTitle>
                    <CardDescription>Real-time MIDI message monitoring (last 50 messages)</CardDescription>
                  </div>
                  <Button onClick={clearMessages} variant="outline" size="sm">
                    Clear Log
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No MIDI messages received yet.</p>
                    <p className="text-sm">Connect a MIDI device and start playing to see messages here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {messages.map((message, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{message.type}</Badge>
                          <span>Ch: {message.channel}</span>
                          {message.note !== undefined && (
                            <span>Note: {message.note} ({getNoteInfo(message.note).name}{getNoteInfo(message.note).octave})</span>
                          )}
                          {message.velocity !== undefined && <span>Vel: {message.velocity}</span>}
                          {message.controller !== undefined && <span>CC: {message.controller}</span>}
                          {message.value !== undefined && <span>Val: {message.value}</span>}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {formatMIDIData(message.raw)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
