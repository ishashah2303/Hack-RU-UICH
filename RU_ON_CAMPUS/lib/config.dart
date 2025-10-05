/// Configure backend base URLs here when you connect Python services.
/// For now, we use mock services (in-memory).
class AppConfig {
  static const useMock = true;

  // placeholders for later wiring
  static const studyBuddyBaseUrl = 'http://127.0.0.1:5052';
  static const foodRunnerBaseUrl = 'http://127.0.0.1:5053';
  static const eventsBaseUrl = 'http://127.0.0.1:5054';
  static const transitBaseUrl = 'http://127.0.0.1:5055';
  static const tasksBaseUrl = 'http://127.0.0.1:5056';
}
