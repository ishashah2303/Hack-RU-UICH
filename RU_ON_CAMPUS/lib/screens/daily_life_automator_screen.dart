import 'package:flutter/material.dart';
import '../services/tasks_service.dart';

class DailyLifeAutomatorScreen extends StatefulWidget {
  const DailyLifeAutomatorScreen({super.key});

  @override
  State<DailyLifeAutomatorScreen> createState() => _DailyLifeAutomatorScreenState();
}

class _DailyLifeAutomatorScreenState extends State<DailyLifeAutomatorScreen> {
  final _service = TasksService();
  final _ctrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final tasks = _service.tasks;

    return Scaffold(
      appBar: AppBar(title: const Text('Daily Life Automator')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _ctrl,
                    decoration: const InputDecoration(
                      labelText: 'Add a task (e.g., Study 5–7 PM)',
                    ),
                    onSubmitted: (_) {
                      if (_ctrl.text.trim().isEmpty) return;
                      setState(() {
                        _service.addTask(_ctrl.text.trim());
                        _ctrl.clear();
                      });
                    },
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    if (_ctrl.text.trim().isEmpty) return;
                    setState(() {
                      _service.addTask(_ctrl.text.trim());
                      _ctrl.clear();
                    });
                  },
                  child: const Text('Add'),
                )
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: tasks.length,
              itemBuilder: (_, i) {
                final t = tasks[i];
                return Card(
                  child: CheckboxListTile(
                    value: t.done,
                    title: Text(t.title),
                    onChanged: (v) => setState(() => _service.toggle(i)),
                    secondary: IconButton(
                      icon: const Icon(Icons.delete_outline),
                      onPressed: () => setState(() => _service.remove(i)),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
