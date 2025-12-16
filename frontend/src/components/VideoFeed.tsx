import React, { useState, useEffect } from 'react';

interface VideoFrame {
  frame: number;
  timestamp: string;
  status: string;
  object_detected: string | null;
}

const WS_URL = 'ws://127.0.0.1:8000/ws/video';

const VideoFeed: React.FC = () => {
  const [frame, setFrame] = useState<VideoFrame | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Connected to video feed');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFrame(data);
    };

    ws.onclose = () => {
      console.log('Disconnected from video feed');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      ws.close();
    };
  }, []);

  const alertStyle: React.CSSProperties = frame?.object_detected ? {
    border: '2px solid red',
    padding: '10px',
    backgroundColor: '#fff0f0'
  } : {};

  return (
    <div style={alertStyle}>
      <h2>Live Video Feed</h2>
      <p><strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}</p>
      {frame?.object_detected && (
        <h3 style={{ color: 'red' }}>ALERT: {frame.object_detected.toUpperCase()} DETECTED!</h3>
      )}
      {frame && frame.status === 'Streaming' ? (
        <div>
          <p>Frame: {frame.frame}</p>
          <p>Timestamp: {new Date(frame.timestamp).toLocaleTimeString()}</p>
        </div>
      ) : (
        <p>{frame ? frame.status : 'Awaiting video stream...'}</p>
      )}
    </div>
  );
};

export default VideoFeed;
