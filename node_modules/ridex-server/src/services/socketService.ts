import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let ioInstance: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer, corsOrigin: string): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join ride tracking room
    socket.on('join_ride', (rideId: string) => {
      socket.join(`ride_${rideId}`);
    });

    // Join driver private updates room
    socket.on('join_driver', (driverId: string) => {
      socket.join(`driver_${driverId}`);
    });

    // Driver location update broadcast
    socket.on('driver_location_update', (data: { rideId: string; lat: number; lng: number }) => {
      if (data?.rideId) {
        socket.to(`ride_${data.rideId}`).emit('driver_moved', {
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', () => {
      // Clean socket disconnect
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function broadcastRideStatusUpdate(rideId: string, status: string, payload: any = {}) {
  if (ioInstance) {
    ioInstance.to(`ride_${rideId}`).emit('ride_status_changed', {
      rideId,
      status,
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}

export function notifyDriverNewRideRequest(driverId: string, rideData: any) {
  if (ioInstance) {
    ioInstance.to(`driver_${driverId}`).emit('new_ride_request', rideData);
  }
}
