import 'package:flutter/material.dart';
import '../services/transit_service.dart';

class TransitScreen extends StatefulWidget {
  const TransitScreen({super.key});

  @override
  State<TransitScreen> createState() => _TransitScreenState();
}

class _TransitScreenState extends State<TransitScreen> {
  final _service = TransitService();
  final _fromCtrl = TextEditingController(text: 'Dorms');
  final _toCtrl = TextEditingController(text: 'Downtown');
  bool _searching = false;
  List<RouteOption> _routes = [];

  Future<void> _search() async {
    setState(() => _searching = true);
    final res = await _service.findRoutes(_fromCtrl.text.trim(), _toCtrl.text.trim());
    setState(() {
      _routes = res;
      _searching = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Transit & Navigation')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(decoration: const InputDecoration(labelText: 'From'), controller: _fromCtrl),
            const SizedBox(height: 8),
            TextField(decoration: const InputDecoration(labelText: 'To'), controller: _toCtrl),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _searching ? null : _search,
                child: _searching ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                  : const Text('Find Route'),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: _routes.isEmpty
                ? const Center(child: Text('No routes yet. Search to see options.'))
                : ListView.builder(
                    itemCount: _routes.length,
                    itemBuilder: (_, i) {
                      final r = _routes[i];
                      return Card(
                        child: ListTile(
                          title: Text(r.summary),
                          subtitle: Text('${r.duration.inMinutes} min • ${r.steps.join(" → ")}'),
                        ),
                      );
                    },
                  ),
            )
          ],
        ),
      ),
    );
  }
}
