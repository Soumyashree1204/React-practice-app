import { useState } from "react";

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, task: "jumping" },
    { id: 2, task: "running" },
    { id: 3, task: "jogging" }
  ]);

  const addTodoAtStart = () => {
    const newTodo = {
      id: Date.now(),
      task: "New Task"
    };

    setTodos([newTodo, ...todos]);
  };

  return (
    <div>
      <h3>Todo List</h3>
      <button onClick={addTodoAtStart}>Add at Start</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.task}</li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;