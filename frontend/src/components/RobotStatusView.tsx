import React, { useState, useEffect } from 'react';

interface RobotStatus {
  status_message: string;
  current_route_id: string | null;
  current_waypoint_index: number | null;
  timestamp: string;
}

const API_URL = 'http://127.0.0.1:8000';

const RobotStatusView: React.FC = () => {
  const [status, setStatus] = useState<RobotStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/robot/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        } else {
          setStatus(null);
        }
      } catch (error) {
        console.error('Error fetching robot status:', error);
        setStatus(null);
      }
    };

    const intervalId = setInterval(fetchStatus, 2000); // Poll every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  if (!status) {
    return (
      <div>
        <h2>Robot Status</h2>
        <p>Awaiting status from robot...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Robot Status</h2>
      <p><strong>Status:</strong> {status.status_message}</p>
      {status.current_route_id && (
        <p><strong>Route:</strong> {status.current_route_id}</p>
      )}
      {status.current_waypoint_index !== null && (
        <p><strong>Waypoint:</strong> {status.current_waypoint_index + 1}</p>
      )}
      <p><em>Last updated: {new Date(status.timestamp).toLocaleTimeString()}</em></p>
    </div>
  );
};

export default RobotStatusView;
