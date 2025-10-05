import 'dart:math';
import 'package:flutter/material.dart';
import '../config.dart';

class Room {
  final String id;
  final String name;
  final bool available;
  Room({required this.id, required this.name, required this.available});

  Room copyWith({bool? available}) => Room(id: id, name: name, available: available ?? this.available);
}

class ReservationResult {
  final bool success;
  final String ticketId;
  final String message;
  ReservationResult({required this.success, required this.ticketId, required this.message});
}

class StudyBuddyService {
  // In-memory mock; replace with HTTP when Python endpoints are ready.
  final _mockRooms = <Room>[
    Room(id: '101', name: 'Room 101', available: true),
    Room(id: '204', name: 'Room 204', available: true),
    Room(id: '305', name: 'Room 305', available: false),
    Room(id: '402', name: 'Room 402', available: true),
  ];

  Future<List<Room>> fetchRooms() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _mockRooms.map((r) => r).toList();
  }

  Future<ReservationResult> reserveRoom(String roomId, TimeOfDay start, TimeOfDay end) async {
    await Future.delayed(const Duration(milliseconds: 250));
    final idx = _mockRooms.indexWhere((r) => r.id == roomId);
    if (idx == -1) {
      return ReservationResult(success: false, ticketId: '-', message: 'Room not found');
    }
    if (!_mockRooms[idx].available) {
      return ReservationResult(success: false, ticketId: '-', message: 'Room already reserved');
    }
    _mockRooms[idx] = _mockRooms[idx].copyWith(available: false);
    final ticket = 'RSV-${Random().nextInt(900000) + 100000}';
    return ReservationResult(success: true, ticketId: ticket, message: 'Reserved');
  }
}
