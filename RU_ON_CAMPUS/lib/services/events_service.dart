import 'package:intl/intl.dart';

class CampusEvent {
  final String title;
  final String location;
  final DateTime startTime;
  final Duration duration;

  CampusEvent({required this.title, required this.location, required this.startTime, required this.duration});

  String get startTimeFormatted => DateFormat('EEE, h:mm a').format(startTime);
}

class EventsService {
  final _now = DateTime.now();

  // Mock events; replace with backend later
  late final List<CampusEvent> _events = [
    CampusEvent(title: 'Robotics Club Demo', location: 'Hall A', startTime: _now.add(const Duration(hours: 1)), duration: const Duration(minutes: 60)),
    CampusEvent(title: 'Hackathon Workshop', location: 'Lab 2', startTime: _now.add(const Duration(hours: 2)), duration: const Duration(minutes: 90)),
    CampusEvent(title: 'Movie Night: Interstellar', location: 'Auditorium', startTime: _now.add(const Duration(hours: 3)), duration: const Duration(minutes: 150)),
    CampusEvent(title: 'Football Watch Party', location: 'Student Center', startTime: _now.add(const Duration(hours: 4)), duration: const Duration(minutes: 120)),
  ];

  List<CampusEvent> suggestForDuration(Duration available) {
    // simple heuristic: events starting within next 4h and duration <= available
    return _events.where((e) =>
      e.startTime.isBefore(_now.add(const Duration(hours: 4))) &&
      e.duration <= available
    ).toList();
  }

  List<CampusEvent> all() => _events;
}
