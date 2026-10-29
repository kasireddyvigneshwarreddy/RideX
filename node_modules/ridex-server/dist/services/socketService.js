"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
exports.getIO = getIO;
exports.broadcastRideStatusUpdate = broadcastRideStatusUpdate;
exports.notifyDriverNewRideRequest = notifyDriverNewRideRequest;
const socket_io_1 = require("socket.io");
let ioInstance = null;
function initializeSocket(httpServer, corsOrigin) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: [corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        // Join ride tracking room
        socket.on('join_ride', (rideId) => {
            socket.join(`ride_${rideId}`);
        });
        // Join driver private updates room
        socket.on('join_driver', (driverId) => {
            socket.join(`driver_${driverId}`);
        });
        // Driver location update broadcast
        socket.on('driver_location_update', (data) => {
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
function getIO() {
    return ioInstance;
}
function broadcastRideStatusUpdate(rideId, status, payload = {}) {
    if (ioInstance) {
        ioInstance.to(`ride_${rideId}`).emit('ride_status_changed', {
            rideId,
            status,
            timestamp: new Date().toISOString(),
            ...payload,
        });
    }
}
function notifyDriverNewRideRequest(driverId, rideData) {
    if (ioInstance) {
        ioInstance.to(`driver_${driverId}`).emit('new_ride_request', rideData);
    }
}
