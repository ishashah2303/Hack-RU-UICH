class RouteOption {
  final String summary;
  final Duration duration;
  final List<String> steps;
  RouteOption({required this.summary, required this.duration, required this.steps});
}

class TransitService {
  Future<List<RouteOption>> findRoutes(String from, String to) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return [
      RouteOption(summary: 'Bus 1 → Walk', duration: const Duration(minutes: 18), steps: [from, 'Bus 1', 'Stop 3', 'Walk', to]),
      RouteOption(summary: 'RU Shuttle → Walk', duration: const Duration(minutes: 22), steps: [from, 'RU Shuttle Red', 'Student Center', 'Walk', to]),
      RouteOption(summary: 'Walk', duration: const Duration(minutes: 35), steps: [from, 'Walk', to]),
    ];
  }
}
