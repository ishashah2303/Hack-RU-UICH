class TaskItem {
  String title;
  bool done;
  TaskItem(this.title, {this.done = false});
}

class TasksService {
  final List<TaskItem> tasks = [
    TaskItem('Study 5–7 PM'),
    TaskItem('Gym at 7:30 PM'),
    TaskItem('Call mom at 9 PM'),
  ];

  void addTask(String title) => tasks.add(TaskItem(title));
  void toggle(int index) => tasks[index].done = !tasks[index].done;
  void remove(int index) => tasks.removeAt(index);
}
