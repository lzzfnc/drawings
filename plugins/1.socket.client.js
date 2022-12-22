import { useWebSocket, useBrowserLocation } from "@vueuse/core";

export default defineNuxtPlugin(() => {
	const message = ref({});

	const location = useBrowserLocation();
	const { status, data, send, open, close } = useWebSocket(
		location.value.origin.replace("http", "ws")
	);

	watch(data, () => {
		try {
			message.value = JSON.parse(data.value);
		} catch (e) {}
	});

	return {
		provide: {
			socket: { status, data, message, send, open, close },
		},
	};
});
