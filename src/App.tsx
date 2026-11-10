import './App.css';
import { useState, useEffect } from 'react';

type Priority = 'low' | 'medium' | 'high';

type Task = {
	id: string;
	title: string;
	completed: boolean;
	priority: Priority;
};

type Filter = 'all' | 'active' | 'completed';

const initialTasks: Task[] = [
	{
		id: '1',
		title: 'Learn React',
		completed: false,
		priority: 'high',
	},
	{
		id: '2',
		title: 'Build Task Manager',
		completed: false,
		priority: 'medium',
	},
	{
		id: '3',
		title: 'Drink Water',
		completed: false,
		priority: 'low',
	},
];

function App() {
	// states & effects -----------------
	const [tasks, setTasks] = useState<Task[]>(() => {
		const saved = localStorage.getItem('tasks');

		if (!saved) return initialTasks;

		try {
			const parsed: unknown = JSON.parse(saved);
			if (!Array.isArray(parsed)) return initialTasks;
			return parsed as Task[];
		} catch {
			return initialTasks;
		}
	});

	useEffect(() => {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}, [tasks]);

	const [title, setTitle] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState('');
	const [filter, setFilter] = useState<Filter>('all');
	const [query, setQuery] = useState('');
	const [priority, setPriority] = useState<Priority>('medium');

	//-------------------------

	// functions ----------
	function addTask() {
		const trimmed = title.trim();
		if (!trimmed) return;

		const newTask: Task = {
			id: crypto.randomUUID(),
			title: trimmed,
			completed: false,
			priority: priority,
		};

		setTasks((current) => [newTask, ...current]);
		setTitle('');
		setPriority('medium');
		if (filter === 'completed') {
			setFilter('active');
		}
	}

	function deleteTask(id: string) {
		setTasks((current) => current.filter((task) => task.id !== id));
	}

	function toggleTask(id: string) {
		setTasks((current) => current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
	}

	function startEdit(task: Task) {
		setEditingId(task.id);
		setEditTitle(task.title);
	}

	function saveEdit() {
		const trimmed = editTitle.trim();
		if (!trimmed) return;

		setTasks((current) => current.map((task) => (task.id === editingId ? { ...task, title: trimmed } : task)));
		setEditingId(null);
		setEditTitle('');
	}

	function changePriority(id: string, nextPriority: Priority) {
		setTasks((current) => current.map((task) => (task.id === id ? { ...task, priority: nextPriority } : task)));
	}

	// ---------------

	const visibleTasks = tasks.filter((task) => {
		const matchesQuery = task.title.toLowerCase().includes(query.trim().toLowerCase());

		if (!matchesQuery) return false;
		if (filter === 'active') return !task.completed;
		if (filter === 'completed') return task.completed;
		return true;
	});

	return (
		<main className="app">
			<h1>Task Manager</h1>
			<input
				className="input-field"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Add a task"
			/>
			<select
				className="priority-select"
				value={priority}
				onChange={(e) => setPriority(e.target.value as Priority)}
			>
				<option value="low">Low</option>
				<option value="medium">Medium</option>
				<option value="high">High</option>
			</select>
			<button className="add-button" type="button" onClick={addTask}>
				Add
			</button>
			<input
				className="search-field"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Search"
			/>
			<div className="filters">
				<button
					type="button"
					className={filter === 'all' ? 'filter-button is-active' : 'filter-button'}
					onClick={() => setFilter('all')}
				>
					All
				</button>
				<button
					type="button"
					className={filter === 'active' ? 'filter-button is-active' : 'filter-button'}
					onClick={() => setFilter('active')}
				>
					Active
				</button>
				<button
					type="button"
					className={filter === 'completed' ? 'filter-button is-active' : 'filter-button'}
					onClick={() => setFilter('completed')}
				>
					Completed
				</button>
			</div>
			<ul>
				{visibleTasks.map((task) => (
					<li className={task.completed ? 'list-item is-done' : 'list-item'} key={task.id}>
						<input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />

						{task.id === editingId ? (
							<input
								className="edit-field"
								value={editTitle}
								onChange={(e) => setEditTitle(e.target.value)}
							/>
						) : (
							<span className="title">{task.title}</span>
						)}
						<select
							className={`priority priority-${task.priority}`}
							value={task.priority}
							onChange={(e) => changePriority(task.id, e.target.value as Priority)}
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>

						{task.id === editingId ? (
							<button className="ghost-button" type="button" onClick={() => saveEdit()}>
								Save
							</button>
						) : (
							<button className="ghost-button" type="button" onClick={() => startEdit(task)}>
								Edit
							</button>
						)}
						<button className="delete-button" type="button" onClick={() => deleteTask(task.id)}>
							Delete
						</button>
					</li>
				))}
			</ul>
		</main>
	);
}

export default App;

