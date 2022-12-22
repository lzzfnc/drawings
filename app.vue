<template>
    <h1>Draw some 
    
    <ClientOnly>
    {{ message?.theme }}
    </ClientOnly>

    </h1>

    <svg
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				version="1.1"
				ref="svgElement"
				x="0px"
				y="0px"
				width="500px"
				height="500px"
				viewBox="0 0 500 500"
				enable-background="new 0 0 500 500"
				xml:space="preserve"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawing"
        @touchmove.prevent="draw"
        @touchend="stopDrawing"
        @touchcancel="stopDrawing"
    >
    </svg>
    <button @click="send">Send</button>
</template>

<script setup>

import { ref } from 'vue'

const { $socket } = useNuxtApp()
let message = ref(null)

const svgElement = ref(null)

onMounted(() => { 
  message = $socket?.message 
  rect = svgElement.value.getBoundingClientRect();
})


const strokeWidth = 10;
let bufferSize;
var rect = null

var path = null;
var strPath;
var buffer = [];


const startDrawing = (e) => {
  bufferSize = 1;
	path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("fill", "none");
	path.setAttribute("stroke", "currentColor");
	path.setAttribute("stroke-width", strokeWidth);
	buffer = [];
	var pt = getMousePosition(e);
	appendToBuffer(pt);
	strPath = "M" + pt.x + " " + pt.y;
	path.setAttribute("d", strPath);
	svgElement.value.appendChild(path);
}

const draw = (e) => {
  if (path) {
		appendToBuffer(getMousePosition(e));
		updateSvgPath();
	}
}

const stopDrawing = (e) => {
  if (path) {
		path = null;
	}
}

const getMousePosition = (e) => {
	return {
		x: e.pageX - rect.left,
		y: e.pageY - rect.top,
	};
};

const appendToBuffer = (pt) => {
	buffer.push(pt);
	while (buffer.length > bufferSize) {
		buffer.shift();
	}
};

const getAveragePoint = (offset) => {
	var len = buffer.length;
	if (len % 2 === 1 || len >= bufferSize) {
		var totalX = 0;
		var totalY = 0;
		var pt, i;
		var count = 0;
		for (i = offset; i < len; i++) {
			count++;
			pt = buffer[i];
			totalX += pt.x;
			totalY += pt.y;
		}
		return {
			x: totalX / count,
			y: totalY / count,
		};
	}
	return null;
};

const updateSvgPath =  () => {
	var pt = getAveragePoint(0);

	if (pt) {
		// Get the smoothed part of the path that will not change
		strPath += " L" + pt.x + " " + pt.y;

		// Get the last part of the path (close to the current mouse position)
		// This part will change if the mouse moves again
		var tmpPath = "";
		for (var offset = 2; offset < buffer.length; offset += 2) {
			pt = getAveragePoint(offset);
			tmpPath += " L" + pt.x + " " + pt.y;
		}

		// Set the complete current path coordinates
		path.setAttribute("d", strPath + tmpPath);
	}
};



const send = () => {


const paths = Array.from(svgElement.value.querySelectorAll("path")).reduce(
					(accumulator, current) => {
						return (accumulator += current.getAttribute("d"));
					},
					""
				);

  $socket.send(JSON.stringify({
    type: 'drawings',
    paths: paths
  }))

  for (const path of svgElement.value.querySelectorAll("path")) {
    path.remove()
  }

}



</script>