import React, { useState, useEffect } from 'react';

// Define the types for our data
interface Waypoint {
  lat: number;
  lon: number;
}

interface Route {
  id: string;
  name: string;
  waypoints: Waypoint[];
}

const API_URL = 'http://127.0.0.1:8000'; // Assuming the backend is running on port 8000

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await fetch(`${API_URL}/routes`);
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleCreate = () => {
    setSelectedRoute({ id: '', name: '', waypoints: [] });
    setIsEditing(true);
  };

  const handleEdit = (route: Route) => {
    setSelectedRoute(route);
    setIsEditing(true);
  };

  const handleDelete = async (routeId: string) => {
    try {
      await fetch(`${API_URL}/routes/${routeId}`, {
        method: 'DELETE',
      });
      fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  const handleSave = async (routeData: Route) => {
    const method = routeData.id ? 'PUT' : 'POST';
    const url = routeData.id ? `${API_URL}/routes/${routeData.id}` : `${API_URL}/routes`;

    try {
      await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData),
      });
      fetchRoutes();
      setIsEditing(false);
      setSelectedRoute(null);
    } catch (error) {
      console.error('Error saving route:', error);
    }
  };

  return (
    <div>
      <h2>Route Management</h2>
      {isEditing && selectedRoute ? (
        <RouteForm route={selectedRoute} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      ) : (
        <>
          <button onClick={handleCreate}>Create New Route</button>
          <RouteList routes={routes} onEdit={handleEdit} onDelete={handleDelete} />
        </>
      )}
    </div>
  );
};

// Placeholder for the form and list components
const RouteList: React.FC<{ routes: Route[], onEdit: (route: Route) => void, onDelete: (id: string) => void }> = ({ routes, onEdit, onDelete }) => (
  <ul>
    {routes.map(route => (
      <li key={route.id}>
        {route.name}
        <button onClick={() => onEdit(route)}>Edit</button>
        <button onClick={() => onDelete(route.id)}>Delete</button>
      </li>
    ))}
  </ul>
);

const RouteForm: React.FC<{ route: Route, onSave: (route: Route) => void, onCancel: () => void }> = ({ route, onSave, onCancel }) => {
    const [name, setName] = useState(route.name);
    const [waypoints, setWaypoints] = useState(route.waypoints);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...route, name, waypoints });
    };
    
    // A simple way to add waypoints for now
    const addWaypoint = () => {
        setWaypoints([...waypoints, { lat: 0, lon: 0 }]);
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Route Name:
                <input type="text" value={name} onChange={e => setName(e.target.value)} />
            </label>
            <hr />
            Waypoints:
            <button type="button" onClick={addWaypoint}>Add Waypoint</button>
            {waypoints.map((waypoint, index) => (
                <div key={index}>
                    <input type="number" value={waypoint.lat} onChange={e => {
                        const newWaypoints = [...waypoints];
                        newWaypoints[index].lat = parseFloat(e.target.value);
                        setWaypoints(newWaypoints);
                    }} />
                    <input type="number" value={waypoint.lon} onChange={e => {
                        const newWaypoints = [...waypoints];
                        newWaypoints[index].lon = parseFloat(e.target.value);
                        setWaypoints(newWaypoints);
                    }} />
                </div>
            ))}
            <hr />
            <button type="submit">Save</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
}

export default RouteManagement;
