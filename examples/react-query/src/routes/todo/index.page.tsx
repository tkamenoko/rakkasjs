import { useState } from "react";
import { Todo } from "./Todo";
import css from "./page.module.css";
import {
	Page,
	runServerSideMutation,
	runServerSideQuery,
	useRequestContext,
} from "rakkasjs";
import {
	useQueryClient,
	useSuspenseQuery,
	useMutation,
} from "@tanstack/react-query";

import { createTodo, readAllTodos } from "src/crud";

const TodoPage: Page = () => {
	const ctx = useRequestContext();
	const { data: todos } = useSuspenseQuery({
		queryKey: ["todos"],
		queryFn: () => runServerSideQuery(ctx, readAllTodos),
	});

	const [text, setText] = useState("");

	const client = useQueryClient();

	const { mutate: create } = useMutation({
		mutationFn: () =>
			runServerSideMutation(() =>
				createTodo({
					text,
					done: false,
				}),
			),
		onSuccess() {
			client.invalidateQueries({ queryKey: ["todos"], exact: true });
		},
	});

	return (
		<main>
			<h1>Todo</h1>

			<p>This is a simple todo application that demonstrates data fetching.</p>

			<ul className={css.todoList}>
				{todos.map((todo) => (
					<Todo key={todo.id} todo={todo} />
				))}
			</ul>

			<p className={css.p}>
				<input
					className={css.input}
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>

				<button
					type="button"
					className={css.addButton}
					disabled={!text}
					onClick={() => create()}
				>
					Add
				</button>
			</p>
		</main>
	);
};

export default TodoPage;

TodoPage.preload = (ctx) => {
	if (!ctx.reactQueryClient.getQueryData(["todos"])) {
		ctx.reactQueryClient.prefetchQuery({
			queryKey: ["todos"],
			queryFn: () => runServerSideQuery(ctx.requestContext, readAllTodos),
		});
	}
};
