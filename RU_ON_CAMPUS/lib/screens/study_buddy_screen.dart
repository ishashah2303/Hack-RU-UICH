import 'package:flutter/material.dart';
import '../services/study_buddy_service.dart';

class StudyBuddyScreen extends StatefulWidget {
  const StudyBuddyScreen({super.key});

  @override
  State<StudyBuddyScreen> createState() => _StudyBuddyScreenState();
}

class _StudyBuddyScreenState extends State<StudyBuddyScreen> {
  final _service = StudyBuddyService();
  late Future<List<Room>> _roomsFuture;
  TimeOfDay? _start;
  TimeOfDay? _end;

  @override
  void initState() {
    super.initState();
    _roomsFuture = _service.fetchRooms();
    _start = const TimeOfDay(hour: 15, minute: 0);
    _end = const TimeOfDay(hour: 17, minute: 0);
  }

  Future<void> _pickTime({required bool start}) async {
    final initial = start ? _start : _end;
    final picked = await showTimePicker(context: context, initialTime: initial ?? TimeOfDay.now());
    if (picked != null) {
      setState(() {
        if (start) _start = picked; else _end = picked;
      });
    }
  }

  Future<void> _reserve(Room room) async {
    if (_start == null || _end == null) return;
    final result = await _service.reserveRoom(room.id, _start!, _end!);
    if (result.success) {
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Reservation Confirmed'),
          content: Text('Reserved ${room.name} from ${_start!.format(context)} to ${_end!.format(context)}.\n'
              'Ticket: ${result.ticketId}'),
          actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
        ),
      );
      setState(() {
        _roomsFuture = _service.fetchRooms(); // refresh availability
      });
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Study Buddy Concierge')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _pickTime(start: true),
                    child: Text('Start: ${_start?.format(context) ?? '--:--'}'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _pickTime(start: false),
                    child: Text('End: ${_end?.format(context) ?? '--:--'}'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Room>>(
              future: _roomsFuture,
              builder: (_, snapshot) {
                if (!snapshot.hasData) {
                  if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  }
                  return const Center(child: CircularProgressIndicator());
                }
                final rooms = snapshot.data!;
                return ListView.builder(
                  itemCount: rooms.length,
                  itemBuilder: (_, i) {
                    final r = rooms[i];
                    return Card(
                      child: ListTile(
                        title: Text(r.name),
                        subtitle: Text(r.available ? 'Available' : 'Reserved'),
                        trailing: ElevatedButton(
                          onPressed: r.available ? () => _reserve(r) : null,
                          child: const Text('Reserve'),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
