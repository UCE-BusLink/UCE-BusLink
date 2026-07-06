import { useState, useEffect, useRef } from 'react';
import type { ApiRoute } from '../types';
import { decodePolyline, calculateDistance } from '../utils/polyline';
import type { DriverPosition } from './useDriverLocationPublisher';

interface UseTripSimulationProps {
  route: ApiRoute | null;
  isSimulating: boolean;
}

export function useTripSimulation({ route, isSimulating }: UseTripSimulationProps): DriverPosition | null {
  const [position, setPosition] = useState<DriverPosition | null>(null);
  
  const pointsRef = useRef<[number, number][]>([]);
  const currentPointIndexRef = useRef<number>(0);
  const exactLocationRef = useRef<[number, number]>([0, 0]);
  const visitedStopsRef = useRef<Set<string>>(new Set());
  const pauseTicksRef = useRef<number>(0);

  useEffect(() => {
    if (!isSimulating || !route) {
      setPosition(null);
      pointsRef.current = [];
      currentPointIndexRef.current = 0;
      visitedStopsRef.current = new Set();
      pauseTicksRef.current = 0;
      return;
    }

    // Initialize points
    if (pointsRef.current.length === 0) {
      let pts: [number, number][] = [];
      if (route.pathPolyline) {
        pts = decodePolyline(route.pathPolyline);
      } else if (route.stops && route.stops.length > 0) {
        // Fallback to straight lines between stops
        pts = route.stops
          .slice()
          .sort((a, b) => a.stopOrder - b.stopOrder)
          .map(s => [s.latitude, s.longitude] as [number, number]);
      }

      if (pts.length > 0) {
        pointsRef.current = pts;
        currentPointIndexRef.current = 0;
        exactLocationRef.current = [...pts[0]];
        setPosition({
          latitude: pts[0][0],
          longitude: pts[0][1],
          velocity: 0
        });
      }
    }

    const intervalId = setInterval(() => {
      const pts = pointsRef.current;
      const currentIndex = currentPointIndexRef.current;
      
      if (pts.length === 0 || currentIndex >= pts.length - 1) {
        // Finished or no points
        if (currentIndex >= pts.length - 1 && pts.length > 0) {
           setPosition({
             latitude: pts[pts.length - 1][0],
             longitude: pts[pts.length - 1][1],
             velocity: 0
           });
        }
        return;
      }

      // Check for pauses at stops
      if (pauseTicksRef.current > 0) {
        pauseTicksRef.current -= 1;
        // Keep publishing same location with 0 velocity during pause
        setPosition({
          latitude: exactLocationRef.current[0],
          longitude: exactLocationRef.current[1],
          velocity: 0
        });
        return;
      }

      const targetPoint = pts[currentIndex + 1];
      const currentLoc = exactLocationRef.current;
      
      const distToTarget = calculateDistance(currentLoc[0], currentLoc[1], targetPoint[0], targetPoint[1]);
      
      // Random speed between 20 and 60 km/h
      const speedKmh = Math.floor(Math.random() * (60 - 20 + 1)) + 20;
      const speedMs = speedKmh / 3.6; // meters per second
      // We are ticking every 1 second, so distance moved = speedMs
      const distanceToMove = speedMs;

      let newLoc: [number, number];
      if (distanceToMove >= distToTarget) {
        // We reached or overshot the target point
        newLoc = [...targetPoint];
        currentPointIndexRef.current += 1;
      } else {
        // Interpolate position
        const ratio = distanceToMove / distToTarget;
        const newLat = currentLoc[0] + (targetPoint[0] - currentLoc[0]) * ratio;
        const newLng = currentLoc[1] + (targetPoint[1] - currentLoc[1]) * ratio;
        newLoc = [newLat, newLng];
      }
      
      exactLocationRef.current = newLoc;

      // Check proximity to unvisited stops
      if (route.stops) {
        for (const stop of route.stops) {
          if (!visitedStopsRef.current.has(stop.stopId)) {
            const distToStop = calculateDistance(newLoc[0], newLoc[1], stop.latitude, stop.longitude);
            // If within 30 meters of a stop
            if (distToStop < 30) { 
              visitedStopsRef.current.add(stop.stopId);
              pauseTicksRef.current = 5; // Pause for 5 seconds
              // Set velocity to 0 immediately when arriving
              setPosition({
                latitude: newLoc[0],
                longitude: newLoc[1],
                velocity: 0
              });
              return; // Skip normal update this tick
            }
          }
        }
      }

      setPosition({
        latitude: newLoc[0],
        longitude: newLoc[1],
        velocity: speedKmh
      });

    }, 1000);

    return () => clearInterval(intervalId);
  }, [isSimulating, route]);

  return position;
}
