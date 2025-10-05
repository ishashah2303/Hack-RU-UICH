import 'package:flutter/material.dart';
import '../services/events_service.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  final _service = EventsService();
  double _availableHours = 2;

  @override
  Widget build(BuildContext context) {
    final suggestions = _service.suggestForDuration(Duration(hours: _availableHours.round()));

    return Scaffold(
      appBar: AppBar(title: const Text('Campus Event Recommender')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(children: [
              const Text('Time available:'),
              Expanded(
                child: Slider(
                  value: _availableHours,
                  min: 1, max: 6, divisions: 5,
                  label: '${_availableHours.round()}h',
                  onChanged: (v) => setState(() => _availableHours = v),
                ),
              ),
              Text('${_availableHours.round()}h'),
            ]),
            const SizedBox(height: 8),
            Expanded(
              child: ListView(
                children: suggestions.map((e) => Card(
                  child: ListTile(
                    title: Text(e.title),
                    subtitle: Text('${e.location} • ${e.startTimeFormatted} (${e.duration.inMinutes} min)'),
                    trailing: const Icon(Icons.arrow_forward),
                    onTap: () {
                      showDialog(context: context, builder: (_) => AlertDialog(
                        title: Text(e.title),
                        content: Text('Starts at ${e.startTimeFormatted}\nWhere: ${e.location}\nDuration: ${e.duration.inMinutes} min'),
                        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
                      ));
                    },
                  ),
                )).toList(),
              ),
            )
          ],
        ),
      ),
    );
  }
}
