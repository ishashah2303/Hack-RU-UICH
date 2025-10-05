import 'package:flutter/material.dart';
import 'theme.dart';
import 'routes.dart';
import 'screens/dashboard_screen.dart';
import 'screens/study_buddy_screen.dart';
import 'screens/food_runner_screen.dart';
import 'screens/events_screen.dart';
import 'screens/transit_screen.dart';
import 'screens/daily_life_automator_screen.dart';

void main() {
  runApp(const RUOnCampusApp());
}

class RUOnCampusApp extends StatelessWidget {
  const RUOnCampusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RUOnCampus',
      theme: buildScarletTheme(),
      debugShowCheckedModeBanner: false,
      initialRoute: Routes.dashboard,
      routes: {
        Routes.dashboard: (_) => const DashboardScreen(),
        Routes.studyBuddy: (_) => const StudyBuddyScreen(),
        Routes.foodRunner: (_) => const FoodRunnerScreen(),
        Routes.events: (_) => const EventsScreen(),
        Routes.transit: (_) => const TransitScreen(),
        Routes.dailyAutomator: (_) => const DailyLifeAutomatorScreen(),
      },
    );
  }
}
