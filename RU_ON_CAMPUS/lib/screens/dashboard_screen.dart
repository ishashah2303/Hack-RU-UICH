import 'package:flutter/material.dart';
import '../routes.dart';
import '../widgets/home_button.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  void _logout(BuildContext context) {
    // Clear any stored data here if needed (e.g., SharedPreferences or Firebase signOut)
    // For now, just navigate back to login
    Navigator.pushNamedAndRemoveUntil(context, Routes.login, (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    final buttons = [
      HomeButton(
        icon: Icons.school,
        title: 'Study Buddy Concierge',
        subtitle: 'Reserve study rooms (mock) with voice confirm',
        onTap: () => Navigator.pushNamed(context, Routes.studyBuddy),
      ),
      HomeButton(
        icon: Icons.local_cafe,
        title: 'Food + Coffee Runner',
        subtitle: 'Order pizza & coffee (simulated ticket)',
        onTap: () => Navigator.pushNamed(context, Routes.foodRunner),
      ),
      HomeButton(
        icon: Icons.event,
        title: 'Campus Event Recommender',
        subtitle: 'What to do tonight? Get suggestions',
        onTap: () => Navigator.pushNamed(context, Routes.events),
      ),
      HomeButton(
        icon: Icons.directions_bus,
        title: 'Transit & Navigation',
        subtitle: 'Find routes around campus/city',
        onTap: () => Navigator.pushNamed(context, Routes.transit),
      ),
      HomeButton(
        icon: Icons.checklist,
        title: 'Daily Life Automator',
        subtitle: 'To-Dos, reminders, planner',
        onTap: () => Navigator.pushNamed(context, Routes.dailyAutomator),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('RUOnCampus'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () => _logout(context),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, c) {
          final isWide = c.maxWidth > 700;
          if (isWide) {
            return GridView.count(
              padding: const EdgeInsets.all(16),
              crossAxisCount: 2,
              childAspectRatio: 2.4,
              children: buttons,
            );
          }
          return ListView(
            padding: const EdgeInsets.all(8),
            children: buttons,
          );
        },
      ),
    );
  }
}
